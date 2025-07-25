# VizThinker 部署指南

此指南將幫助您在服務器 140.114.88.157 上部署 VizThinker 應用的前後端。

## 系統要求

- Ubuntu/Debian Linux
- Python 3.10+
- Node.js 18+
- nginx
- PostgreSQL
- sudo 權限

## 快速部署

1. **克隆項目到服務器**
   ```bash
   cd /home/jemmy
   git clone <your-repo-url> vizthinker
   cd vizthinker
   ```

2. **運行自動部署腳本**
   ```bash
   ./deploy/deploy.sh
   ```

## 手動部署步驟

如果自動部署腳本失敗，您可以按照以下步驟手動部署：

### 1. 安裝系統依賴

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝Python相關
sudo apt install -y python3 python3-pip python3-venv

# 安裝nginx
sudo apt install -y nginx

# 安裝PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### 2. 配置PostgreSQL

```bash
# 切換到postgres用戶
sudo -u postgres psql

-- 在PostgreSQL shell中執行：
CREATE USER root WITH PASSWORD '00000000';
CREATE DATABASE mydb OWNER root;
GRANT ALL PRIVILEGES ON DATABASE mydb TO root;
\q
```

### 3. 構建前端

```bash
cd /home/jemmy/vizthinker
npm install
npm run build
```

### 4. 設置後端

```bash
# 創建虛擬環境
python3 -m venv .venv
source .venv/bin/activate

# 安裝依賴
pip install --upgrade pip
pip install poetry
poetry install --only=main --no-root
```

### 5. 配置nginx

```bash
# 設置前端靜態文件目錄
sudo mkdir -p /var/www/vizthinker
sudo cp -r dist/* /var/www/vizthinker/
sudo chown -R www-data:www-data /var/www/vizthinker

# 複製配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/vizthinker
sudo ln -sf /etc/nginx/sites-available/vizthinker /etc/nginx/sites-enabled/vizthinker
sudo rm -f /etc/nginx/sites-enabled/default

# 測試配置
sudo nginx -t

# 重啟nginx
sudo systemctl restart nginx
```

### 6. 設置systemd服務

```bash
# 複製服務文件
sudo cp deploy/vizthinker-backend.service /etc/systemd/system/

# 重載systemd並啟動服務
sudo systemctl daemon-reload
sudo systemctl enable vizthinker-backend
sudo systemctl start vizthinker-backend
```

## 服務管理

### 檢查服務狀態
```bash
sudo systemctl status vizthinker-backend
sudo systemctl status nginx
```

### 查看日誌
```bash
# 後端日誌
sudo journalctl -u vizthinker-backend -f

# nginx日誌
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 重啟服務
```bash
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx
```

## 訪問應用

- **前端**: http://140.114.88.157
- **後端API**: http://140.114.88.157:8000
- **健康檢查**: http://140.114.88.157:8000/health

## 防火牆配置

確保防火牆允許以下端口：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

## 故障排除

### 1. 前端無法加載
- 檢查 `dist` 目錄是否存在並包含構建文件
- 檢查nginx配置和權限

### 2. 後端API錯誤
- 檢查數據庫連接
- 查看後端服務日誌
- 確認環境變量和配置

### 3. CORS錯誤
- 檢查後端的CORS配置
- 確認前端API URL配置正確

### 4. 數據庫連接失敗
- 確認PostgreSQL服務運行中
- 檢查數據庫用戶和密碼
- 確認數據庫存在

## 更新部署

要更新應用：

```bash
cd /home/jemmy/vizthinker
git pull
npm run build
sudo systemctl restart vizthinker-backend
```

## 安全建議

1. 定期更新系統和依賴
2. 配置SSL證書（Let's Encrypt）
3. 設置適當的防火牆規則
4. 定期備份數據庫
5. 監控服務日誌 