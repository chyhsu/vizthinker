
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from server.llm import call_llm
from server.logger import logger

# Import DB_PATH from sqlite
from server.dao.sqlite import DB_PATH

# Define the directory for static files (the 'dist' folder)
static_files_dir = Path(__file__).resolve().parent.parent / "dist"

def setup_routes(app: FastAPI):
    """Set up all routes for the application"""
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
    
    @app.post("/llm")
    async def query_llm(request: Request):
        """Send a prompt to the LLM and return its response (and optionally save it)."""
        data = await request.json()
        logger.info(f"Received request data: {data}")
        system_prompt = "You are a LLM chat box. Give resposnse within 300 tokens."
        try:
            content = call_llm(
                system_prompt=system_prompt,
                user_prompt=data['prompt'],
                provider="google",
            )
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


