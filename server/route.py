
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from server.llm import call_llm
from server.logger import logger
from server.dao.sqlite import delete_chatrecord, get_chatrecord, store_chatrecord, store_positions

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
    
    @app.post("/chat/new")
    async def query_llm(request: Request):
        """Send a prompt to the LLM and return its response (and optionally save it)."""
        data = await request.json()
        positions = data.get("positions", [])
        logger.info(f"Received request data: {data}")

        try:
            content = await call_llm(
                user_prompt=data['prompt'],
                provider="google",
            )
        except RuntimeError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        try:
            await store_chatrecord(data['prompt'], content)
        except Exception as e:
            logger.error(f"Failed to save chat history: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to save chat history.")
        
        return {"response": content}

    @app.post("/chat/positions")
    async def update_positions(request: Request):
        """Update each chatrecord row with its current node position."""
        data = await request.json()
        positions = data.get("positions", [])
        try:
            await store_positions(positions)
            logger.info("Positions updated successfully.")
            return {"message": "Positions updated successfully."}
        except Exception as e:
            logger.error(f"Failed to update positions: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to update positions.")
    
    @app.get("/chat/get")
    async def get_chat_history():
        """Return all chat records along with saved node positions."""
        try:
            rows = await get_chatrecord()
            logger.info("Chat history retrieved successfully.")
            return {
                "message": "Chat history retrieved successfully.",
                "data": rows,
            }
        except Exception as e:
            logger.error(f"Failed to retrieve chat history: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to retrieve chat history.")
    @app.post("/chat/clear")
    async def clear_chat_history():
        """Deletes all chat records from the database."""
        try:
            await delete_chatrecord()
            logger.info("Chat history cleared successfully.")
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


