
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from server.llm import call_llm
from server.logger import logger
from server.dao.sqlite import delete_chatrecord

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

        try:
            content = await call_llm(
                user_prompt=data['prompt'],
                provider="google",
            )
    
        except RuntimeError as e:
            raise HTTPException(status_code=400, detail=str(e))
        return {"response": content}

    @app.post("/chat/clear")
    async def clear_chat_history():
        """Deletes all chat records from the database."""
        try:
            await delete_chatrecord()
            return {"message": "Chat history cleared successfully."}
        except Exception as e:
            logger.error(f"Failed to clear chat history: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to clear chat history.")
    
    # Catch-all route to serve the main index.html for any other path.
    # This is crucial for single-page applications (SPAs) like React.
    # It must be placed after all other API routes.
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        index_path = static_files_dir / "index.html"
        if not index_path.exists():
            raise HTTPException(status_code=404, detail="index.html not found")
        return FileResponse(index_path)


