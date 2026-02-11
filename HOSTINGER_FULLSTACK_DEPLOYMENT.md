# Deploy Full-Stack ke Hostinger (Backend + Frontend)

## Arsitektur

```
Hostinger Business Plan
├── Backend (Node.js App)
│   ├── Domain: api.yourdomain.com
│   ├── Port: 3001
│   └── Bot + API Server
│
└── Frontend (Static Site)
    ├── Domain: yourdomain.com
    └── Dashboard (Vite build)
```

## Prerequisites

- Hostinger Business plan atau lebih tinggi
- Domain sudah pointing ke Hostinger
- SSH access enabled

---

## Part 1: Deploy Backend (Bot + API)

### Step 1: Setup Node.js App di Hostinger

1. Login ke **Hostinger Panel**
2. Pilih **Advanced** → **Node.js**
3. Klik **Create Application**

Settings:
```
Application name: task-monitor-bot
Application root: /public_html/api
Application URL: api.yourdomain.com (atau subdomain lain)
Node.js version: 18.x
Application mode: Production
Application startup file: dist/index.js
```

### Step 2: Upload Backend Code

**Via Git (Recommended):**

1. SSH ke Hostinger:
   ```bash
   ssh u909490256@yourdomain.com -p 65002
   ```

2. Navigate ke application root:
   ```bash
   cd public_html/api
   ```

3. Clone repository:
   ```bash
   git clone https://github.com/yourusername/task-monitor.git .
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Build:
   ```bash
   npm run build
   ```

**Via File Manager:**

1. Build locally:
   ```bash
   npm run build
   ```

2. Upload via File Manager:
   - Upload folder `dist/`
   - Upload `package.json`
   - Upload `node_modules/` (atau install via SSH)

### Step 3: Configure Environment Variables

Di Hostinger Node.js panel, tambahkan environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmonitor

# Discord
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
DISCORD_CHANNEL_ID=your_channel_id

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=your_group_id

# Notion
NOTION_API_KEY=your_notion_key
NOTION_DATABASE_ID=your_database_id

# Groq AI
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.1-70b-versatile

# Gemini AI
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# API Server
API_ENABLED=true
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS - Allow frontend domain
CORS_ORIGINS=https://yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### Step 4: Start Backend

Di Hostinger Node.js panel:
1. Klik **Start Application**
2. Check logs untuk memastikan running
3. Test API: `https://api.yourdomain.com/health`

---

## Part 2: Deploy Frontend (Dashboard)

### Step 1: Update Frontend Environment Variables

Edit `frontend/.env`:

