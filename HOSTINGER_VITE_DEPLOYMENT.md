# Panduan Deploy Dashboard ke Hostinger

## 📋 Prerequisites

- Akun Hostinger dengan paket Business atau lebih tinggi
- Repository GitHub (optional, tapi recommended)
- Domain sudah pointing ke Hostinger

## 🎯 Metode Deployment

### Metode 1: GitHub Auto-Deploy (RECOMMENDED) ⭐

Ini metode paling mudah dan otomatis!

#### Step 1: Push ke GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/task-monitor-dashboard.git
git push -u origin main
```

#### Step 2: Connect ke Hostinger

1. Login ke **Hostinger Panel**: https://hpanel.hostinger.com
2. Pilih **Websites** dari sidebar
3. Klik **Add Website**
4. Pilih **Connect to GitHub**
5. Authorize Hostinger untuk akses GitHub
6. Pilih repository: `task-monitor-dashboard`
7. Pilih branch: `main`

#### Step 3: Configure Build Settings

Hostinger akan auto-detect Vite, tapi pastikan settings ini:

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

#### Step 4: Environment Variables

Di Hostinger panel, tambahkan environment variables:

```
VITE_API_URL=https://your-vps-ip:3001
VITE_WS_URL=https://your-vps-ip:3001
```

Atau jika sudah punya domain untuk API:

```
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

#### Step 5: Deploy!

1. Klik **Deploy**
2. Tunggu proses build (2-5 menit)
3. Dashboard akan live di domain Anda!

#### Auto-Deploy on Push

Setiap kali push ke GitHub, Hostinger akan otomatis rebuild dan deploy! 🎉

---

### Metode 2: Manual Upload via File Manager

Jika tidak mau pakai GitHub integration.

#### Step 1: Build Locally

```bash
cd frontend
npm install
npm run build
```

Folder `dist/` akan berisi file production-ready.

#### Step 2: Upload ke Hostinger

1. Login ke **Hostinger Panel**
2. Pilih **File Manager**
3. Navigate ke `public_html/`
4. **Delete semua file** di public_html (backup dulu jika ada)
5. Upload semua file dari folder `dist/`:
   - `index.html`
   - `assets/` folder
   - `vite.svg`
6. Upload file `.htaccess` dari root frontend ke public_html

#### Step 3: Configure .htaccess

Pastikan file `.htaccess` ada di public_html dengan content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Step 4: Test

Buka domain Anda di browser, dashboard harus muncul!

---

### Metode 3: SSH + Git (Advanced)

Untuk yang suka command line.

#### Step 1: SSH ke Hostinger

```bash
ssh u123456789@yourdomain.com -p 65002
```

Port dan username bisa dilihat di Hostinger panel → SSH Access.

#### Step 2: Navigate ke public_html

```bash
cd domains/yourdomain.com/public_html
```

#### Step 3: Clone Repository

```bash
# Backup existing files
mkdir ../backup
mv * ../backup/

# Clone repo
git clone https://github.com/username/task-monitor-dashboard.git .
cd frontend
```

#### Step 4: Install & Build

```bash
# Install Node.js 18 (jika belum ada)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install dependencies
npm install

# Build
npm run build
```

#### Step 5: Move Build Files

```bash
# Copy dist files to public_html
cp -r dist/* ../
cp .htaccess ../

# Cleanup
cd ..
rm -rf frontend
```

#### Step 6: Set Permissions

```bash
chmod -R 755 public_html
```

---

## 🔧 Configuration Files

### package.json

Pastikan ada:

```json
{
  "name": "task-monitor-dashboard",
  "type": "module",
  "scripts": {
    "build": "tsc -b && vite build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  }
})
```

### .htaccess (PENTING!)

File ini WAJIB ada di public_html untuk SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🌐 Domain & SSL Setup

### Setup Domain

1. Di Hostinger panel, pilih **Domains**
2. Klik domain Anda
3. Pastikan pointing ke hosting yang benar
4. Wait for DNS propagation (max 24 jam)

### Enable SSL (HTTPS)

