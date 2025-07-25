from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager
from server.dao.postgre import init_db
from server.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    await init_db()        # runs at startup
    yield                  # application runs between here …
    logger.info("Shutting down...") # (optional) cleanup   # … and here on shutdown

app = FastAPI(title="VizThinker AI Backend", lifespan=lifespan)

# Attempt to import CORS configuration from deployment settings
try:
    from deploy.backend_config import CORS_ORIGINS
    cors_origins = CORS_ORIGINS
except ImportError:
    # Use default configuration if unable to import deployment settings
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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


# Import routes after app is defined
from server.route import setup_routes

# Set up all routes
setup_routes(app)
