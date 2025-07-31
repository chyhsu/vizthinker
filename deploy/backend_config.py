"""
Backend deployment configuration
Configure uvicorn server to allow external access
"""

# Server configuration
SERVER_CONFIG = {
    "host": "0.0.0.0",  # Allow all IP access
    "port": 8000,
    "workers": 4,
    "reload": False,  # Do not use reload in production
    "log_level": "info",
    "access_log": True,
}

# CORS configuration - Allow external domain access
CORS_ORIGINS = [
    "http://140.114.88.157",
    "http://140.114.88.157:80",
    "http://140.114.88.157:3000",
    "http://140.114.88.157:5173",
    "https://140.114.88.157",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
