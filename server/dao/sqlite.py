import os
import json
import aiosqlite
from typing import Optional, List, Tuple
from dotenv import load_dotenv
load_dotenv()
from server.logger import logger
DB_PATH = os.getenv("VIZTHINK_DB", "vizthink.db")

async def init_db() -> None:
    logger.info(f"Initializing database at {DB_PATH}")
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS chatrecord (
                id INTEGER PRIMARY KEY,
                prompt TEXT,
                response TEXT,
                parent_id INTEGER,
                positions TEXT
            )
            """
        )
        # Check and add parent_id column if missing
        cursor = await db.execute("PRAGMA table_info(chatrecord)")
        columns = await cursor.fetchall()
        column_names = [col[1] for col in columns]
        if 'parent_id' not in column_names:
            await db.execute("ALTER TABLE chatrecord ADD COLUMN parent_id INTEGER")
        await db.commit()
        # Note: Removed automatic deletion of chat records on startup
        # This was causing issues with duplicate welcome nodes

async def store_chatrecord(prompt: str, response: str, parent_id: Optional[int] = None) -> int:
    """Store a single prompt/response pair along with the parent_id"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO chatrecord (prompt, response, parent_id) VALUES (?, ?, ?)",
            (prompt, response, parent_id),
        )
        new_id = cursor.lastrowid
        await db.commit()
        logger.info("Chat record saved with id %d.", new_id)
        return new_id

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

async def get_path_history(node_id: int) -> List[Tuple[str, str]]:
    history = []
    async with aiosqlite.connect(DB_PATH) as db:
        current = node_id
        while current is not None:
            cursor = await db.execute(
                "SELECT prompt, response, parent_id FROM chatrecord WHERE id = ?",
                (current,),
            )
            row = await cursor.fetchone()
            if row is None:
                break
            prompt, response, parent_id = row
            history.append((prompt, response))
            current = parent_id
    history.reverse()
    return history

async def get_chatrecord():
    """Return list of tuples: (id, prompt, response, positions, parent_id)"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id, prompt, response, positions, parent_id FROM chatrecord")
        rows = await cursor.fetchall()
        parsed = []
        for row in rows:
            id_, prompt, response, pos_json, parent_id = row
            positions = json.loads(pos_json) if pos_json else None
            parsed.append((id_, prompt, response, positions, parent_id))
        logger.info(f"Retrieved chatrecord: {parsed}")
        return parsed

async def delete_chatrecord():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM chatrecord")
        await db.commit()
        logger.info("Chat history cleared successfully.")

async def delete_single_chatrecord(node_id: int) -> bool:
    """Delete a single chat record by its ID and all its descendants
    
    Args:
        node_id: The ID of the node to delete
        
    Returns:
        bool: True if any records were deleted, False otherwise
    """
    async with aiosqlite.connect(DB_PATH) as db:
        # First, find all descendants recursively
        descendants = await _get_all_descendants(db, node_id)
        all_to_delete = [node_id] + descendants
        
        if not all_to_delete:
            logger.warning(f"No records found to delete for node_id: {node_id}")
            return False
        
        # Delete all nodes (parent and descendants)
        placeholders = ','.join('?' * len(all_to_delete))
        await db.execute(f"DELETE FROM chatrecord WHERE id IN ({placeholders})", all_to_delete)
        await db.commit()
        
        logger.info(f"Deleted {len(all_to_delete)} chat records: {all_to_delete}")
        return True

async def _get_all_descendants(db, parent_id: int) -> List[int]:
    """Recursively get all descendant IDs of a given parent node"""
    descendants = []
    
    # Get direct children
    cursor = await db.execute("SELECT id FROM chatrecord WHERE parent_id = ?", (parent_id,))
    children = await cursor.fetchall()
    
    for (child_id,) in children:
        descendants.append(child_id)
        # Recursively get descendants of this child
        child_descendants = await _get_all_descendants(db, child_id)
        descendants.extend(child_descendants)
    
    return descendants

