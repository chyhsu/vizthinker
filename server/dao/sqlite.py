import sqlite3
import os
import logging
import aiosqlite
from dotenv import load_dotenv
load_dotenv()

DB_PATH = os.getenv("VIZTHINK_DB", "vizthink.db")

async def init_db() -> None:
    logging.info(f"Initializing database at {DB_PATH}")
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS graphs (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL
            )
            """
        )
        await db.commit()




