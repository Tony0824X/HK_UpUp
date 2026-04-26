# HK UpUp - 操作指南

## 📁 項目結構

```
HK_UpUp/
├── Data.xlsx          ← 比賽資料 (Single Source of Truth)
├── sync_db.py         ← Excel → Supabase 同步腳本
├── setup_supabase.py  ← 初始化腳本 (只需跑一次)
├── posters/           ← 從 Excel 提取的海報圖片
└── web/               ← Next.js 前端
    ├── .env.local     ← Supabase 連接配置
    └── src/
        ├── lib/supabase.js
        └── app/
            ├── globals.css
            ├── layout.js
            ├── page.js
            └── page.module.css
```

---

## 🔄 更新比賽資料

### 1. 編輯 Excel
打開 `Data.xlsx`，在 `Competitions` sheet 裡新增/修改比賽資料。

**欄位格式：**
| 欄位 | 格式 | 範例 |
|------|------|------|
| title | 文字 | `USHINE Case Competition 2026` |
| organizer | 文字 | `Deloitte` |
| registration_deadline | 日期 | `25-May-26` |
| tag | 逗號分隔 | `Innovation, IT, AI` |
| prizes | 逗號分隔 | `Certification, Cash Prize` |
| official_url | URL | `https://example.com` |
| poster_url | 嵌入圖片 | 直接在 Excel 貼圖片即可 |

> ⚠️ 海報圖片直接貼在 poster_url 欄位裡，腳本會自動提取。
> ⚠️ 圖片順序必須與資料行順序一致（第 1 張圖 = 第 1 行比賽）。

### 2. 同步到 DB
```bash
cd /Users/a1234/Desktop/HK_UpUp
python3 sync_db.py
```

### 3. 刷新網站
資料會即時更新，刷新 `http://localhost:3000` 即可看到。

---

## 🖥️ 啟動前端

```bash
cd /Users/a1234/Desktop/HK_UpUp/web
npm run dev
```

然後打開 http://localhost:3000

---

## 🗄️ Supabase 資訊

- **Dashboard**: https://supabase.com/dashboard/project/gbeqztmruwaigwphftlw
- **資料表**: `competitions`
- **Storage Bucket**: `posters` (公開)

---

## ⚡ 常用命令速查

| 操作 | 命令 |
|------|------|
| 同步 Excel 到 DB | `python3 sync_db.py` |
| 啟動前端 | `cd web && npm run dev` |
| 查看 DB 資料 | 去 Supabase Dashboard → Table Editor |
