"""
後端部署配置
配置uvicorn服務器允許外部訪問
"""

# 服務器配置
SERVER_CONFIG = {
    "host": "0.0.0.0",  # 允許所有IP訪問
    "port": 8000,
    "workers": 4,
    "reload": False,  # 生產環境不使用reload
    "log_level": "info",
    "access_log": True,
}

# CORS配置 - 允許外部域名訪問
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