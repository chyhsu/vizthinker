
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from pydantic import BaseModel
from typing import Dict
from server.llm import call_llm
from server.logger import logger
from server.dao.postgre import create_user, search_user

# Define the directory for static files (the 'dist' folder)
static_files_dir = Path(__file__).resolve().parent.parent / "dist"

class ApiKeyUpdate(BaseModel):
    provider: str
    api_key: str

class ApiKeysUpdate(BaseModel):
    api_keys: Dict[str, str]

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

    @app.post("/chat")
    async def chat_endpoint(request: Request):
        """Handle chat requests and store conversation records."""
        try:
            body = await request.json()
            prompt = body.get("prompt", "")
            provider = body.get("provider", "google")
            model = body.get("model")  # Optional model specification
            parent_id = body.get("parent_id")
            isBranch = body.get("isBranch", False)
            
            logger.info(f"Received chat request: prompt='{prompt}', provider='{provider}', model='{model}', parent_id={parent_id}, isBranch={isBranch}")
            
            if not prompt:
                raise HTTPException(status_code=400, detail="Prompt is required")
            
            # Call LLM
            response = await call_llm(prompt, provider, parent_id, model)
            
            # Store the conversation
            record_id = await store_one_chatrecord(prompt, response, parent_id, isBranch)
            
            return {
                "response": response,
                "record_id": record_id
            }
            
        except Exception as e:
            logger.error(f"Error in chat endpoint: {e}", exc_info=True)
            error_message = str(e)
            if "API key not set" in error_message:
                raise HTTPException(status_code=400, detail=f"API key not configured for {provider}. Please set it in the settings.")
            raise HTTPException(status_code=500, detail=f"Internal server error: {error_message}")

    @app.post("/chat/positions")
    async def save_positions_endpoint(request: Request):
        """Save node positions."""
        try:
            body = await request.json()
            positions = body.get("positions", [])
            await store_all_positions(positions)
            return {"status": "success"}
        except Exception as e:
            logger.error(f"Error saving positions: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/chat/records")
    async def get_chat_records():
        """Get all chat records."""
        try:
            records = await get_all_chatrecord()
            return {"records": records}
        except Exception as e:
            logger.error(f"Error getting chat records: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @app.delete("/chat/records")
    async def delete_all_records():
        """Delete all chat records."""
        try:
            await delete_all_chatrecord()
            return {"status": "success", "message": "All chat records deleted"}
        except Exception as e:
            logger.error(f"Error deleting all records: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @app.delete("/chat/records/{record_id}")
    async def delete_record(record_id: int):
        """Delete a specific chat record and its children."""
        try:
            await delete_single_chatrecord(record_id)
            return {"status": "success", "message": f"Record {record_id} and its children deleted"}
        except Exception as e:
            logger.error(f"Error deleting record {record_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/settings/api-keys")
    async def update_api_keys(api_keys_update: ApiKeysUpdate):
        """Update API keys configuration."""
        try:
            import os
            from dotenv import set_key, find_dotenv
            
            # Map frontend provider names to environment variable names
            env_var_mapping = {
                "google": "GEMINI_API_KEY",
                "openai": "OPENAI_API_KEY", 
                "anthropic": "CLAUDE_API_KEY",
                "x": "GROK_API_KEY"
            }
            
            # Find or create .env file
            env_file = find_dotenv()
            if not env_file:
                env_file = ".env"
            
            # Update environment variables
            updated_keys = []
            for provider, api_key in api_keys_update.api_keys.items():
                if provider in env_var_mapping:
                    env_var = env_var_mapping[provider]
                    if api_key.strip():  # Only set non-empty keys
                        set_key(env_file, env_var, api_key.strip())
                        # Also update the current process environment
                        os.environ[env_var] = api_key.strip()
                        updated_keys.append(provider)
                        logger.info(f"Updated API key for {provider}")
                    else:
                        # Remove empty keys from environment
                        set_key(env_file, env_var, "")
                        if env_var in os.environ:
                            del os.environ[env_var]
                        logger.info(f"Removed API key for {provider}")
            
            # Update the global api_key_map in llm.py
            from server.llm import api_key_map
            for provider in env_var_mapping:
                env_var = env_var_mapping[provider]
                api_key_map[provider] = os.getenv(env_var)
            
            return {
                "status": "success", 
                "message": f"API keys updated for providers: {', '.join(updated_keys) if updated_keys else 'none'}",
                "updated_providers": updated_keys
            }
            
        except Exception as e:
            logger.error(f"Error updating API keys: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to update API keys: {str(e)}")
    @app.post("/auth/login")
    async def login(request: Request):
        """Handle login requests."""
        try:
            body = await request.json()
            username = body.get("username", "")
            password = body.get("password", "")
            
            logger.info(f"Received login request: username='{username}'")
            
            if not username or not password:
                raise HTTPException(status_code=400, detail="Username and password are required")
            
            user_id, _, returned_password = await search_user(username)
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid username")
            if returned_password != password:
                raise HTTPException(status_code=401, detail="Invalid password")
            # For now, just log the credentials
            logger.info(f"Login attempt for user '{username}' with password '{password}'")
            
            return {"status": "success", "message": "Login successful", "user_id": user_id}
            
        except Exception as e:
            logger.error(f"Error in login endpoint: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    @app.post("/auth/signup")
    async def signup(request: Request):
        """Handle signup requests."""
        try:
            body = await request.json()
            username = body.get("username", "")
            password = body.get("password", "")
            
            logger.info(f"Received signup request: username='{username}'")
            
            if not username or not password:
                raise HTTPException(status_code=400, detail="Username and password are required")
            
            user_id = await create_user(username, password)
            if user_id is None:
                raise HTTPException(status_code=400, detail="Failed to create user")
            # For now, just log the credentials
            logger.info(f"Signup attempt for user '{username}' with password '{password}'")
            
            return {"status": "success", "message": "Signup successful", "user_id": user_id}
            
        except Exception as e:
            logger.error(f"Error in signup endpoint: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
    # Serve the main React app for all other routes
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve the React application for all unmatched routes."""
        index_file = static_files_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        else:
            raise HTTPException(status_code=404, detail="React app not found. Please run 'npm run build' first.")