1. Di Hostinger panel, pilih **SSL**
2. Klik **Install SSL**
3. Pilih **Free SSL** (Let's Encrypt)
4. Wait 5-10 menit
5. Enable **Force HTTPS**

### Update Environment Variables

Setelah SSL aktif, update `.env`:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

Rebuild dan deploy ulang!

---

## 🔐 Backend API Setup

Dashboard butuh backend API running. Ada 2 opsi:

### Option A: Backend di VPS Terpisah (RECOMMENDED)

Backend tetap di VPS ($4.99/month), frontend di Hostinger.

**Pros:**
- Backend punya resource dedicated
- Bisa run bot 24/7
- Lebih flexible

**Setup:**
1. Backend running di VPS: `http://your-vps-ip:3001`
2. Frontend di Hostinger: `https://yourdomain.com`
3. Set CORS di backend untuk allow frontend domain
4. Set environment variables di frontend

### Option B: Backend di Hostinger (NOT RECOMMENDED)

Hostinger Business bisa run Node.js, tapi:

**Cons:**
- Shared hosting = limited resources
- Tidak ideal untuk bot yang run 24/7
- Bisa kena suspend jika resource usage tinggi

**Jika tetap mau:**
1. Upload backend code ke subdomain: `api.yourdomain.com`
2. Setup Node.js app di Hostinger panel
3. Configure PM2 atau forever untuk keep alive
4. Set environment variables

---

## 🐛 Troubleshooting

### 1. "Framework tidak kompatibel atau struktur project tidak valid"

**Solusi:**
- Pastikan `package.json` ada di root folder yang di-push
- Pastikan ada `vite.config.ts`
- Pastikan `"type": "module"` ada di package.json
- Coba push ulang dengan struktur yang benar

### 2. Build Error: "Cannot find module"

**Solusi:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 3. 404 Error saat navigate ke route lain

**Solusi:**
- Pastikan file `.htaccess` ada di public_html
- Check isi `.htaccess` sesuai template di atas
- Restart Apache (di Hostinger panel)

### 4. Blank page / White screen

**Solusi:**
- Check browser console untuk error
- Pastikan base path benar di vite.config.ts
- Check file permissions: `chmod -R 755 public_html`

### 5. WebSocket connection failed

**Solusi:**
- Pastikan backend API running
- Check VITE_WS_URL di environment variables
- Check CORS settings di backend
- Pastikan firewall allow WebSocket connections

### 6. CSS tidak load

**Solusi:**
- Check network tab di browser DevTools
- Pastikan path ke assets benar
- Clear browser cache
- Rebuild dengan `npm run build`

### 7. Environment variables tidak work

**Solusi:**
- Pastikan prefix `VITE_` di semua env vars
- Rebuild setelah update env vars
- Check di browser console: `import.meta.env`

---

## 📊 Performance Optimization

### 1. Enable Gzip Compression

Tambahkan di `.htaccess`:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching

Tambahkan di `.htaccess`:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Code Splitting

Sudah dihandle di `vite.config.ts`:

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      'react-vendor': ['react', 'react-dom'],
      'ui-vendor': ['lucide-react', 'recharts'],
    }
  }
}
```

---

## 🎯 Checklist Deployment

- [ ] Code di-push ke GitHub
- [ ] Repository connected ke Hostinger
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deploy successful
- [ ] Domain accessible
- [ ] SSL enabled (HTTPS)
- [ ] SPA routing works (test navigate)
- [ ] WebSocket connection works
- [ ] Login works
- [ ] Bot control works
- [ ] Real-time logs works
- [ ] All pages accessible

---

## 📞 Support

Jika masih ada masalah:

1. Check Hostinger documentation: https://support.hostinger.com
2. Check Vite documentation: https://vitejs.dev
3. Contact Hostinger support (24/7 live chat)

---

## 🎉 Success!

Jika semua checklist ✅, dashboard Anda sudah live dan siap digunakan!

Access di: `https://yourdomain.com`

Login dengan:
- Username: `admin`
- Password: `admin123`

**JANGAN LUPA GANTI PASSWORD!** 🔐