```env
# API URL - Pakai subdomain backend
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

### Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

Folder `dist/` akan berisi static files.

### Step 3: Upload Frontend

**Via File Manager:**

1. Login Hostinger Panel
2. File Manager → `public_html/`
3. Delete semua file di public_html (backup dulu!)
4. Upload semua dari `frontend/dist/`:
   - `index.html`
   - `assets/` folder
   - `.htaccess`
   - `_redirects`
   - `vite.svg`

**Via SSH:**

```bash
cd public_html
rm -rf * (backup dulu!)
cd ~/frontend
cp -r dist/* ../public_html/
```

### Step 4: Configure .htaccess

Pastikan `.htaccess` di public_html:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Part 3: Setup Subdomain untuk Backend

### Step 1: Create Subdomain

1. Hostinger Panel → **Domains**
2. Klik domain Anda
3. **Subdomains** → **Create Subdomain**
4. Subdomain: `api`
5. Document root: `/public_html/api`

### Step 2: Point ke Node.js App

Di Node.js panel:
1. Edit application
2. Set Application URL: `api.yourdomain.com`
3. Restart application

---

## Part 4: SSL Setup

### Enable SSL untuk Main Domain

1. Hostinger Panel → **SSL**
2. Pilih domain utama
3. Install **Free SSL** (Let's Encrypt)
4. Enable **Force HTTPS**

### Enable SSL untuk Subdomain API

1. Hostinger Panel → **SSL**
2. Pilih `api.yourdomain.com`
3. Install **Free SSL**
4. Enable **Force HTTPS**

---

## Part 5: Keep Bot Running (PM2)

Bot perlu running 24/7. Install PM2:

### Via SSH:

```bash
cd public_html/api
npm install -g pm2

# Start bot dengan PM2
pm2 start dist/index.js --name task-monitor-bot

# Save PM2 config
pm2 save

# Setup auto-restart
pm2 startup
```

### Configure PM2 di Hostinger

Buat file `ecosystem.config.js` di root:

```javascript
module.exports = {
  apps: [{
    name: 'task-monitor-bot',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3001
    }
  }]
}
```

Start dengan PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Testing

### Test Backend API

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX..."
}
```

### Test Frontend

1. Buka: `https://yourdomain.com`
2. Login: admin / admin123
3. Check WebSocket connection
4. Test bot controls

### Test Bot

Send command via WhatsApp:
```
/status
```

Bot harus respond.

---

## Troubleshooting

### Backend tidak start

**Check logs:**
```bash
cd public_html/api
pm2 logs task-monitor-bot
```

**Common issues:**
- Port 3001 already in use → Change port
- MongoDB connection failed → Check MONGODB_URI
- Missing dependencies → Run `npm install`

### Frontend tidak load

**Check:**
- File permissions: `chmod -R 755 public_html`
- .htaccess exists
- Browser console for errors

### WebSocket connection failed

**Check:**
- Backend running: `pm2 status`
- CORS settings di backend
- SSL enabled untuk api subdomain
- Firewall allow port 3001

### Bot disconnect sering

**Hostinger limitations:**
- Shared hosting bisa restart process
- Resource limits bisa trigger suspend
- WhatsApp connection butuh stable network

**Solutions:**
- Use PM2 auto-restart
- Monitor dengan `pm2 monit`
- Consider VPS jika masih bermasalah

---

## File Structure di Hostinger

```
public_html/
├── api/                          # Backend (Node.js app)
│   ├── dist/                     # Compiled backend
│   ├── node_modules/
│   ├── auth_info/                # WhatsApp session
│   ├── logs/                     # Bot logs
│   ├── package.json
│   └── ecosystem.config.js       # PM2 config
│
├── assets/                       # Frontend assets
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── .htaccess                     # Apache config
├── index.html                    # Frontend entry
└── vite.svg
```

---

## Maintenance

### Update Backend

```bash
cd public_html/api
git pull
npm install
npm run build
pm2 restart task-monitor-bot
```

### Update Frontend

```bash
# Local
cd frontend
npm run build

# Upload dist/ ke public_html via File Manager
```

### Monitor Bot

```bash
pm2 status
pm2 logs task-monitor-bot
pm2 monit
```

---

## Important Notes

⚠️ **Hostinger Shared Hosting Limitations:**

1. **Resource Limits**: Bot + API bisa exceed limits
2. **Process Restart**: Shared hosting bisa restart tanpa notice
3. **WhatsApp Connection**: Butuh stable connection, shared hosting tidak ideal
4. **Background Process**: Bisa di-kill jika resource usage tinggi

**Jika bot sering disconnect atau suspend:**
- Consider upgrade ke VPS
- Atau split: Backend di VPS, Frontend di Hostinger

---

## Checklist

- [ ] Backend deployed ke api.yourdomain.com
- [ ] Frontend deployed ke yourdomain.com
- [ ] SSL enabled untuk both domains
- [ ] Environment variables configured
- [ ] PM2 running backend
- [ ] Bot responding to commands
- [ ] Dashboard accessible
- [ ] WebSocket connection works
- [ ] Real-time logs works

---

## Next Steps

1. Monitor bot stability selama 24-48 jam
2. Check resource usage di Hostinger panel
3. Jika ada masalah, consider VPS migration
4. Setup monitoring alerts
5. Backup database regularly

---

## Support

Jika ada masalah:
1. Check PM2 logs: `pm2 logs`
2. Check Hostinger error logs
3. Contact Hostinger support
4. Consider VPS if shared hosting tidak cukup
