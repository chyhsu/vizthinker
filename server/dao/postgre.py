from __future__ import annotations
import psycopg2

import os
import json
from typing import Optional, List, Tuple, Any

import asyncpg
from dotenv import load_dotenv

from server.logger import logger

config ={
    "host": "localhost",
    "port": 5432,
    "user": "root",
    "password": "00000000",
    "dbname": "mydb",
}

# Global connection pool
_pool: Optional[asyncpg.Pool] = None


async def _get_pool() -> asyncpg.Pool:
    """Create (or return existing) asyncpg connection pool."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            host=config["host"],
            port=config["port"],
            user=config["user"],
            password=config["password"],
            database=config["dbname"],
            min_size=1,
            max_size=5,
        )
        logger.info("PostgreSQL connection pool created.")
    return _pool


CREATE_CHATRECORD = """
CREATE TABLE IF NOT EXISTS chatrecords (
    id         serial PRIMARY KEY,
    user_id    integer REFERENCES users(id) ON DELETE CASCADE,
    messages   integer[]
);
"""
CREATE_USER = """
CREATE TABLE IF NOT EXISTS users (
    id       serial PRIMARY KEY,
    username text UNIQUE NOT NULL,
    password text NOT NULL,
    chatrecords integer[]

);
"""
CREATE_MESSAGES = """
CREATE TABLE IF NOT EXISTS messages (
    id         serial PRIMARY KEY,
    chatrecord_id integer REFERENCES chatrecords(id) ON DELETE CASCADE,
    prompt     text,
    response   text,
    parent_id  integer,
    positions  jsonb,
    isbranch   boolean
);
"""

async def init_db() -> None:
    """Ensure schema exists."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        # Create tables in dependency order: users -> chatrecords -> messages
        await conn.execute(CREATE_USER)
        await conn.execute(CREATE_CHATRECORD)
        await conn.execute(CREATE_MESSAGES)
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS chatrecords integer[] REFERENCES chatrecords(id) ON DELETE CASCADE;")
        await conn.execute("ALTER TABLE chatrecords ADD COLUMN IF NOT EXISTS messages integer[] REFERENCES messages(id) ON DELETE CASCADE;")
    # sanity-check credentials
    async with pool.acquire() as con:
        who = await con.fetchval("select current_user")
        db= await con.fetchval("select current_database()")
        logger.info("Connected as '%s' to database '%s'", who, db)
    
    logger.info("PostgreSQL schema ensured.")


# ---------------------------------------------------------------------------
# DAO helper functions (API compatible with previous sqlite.py)
# ---------------------------------------------------------------------------
async def search_user(username: str) -> Optional[Tuple[int, str, str]]:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id,username, password, chatrecords FROM users WHERE username = $1",
            username,
        )
        return row["id"], row["username"], row["password"], row["chatrecords"] if row else None
    
async def create_user(username: str, password: str) -> int:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
                username,
                password,
            )
            return row["id"]
        except asyncpg.UniqueViolationError:
            # Username already exists
            raise ValueError("Username already exists")

async def delete_user(user_id: int) -> None:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM users WHERE id = $1", user_id)

async def create_chatrecord(user_id: int) -> int:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO chatrecords (user_id) VALUES ($1) RETURNING id",
            user_id,
        )
        await conn.execute("UPDATE users SET chatrecords = array_append(chatrecords, $1) WHERE id = $2", row["id"], user_id)
        return row["id"]

async def delete_chatrecord(chatrecord_id: int) -> None:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM chatrecords WHERE id = $1", chatrecord_id)
        await conn.execute("DELETE FROM messages WHERE chatrecord_id = $1", chatrecord_id)
        await conn.execute("UPDATE users SET chatrecords = array_remove(chatrecords, $1) WHERE id = $2", chatrecord_id, user_id)

async def get_messages(chatrecord_id: int) -> Optional[List[Tuple[int, int, str, str, Any, Optional[int], bool]]]:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, chatrecord_id, prompt, response, parent_id,positions,isbranch FROM messages WHERE chatrecord_id = $1",
            chatrecord_id,
        )
        if rows is None:
            return None
        for row in rows:
            logger.info(type(row["positions"]))
        def parse_position(pos_str):
            if not pos_str:
                return None
            try:
                # Try to parse as JSON
                parsed = json.loads(pos_str)
                # Validate that it's a proper position object
                if isinstance(parsed, dict) and 'x' in parsed and 'y' in parsed:
                    return parsed
                else:
                    logger.warning("Invalid position format: %s", pos_str)
                    return None
            except (json.JSONDecodeError, TypeError) as e:
                logger.warning("Failed to parse position '%s': %s", pos_str, e)
                return None
        
        return [
            (
                row["id"],
                row["chatrecord_id"],
                row["prompt"],
                row["response"],
                parse_position(row["positions"]),
                row["parent_id"],
                row["isbranch"],
            )
            for row in rows
        ]

