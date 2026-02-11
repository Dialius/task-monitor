# Quick Backend Deploy ke Hostinger

## Step 1: Setup Node.js App di Hostinger

1. Login **Hostinger Panel**
2. Pilih **Advanced** → **Node.js**
3. Klik **Create Application**

**Settings:**
```
Application name: task-monitor-api
Application root: api
Application URL: api.yourdomain.com (atau subdomain lain)
Node.js version: 18.x
Application mode: Production
Application startup file: dist/index.js
```

4. Klik **Create**

---

## Step 2: Deploy Backend Code

### Via GitHub (Recommended)

1. **Buat subdomain untuk API:**
   - Hostinger Panel → **Domains**
   - Pilih domain Anda
   - **Subdomains** → **Create**
   - Subdomain: `api`
   - Document root: `/public_html/api`

2. **Connect GitHub:**
   - Di Node.js panel, pilih app yang baru dibuat
   - Klik **Connect to GitHub**
   - Pilih repository: `task-monitor` (yang ada backend)
   - Branch: `main`
   - Root directory: `/` (karena backend di root)

3. **Build Settings:**
   ```
   Build command: npm run build
   Install command: npm install
   Start command: node dist/index.js
   ```

### Via SSH (Alternative)

```bash
# SSH ke Hostinger
ssh u909490256@yourdomain.com -p 65002

# Navigate ke api folder
cd domains/yourdomain.com/public_html/api

# Clone repository
git clone https://github.com/YOUR_USERNAME/task-monitor.git .

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name task-monitor-api
pm2 save
```

---

## Step 3: Configure Environment Variables

Di Hostinger Node.js panel, tambahkan environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmonitor

# API Server
API_ENABLED=true
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS - Allow frontend domain
CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com

# Frontend URL
FRONTEND_URL=https://rosybrown-horse-106773.hostingersite.com

# Discord (optional)
DISCORD_ENABLED=false

# WhatsApp (optional)
WHATSAPP_ENABLED=false

# Notion (optional)
NOTION_API_KEY=your_key
NOTION_DATABASE_ID=your_db_id

# Groq AI (optional)
GROQ_API_KEY=your_key

# Logging
LOG_LEVEL=info
```

**PENTING:** Set `CORS_ORIGINS` ke domain frontend Anda!

---

## Step 4: Start Backend

Di Hostinger Node.js panel:
1. Klik **Start Application**
2. Wait 30 seconds
3. Check status: Should be "Running"

**Test API:**
```
https://api.yourdomain.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

## Step 5: Update Frontend Environment Variables

Sekarang backend sudah running di `api.yourdomain.com`, update frontend:

### Di Hostinger Panel (untuk auto-deploy):

1. Go to website settings
2. Environment Variables
3. Update:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_WS_URL=https://api.yourdomain.com
   ```
4. Redeploy frontend

### Atau Rebuild Locally:

```bash
cd frontend

# Update .env
echo "VITE_API_URL=https://api.yourdomain.com" > .env
echo "VITE_WS_URL=https://api.yourdomain.com" >> .env

# Rebuild
npm run build

# Upload dist/ ke Hostinger via File Manager
```

---

## Step 6: Test Login

1. Buka: https://rosybrown-horse-106773.hostingersite.com
2. Login:
   - Username: `admin`
   - Password: `admin123`
3. Should work! ✅

---

## Troubleshooting

### Login masih gagal

**Check browser console (F12):**
- Network tab
- Look for API calls
- Check error messages

**Common issues:**
1. **CORS error** → Update `CORS_ORIGINS` di backend env
2. **Connection refused** → Backend not running
3. **404 Not Found** → Wrong API URL

### Backend tidak start

**Check logs:**
```bash
ssh u909490256@yourdomain.com -p 65002
cd domains/yourdomain.com/public_html/api
pm2 logs task-monitor-api
```

**Common issues:**
1. **MongoDB connection failed** → Check MONGODB_URI
2. **Port already in use** → Change API_PORT
3. **Missing dependencies** → Run `npm install`

---

## Quick Fix: Pakai Domain Hostinger Langsung

Jika subdomain ribet, pakai port:

**Backend:**
```
URL: https://rosybrown-horse-106773.hostingersite.com:3001
```

**Frontend .env:**
```
VITE_API_URL=https://rosybrown-horse-106773.hostingersite.com:3001
VITE_WS_URL=https://rosybrown-horse-106773.hostingersite.com:3001
```

Tapi ini kurang bagus karena expose port.

---

## Recommended Architecture

```
Frontend: https://yourdomain.com
Backend:  https://api.yourdomain.com

atau

Frontend: https://rosybrown-horse-106773.hostingersite.com
Backend:  https://api-rosybrown-horse-106773.hostingersite.com
```

Clean dan professional! 🚀
