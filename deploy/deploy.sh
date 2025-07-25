#!/bin/bash

# VizThinker 部署腳本
# 用於在服務器 140.114.88.157 上部署前後端應用

set -e  # 遇到錯誤時退出

echo "開始部署 VizThinker 應用..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ] || [ ! -f "pyproject.toml" ]; then
    echo "錯誤: 請在 VizThinker 項目根目錄中運行此腳本"
    exit 1
fi

# 1. 安裝前端依賴並構建
echo "🔧 安裝前端依賴..."
npm install

echo "🏗️ 構建前端應用..."
npm run build

# 2. 設置Python虛擬環境
echo "🐍 設置Python虛擬環境..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate

# 3. 安裝後端依賴
echo "📦 安裝後端依賴..."
pip install --upgrade pip
pip install poetry
poetry install --only=main --no-root

# 4. 設置PostgreSQL數據庫
echo "🗄️ 設置PostgreSQL數據庫..."

# 檢查PostgreSQL是否安裝
if ! command -v psql &> /dev/null; then
    echo "安裝PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
fi

# 啟動PostgreSQL服務
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 創建數據庫和用戶（如果不存在）
echo "設置數據庫用戶和數據庫..."
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='root'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER root WITH PASSWORD '00000000';"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='mydb'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE mydb OWNER root;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mydb TO root;"

echo "數據庫設置完成"

# 5. 配置nginx
echo "🌐 配置nginx..."

# 檢查nginx是否安裝
if ! command -v nginx &> /dev/null; then
    echo "安裝nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# 確保nginx目錄存在
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# 設置前端靜態文件目錄
echo "設置前端文件目錄..."
sudo mkdir -p /var/www/vizthinker
sudo cp -r dist/* /var/www/vizthinker/
sudo chown -R www-data:www-data /var/www/vizthinker

# 複製配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/vizthinker
sudo ln -sf /etc/nginx/sites-available/vizthinker /etc/nginx/sites-enabled/vizthinker
sudo rm -f /etc/nginx/sites-enabled/default

# 測試nginx配置
echo "測試nginx配置..."
sudo nginx -t

# 6. 設置systemd服務
echo "⚙️ 設置systemd服務..."
sudo cp deploy/vizthinker-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vizthinker-backend

# 7. 啟動服務
echo "🚀 啟動服務..."
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx

# 8. 檢查服務狀態
echo "✅ 檢查服務狀態..."
sudo systemctl status vizthinker-backend --no-pager
sudo systemctl status nginx --no-pager

# 9. 測試健康檢查
echo "🏥 測試後端健康檢查..."
sleep 5
curl -f http://127.0.0.1:8000/health || echo "後端健康檢查失敗"

echo "🎉 部署完成！"
echo "應用可以通過以下地址訪問："
echo "  - 前端: http://140.114.88.157"
echo "  - 後端API: http://140.114.88.157:8000"
echo ""
echo "要查看服務日誌，請使用："
echo "  sudo journalctl -u vizthinker-backend -f"
echo "  sudo journalctl -u nginx -f" 