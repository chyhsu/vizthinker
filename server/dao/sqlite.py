import os
import json
import aiosqlite
from dotenv import load_dotenv
load_dotenv()
from server.logger import logger
DB_PATH = os.getenv("VIZTHINK_DB", "vizthink.db")

async def init_db() -> None:
    logger.info(f"Initializing database at {DB_PATH}")
    async with aiosqlite.connect(DB_PATH) as db:
        await delete_chatrecord()
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS chatrecord (
                id INTEGER PRIMARY KEY,
                prompt TEXT,
                response TEXT,
                positions TEXT
            )
            """
        )
        await db.commit()

async def store_chatrecord(prompt: str, response: str):
    """Store a single prompt/response pair along with the entire graph positions list"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO chatrecord (prompt, response) VALUES (?, ?)",
            (prompt, response),
        )
        logger.info("Chat record saved.")
        await db.commit()

async def store_positions(positions: list[dict]):
    """Update each chatrecord row with its current node position.

    Assumes the order of ``positions`` matches the chronological order
    (and therefore the primary key) of chatrecord rows, i.e. the first
    prompt/response pair corresponds to node index 0, the second to 1, ….
    """
    async with aiosqlite.connect(DB_PATH) as db:
        for idx, pos in enumerate(positions, start=1):
            await db.execute(
                "UPDATE chatrecord SET positions = ? WHERE id = ?",
                (json.dumps(pos), idx),
            )
        logger.info("Updated positions for %d nodes.", len(positions))
        await db.commit()

async def get_chatrecord():
    """Return list of tuples: (prompt, response, positions:list|None)"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT prompt, response, positions FROM chatrecord")
        rows = await cursor.fetchall()
        parsed = []
        for prompt, response, pos_json in rows:
            positions = json.loads(pos_json) if pos_json else None
            parsed.append((prompt, response, positions))
        logger.info(f"Retrieved chatrecord: {parsed}")
        return parsed

async def delete_chatrecord():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM chatrecord")
        await db.commit()
        logger.info("Chat history cleared successfully.")

