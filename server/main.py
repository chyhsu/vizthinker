from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiosqlite
import json
import os
import uuid
from typing import List
from contextlib import asynccontextmanager
from server.service import call_llm
from dotenv import load_dotenv
import logging
from fastapi import Request
load_dotenv()
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()        # runs at startup
    yield                  # application runs between here …
    # (optional) cleanup   # … and here on shutdown

app = FastAPI(title="VizThink AI Backend", lifespan=lifespan)

# Allow React (vite / CRA) dev server & Electron renderer process
ALLOWED_ORIGINS = [
    "http://localhost:3000",      # For create-react-app
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # For Vite dev server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Data models
# -----------------------------

class Position(BaseModel):
    x: float
    y: float

class Node(BaseModel):
    id: str
    content: str
    type: str  # "prompt" or "response"
    position: Position
    parent_id: str | None = None

class Edge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # "vertical" or "horizontal"

class Graph(BaseModel):
    id: str
    nodes: List[Node]
    edges: List[Edge]


# -----------------------------
# Database helpers
# -----------------------------

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



# -----------------------------
# Utility
# -----------------------------



# -----------------------------
# Routes
# -----------------------------

# Define the directory for static files (the 'dist' folder)
static_files_dir = Path(__file__).resolve().parent.parent / "dist"

# Mount the 'assets' directory from 'dist' at the '/assets' path
app.mount(
    "/assets",
    StaticFiles(directory=static_files_dir / "assets"),
    name="assets",
)

@app.get("/health")
async def health_check():
    """Simple health endpoint for monitoring."""
    return {"status": "ok"}

@app.post("/graphs")
async def save_graph(graph: Graph):
    """Create or update a graph."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR REPLACE INTO graphs (id, data) VALUES (?, ?)",
            (graph.id, graph.model_dump_json()),
        )
        await db.commit()
    return {"status": "saved", "graph_id": graph.id}

@app.get("/graphs/{graph_id}")
async def load_graph(graph_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT data FROM graphs WHERE id = ?", (graph_id,))
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Graph not found")
    return json.loads(row[0])

@app.get("/graphs")
async def list_graphs():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id FROM graphs")
        ids = [r[0] async for r in cursor]
    return {"graph_ids": ids}



@app.post("/llm")
async def query_llm(request: Request):
    """Send a prompt to the LLM and return its response (and optionally save it)."""
    data = await request.json()
    logging.info(f"Received request data: {data}")
    system_prompt = "You are a LLM chat box. Give resposnse within 300 tokens."
    try:
        logging.info("Sending prompt to LLM...")
        content = call_llm(
            system_prompt=system_prompt,
            user_prompt=data['prompt'],
            provider="google",
        )
        logging.info(f"Received response from LLM, length: {len(content)}")
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"response": content}


# Catch-all route to serve the main index.html for any other path.
# This is crucial for single-page applications (SPAs) like React.
# It must be placed after all other API routes.
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = static_files_dir / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_path)
