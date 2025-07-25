#!/bin/bash

# VizThinker 部署測試腳本
# 用於測試部署是否成功

echo "🧪 測試 VizThinker 部署..."

# 測試後端健康檢查
echo "測試後端健康檢查..."
if curl -f -s http://127.0.0.1:8000/health > /dev/null; then
    echo "✅ 後端健康檢查通過"
else
    echo "❌ 後端健康檢查失敗"
    exit 1
fi

# 測試前端是否可訪問
echo "測試前端是否可訪問..."
if curl -f -s http://140.114.88.157 > /dev/null; then
    echo "✅ 前端可以訪問"
else
    echo "❌ 前端無法訪問"
fi

# 檢查服務狀態
echo "檢查服務狀態..."
if systemctl is-active --quiet vizthinker-backend; then
    echo "✅ 後端服務運行中"
else
    echo "❌ 後端服務未運行"
fi

if systemctl is-active --quiet nginx; then
    echo "✅ nginx 服務運行中"
else
    echo "❌ nginx 服務未運行"
fi

# 檢查端口監聽
echo "檢查端口監聽..."
if ss -tlnp | grep -q :8000; then
    echo "✅ 端口 8000 正在監聽"
else
    echo "❌ 端口 8000 未在監聽"
fi

if ss -tlnp | grep -q :80; then
    echo "✅ 端口 80 正在監聽"
else
    echo "❌ 端口 80 未在監聽"
fi

echo "🎉 測試完成！" 