async def store_one_message(
    chatrecord_id: int,
    prompt: str,
    response: str,
    parent_id: Optional[int] = None,
    position: Optional[dict] = None,
    isbranch: bool = False,
) -> int:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO messages (chatrecord_id, prompt, response, parent_id, positions, isbranch)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            """,
            chatrecord_id,
            prompt,
            response,
            parent_id,
            position,
            isbranch,
        )
        await conn.execute("UPDATE chatrecords SET messages = array_append(messages, $1) WHERE id = $2", row["id"], chatrecord_id)

        new_id = row["id"]  # type: ignore[index]
        logger.info("Message saved with id %d in chatrecords %d.", new_id, chatrecord_id)
        return new_id


async def store_all_positions(chatrecord_id: int, positions: str):
    pool = await _get_pool()
    async with pool.acquire() as conn:
        logger.info("Storing positions for chatrecord %d.", chatrecord_id)
        logger.info("Positions: %s", positions)
        
        # Parse the JSON string to get the positions array
        try:
            positions_array = json.loads(positions)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in positions: %s", positions)
            return 0
            
        chat_row = await conn.fetchrow(
            "SELECT messages FROM chatrecords WHERE id = $1",
            chatrecord_id,
        )
        if chat_row and chat_row["messages"]:
            msg_id_list: List[int] = chat_row["messages"]  
            msg_rows = [{"id": mid} for mid in msg_id_list]
        else:
            msg_rows = await conn.fetch(
                "SELECT id FROM messages WHERE chatrecord_id = $1 ORDER BY id",
                chatrecord_id,
            )
        if not msg_rows:
            logger.warning("No messages found for chatrecord_id=%d", chatrecord_id)
            return 0

        count = min(len(msg_rows), len(positions_array))
        async with conn.transaction():
            for i in range(count):
                msg_id = msg_rows[i]["id"]
                await conn.execute(
                    "UPDATE messages SET positions = $1 WHERE id = $2",
                    json.dumps(positions_array[i]),
                    msg_id,
                )
        logger.info("Updated positions for %d messages in chatrecords %d.", count, chatrecord_id)
        return count


async def get_path_history(message_id: int) -> List[Tuple[str, str]]:
    pool = await _get_pool()
    history: List[Tuple[str, str]] = []
    async with pool.acquire() as conn:
        current = message_id
        while current is not None:
            row = await conn.fetchrow(
                "SELECT prompt, response, parent_id FROM messages WHERE id = $1",
                current,
            )
            if row is None:
                break
            history.append((row["prompt"], row["response"]))
            current = row["parent_id"]
    history.reverse()
    return history


async def delete_all_messages(chatrecord_id: int) -> None:
    pool = await _get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM messages WHERE chatrecord_id = $1", chatrecord_id)
        await conn.execute("UPDATE chatrecords SET messages = '{}' WHERE id = $1", chatrecord_id)
    logger.info("Chat history cleared successfully.")


async def delete_single_message(chatrecord_id: int, message_id: int) -> bool:
    """Delete a single chat record and its descendants."""
    pool = await _get_pool()
    async with pool.acquire() as conn:
        ids_to_delete = await _get_all_descendants(conn, message_id)
        ids_to_delete.append(message_id)
        if not ids_to_delete:
            logger.warning("No records found to delete for message_id=%d", message_id)
            return False
        logger.info("Deleting %d chat records: %s", len(ids_to_delete), ids_to_delete)
        await conn.execute(
            "DELETE FROM messages WHERE id = ANY($1::int[])",
            ids_to_delete,
        )
        await conn.execute("UPDATE chatrecords SET messages = array_remove(messages, $1) WHERE id = $2", message_id, chatrecord_id)
        return True


async def _get_all_descendants(conn: asyncpg.Connection, parent_id: int) -> List[int]:
    """Recursively collect all descendant IDs of a parent node."""
    descendants: List[int] = []
    rows = await conn.fetch("SELECT id FROM messages WHERE parent_id = $1", parent_id)
    for r in rows:  
        cid = r["id"]
        descendants.append(cid)
        descendants.extend(await _get_all_descendants(conn, cid))
    return descendants

