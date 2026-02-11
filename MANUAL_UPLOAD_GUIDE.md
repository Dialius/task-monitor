# Manual Upload ke Hostinger - Panduan Lengkap

## Kenapa Manual Upload?

Hostinger GitHub deployment **TIDAK SUPPORT monorepo** dengan baik. Solusi tercepat dan paling reliable adalah build locally dan upload hasil build.

## Keuntungan Manual Upload

✅ **Pasti Work** - No configuration issues
✅ **Cepat** - 5 menit selesai
✅ **Simple** - No GitHub setup needed
✅ **Full Control** - Anda yang build, anda yang upload

## Step-by-Step Guide

### Step 1: Build Frontend Locally

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies (jika belum)
npm install

# Build untuk production
npm run build
```

**Output:**
```
> task-monitor-dashboard@1.0.0 build
> tsc -b && vite build

vite v7.3.1 building for production...
✓ 1814 modules transformed.
dist/index.html                   0.70 kB │ gzip:   0.36 kB
dist/assets/index-xxx.css        19.50 kB │ gzip:   4.55 kB
dist/assets/index-xxx.js        278.96 kB │ gzip:  83.63 kB
✓ built in 4.37s
✓ Copied .htaccess and _redirects to dist/
```

### Step 2: Verify Build Output

```bash
# Check dist folder
ls dist/

# Should see:
# - index.html
# - assets/ (folder)
# - .htaccess
# - _redirects
# - vite.svg
```

**Struktur dist/:**
```
dist/
├── assets/
│   ├── index-w0qhQyK9.js
│   ├── index-_lxPoB1a.css
│   ├── react-vendor-tXGoXSwc.js
│   ├── socket-vendor-Dw4F3aL5.js
│   └── ui-vendor-DXHmt7cY.js
├── .htaccess
├── _redirects
├── index.html
└── vite.svg
```

### Step 3: Login ke Hostinger

1. Buka: https://hpanel.hostinger.com
2. Login dengan akun Anda
3. Pilih website yang mau di-deploy

### Step 4: Buka File Manager

1. Di sidebar, klik **File Manager**
2. Atau klik **Files** → **File Manager**
3. File Manager akan terbuka di tab baru

### Step 5: Navigate ke public_html

1. Di File Manager, klik folder **public_html**
2. Ini adalah root directory website Anda
3. Semua file di sini akan accessible via domain

### Step 6: Backup File Existing (Jika Ada)

**PENTING:** Backup dulu sebelum delete!

1. **Select All** (checkbox di atas)
2. Klik **Compress** atau **Download**
3. Save backup ke komputer
4. Beri nama: `backup-YYYY-MM-DD.zip`

### Step 7: Clean public_html

1. **Select All** files di public_html
2. Klik **Delete** (icon tempat sampah)
3. Confirm deletion
4. public_html sekarang kosong

### Step 8: Upload Files dari dist/

Ada 2 cara upload:

#### Cara A: Drag & Drop (Recommended)

1. Buka File Explorer di komputer
2. Navigate ke `frontend/dist/`
3. **Select All** files di dist/
4. **Drag & drop** ke File Manager Hostinger
5. Wait for upload (1-2 menit)

#### Cara B: Upload Button

1. Klik **Upload** button di File Manager
2. Klik **Select Files**
3. Navigate ke `frontend/dist/`
4. Select all files:
   - `index.html`
   - `vite.svg`
   - `.htaccess`
   - `_redirects`
5. Klik **Open**
6. Upload folder `assets/`:
   - Klik **Upload** lagi
   - Select **Folder**
   - Choose `assets/` folder
7. Wait for upload

### Step 9: Verify Upload

Check di File Manager, struktur harus seperti ini:

```
public_html/
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   ├── react-vendor-xxx.js
│   ├── socket-vendor-xxx.js
│   └── ui-vendor-xxx.js
├── .htaccess
├── _redirects
├── index.html
└── vite.svg
```

**PENTING:** Pastikan file `.htaccess` ada! Ini untuk SPA routing.

### Step 10: Set File Permissions

1. **Select All** files
2. Right click → **Change Permissions**
3. Set permissions:
   - **Folders**: 755
   - **Files**: 644
4. Check **Apply to subdirectories**
5. Klik **Change**

### Step 11: Test Website

1. Buka domain Anda di browser
2. Dashboard harus muncul
3. Test login:
   - Username: `admin`
   - Password: `admin123`
4. Test navigation:
   - Home
   - Tasks
   - Logs
   - Analytics
   - Config
5. Pastikan tidak ada 404 error

---

## Troubleshooting

### Problem 1: Blank Page / White Screen

**Cause:** File tidak terupload dengan benar

**Solution:**
1. Check browser console (F12)
2. Lihat error apa
3. Biasanya: file path salah

**Fix:**
```bash
# Verify files di File Manager
# Pastikan struktur sama persis dengan dist/
```

### Problem 2: 404 Error saat Navigate

**Cause:** File `.htaccess` tidak ada atau tidak work

**Solution:**
1. Check `.htaccess` ada di public_html
2. Verify isi file:

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

3. Jika tidak ada, create manual:
   - Klik **New File**
   - Name: `.htaccess`
   - Paste content di atas
   - Save

### Problem 3: CSS Tidak Load

**Cause:** File permissions salah

**Solution:**
```bash
# Set permissions via File Manager
# Folders: 755
# Files: 644
```

### Problem 4: WebSocket Connection Failed

**Cause:** Backend tidak running atau URL salah

**Solution:**
1. Check backend API running
2. Update environment variables
3. Rebuild dengan .env yang benar:

```bash
# Edit frontend/.env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com

