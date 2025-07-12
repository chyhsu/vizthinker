import os
import aiosqlite
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
                response TEXT 
            )
            """
        )
        await delete_chatrecord()
        await db.commit()

async def store_chatrecord(prompt: str, response: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("INSERT INTO chatrecord (prompt, response) VALUES (?, ?)", (prompt, response))
        await db.commit()

async def get_chatrecord():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM chatrecord")
        rows = await cursor.fetchall()
        logger.info(f"Retrieved chatrecord: {rows}")
        return rows

async def delete_chatrecord():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM chatrecord")
        await db.commit()

