# 🚀 VizThinker 快速部署指南

此應用已配置為在服務器 `140.114.88.157` 上運行，支持外部訪問。

## 🎯 一鍵部署

```bash
# 確保您在項目根目錄
cd /home/jemmy/vizthinker

# 運行部署腳本
./deploy/deploy.sh
```

## 📋 部署前檢查清單

- [ ] 系統已安裝 Node.js 18+
- [ ] 系統已安裝 Python 3.10+
- [ ] 系統已安裝 nginx
- [ ] 系統已安裝 PostgreSQL
- [ ] 數據庫用戶 `root` 已創建，密碼為 `00000000`
- [ ] 數據庫 `mydb` 已創建
- [ ] 防火牆允許端口 80 和 8000

## 🌐 訪問地址

部署成功後，您可以通過以下地址訪問：

- **前端應用**: http://140.114.88.157
- **後端API**: http://140.114.88.157:8000
- **健康檢查**: http://140.114.88.157:8000/health

## 🔧 服務管理

```bash
# 檢查服務狀態
sudo systemctl status vizthinker-backend
sudo systemctl status nginx

# 重啟服務
sudo systemctl restart vizthinker-backend
sudo systemctl restart nginx

# 查看日誌
sudo journalctl -u vizthinker-backend -f
```

## 🧪 測試部署

```bash
# 運行測試腳本
./deploy/test-deployment.sh
```

## 📁 項目結構變更

以下文件已被修改/創建以支持部署：

### 新增文件：
- `deploy/deploy.sh` - 自動部署腳本
- `deploy/nginx.conf` - nginx 配置
- `deploy/vizthinker-backend.service` - systemd 服務文件
- `deploy/README.md` - 詳細部署文檔
- `deploy/test-deployment.sh` - 部署測試腳本
- `src/config/api.ts` - API 配置管理

### 修改文件：
- `server/main.py` - 更新 CORS 配置
- `src/typejs/store.ts` - 更新 API URL
- `src/typejs/auth.ts` - 更新 API URL
- `src/react/Settings.tsx` - 更新 API URL
- `src/typejs/export.ts` - 更新 API URL
- `config/vite.config.ts` - 添加生產環境配置
- `pyproject.toml` - 修復 poetry 配置問題

## 🔧 關鍵配置變更

1. **後端 CORS 配置**: 允許服務器 IP 訪問
2. **前端 API 配置**: 動態根據環境選擇 API URL
3. **nginx 反向代理**: 處理前端靜態文件和 API 路由
4. **systemd 服務**: 自動啟動後端服務

## 🆘 故障排除

如果遇到問題，請參考 `deploy/README.md` 中的詳細故障排除指南。

---

💡 **提示**: 首次部署可能需要幾分鐘時間來安裝依賴和配置服務。 