# Rebuild
npm run build

# Upload ulang folder assets/
```

### Problem 5: "Cannot GET /"

**Cause:** index.html tidak ada di root

**Solution:**
1. Check `index.html` ada di public_html (bukan di subfolder)
2. Jika di subfolder, move ke root:
   - Select `index.html`
   - Cut
   - Navigate ke public_html
   - Paste

---

## Update Frontend di Masa Depan

### Workflow:

```bash
# 1. Make changes
cd frontend
# ... edit files ...

# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Upload
# - Login File Manager
# - Delete old assets/ folder
# - Upload new dist/ files
```

### Quick Update (Hanya JS/CSS):

Jika hanya update code (tidak ada file baru):

1. Build: `npm run build`
2. Upload hanya folder `assets/` baru
3. Replace yang lama
4. Done!

### Full Update (Ada File Baru):

1. Build: `npm run build`
2. Delete semua di public_html
3. Upload semua dari dist/
4. Done!

---

## Tips & Tricks

### 1. Compress Before Upload

Untuk upload lebih cepat:

```bash
# Compress dist/ folder
cd frontend
zip -r dist.zip dist/

# Upload dist.zip ke Hostinger
# Extract di File Manager
```

### 2. Use FTP Client

Untuk upload lebih cepat dan reliable:

1. Download **FileZilla** (free FTP client)
2. Get FTP credentials dari Hostinger:
   - hPanel → FTP Accounts
   - Create FTP account
3. Connect dengan FileZilla
4. Drag & drop dist/ folder
5. Much faster!

### 3. Automate with Script

Create upload script:

```bash
#!/bin/bash
# upload.sh

# Build
cd frontend
npm run build

# Compress
cd dist
zip -r ../dist.zip .
cd ..

# Upload via FTP (need lftp installed)
lftp -u username,password ftp.yourdomain.com <<EOF
cd public_html
mput dist.zip
bye
EOF

echo "Upload complete!"
```

### 4. Version Control

Keep track of deployments:

```bash
# Tag each deployment
git tag -a v1.0.0 -m "Deployment 2024-01-15"
git push --tags

# Create deployment log
echo "$(date): Deployed v1.0.0" >> DEPLOYMENT_LOG.txt
```

---

## Checklist Deployment

Sebelum upload:

- [ ] Build success locally
- [ ] dist/ folder exists
- [ ] All files present:
  - [ ] index.html
  - [ ] assets/ folder
  - [ ] .htaccess
  - [ ] vite.svg
- [ ] Test locally dengan `npm run preview`
- [ ] Backup existing files di Hostinger
- [ ] Clean public_html
- [ ] Upload all files
- [ ] Set permissions (755/644)
- [ ] Test di browser
- [ ] Test all pages
- [ ] Test login
- [ ] No console errors

---

## Performance Tips

### 1. Enable Gzip

File `.htaccess` sudah include gzip compression:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching

File `.htaccess` sudah include caching:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. CDN (Optional)

Untuk performance lebih baik:

1. Enable Cloudflare di Hostinger
2. Cloudflare akan cache static files
3. Faster load time globally

---

## Security

### 1. Change Default Password

**PENTING:** Setelah deploy, ganti password!

1. Login dashboard
2. Go to Config
3. Change password
4. Save

### 2. Enable HTTPS

1. Hostinger Panel → SSL
2. Install Free SSL (Let's Encrypt)
3. Enable Force HTTPS
4. Update .env:
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```
5. Rebuild & upload

### 3. Protect .env Files

Pastikan `.env` tidak terupload:

```bash
# Check .gitignore
cat .gitignore

# Should include:
.env
.env.local
.env.production
```

---

## Kesimpulan

Manual upload adalah solusi **paling reliable** untuk deploy Vite app ke Hostinger dari monorepo.

**Pros:**
- ✅ Pasti work
- ✅ Cepat (5 menit)
- ✅ Simple
- ✅ No configuration issues

**Cons:**
- ❌ Manual process
- ❌ No auto-deploy

**Perfect for:**
- Quick deployment
- Testing
- Small projects
- When GitHub integration doesn't work

---

## Next Steps

1. ✅ Build locally: `npm run build`
2. ✅ Upload dist/ ke Hostinger
3. ✅ Test website
4. ✅ Change password
5. ✅ Enable SSL

Done! Dashboard Anda sudah live! 🎉

---

## Need Help?

Jika ada masalah:
1. Check browser console (F12)
2. Check File Manager structure
3. Check .htaccess file
4. Contact Hostinger support (24/7 live chat)

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy
**Success Rate:** 99%
