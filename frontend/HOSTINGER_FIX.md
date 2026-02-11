# Fix: Hostinger Detect Express Instead of Vite

## Masalah
Hostinger detect framework sebagai "Express" padahal ini Vite React app.

## Penyebab
Hostinger scan root directory dan menemukan backend package.json yang ada Express.

## Solusi: Deploy Frontend Saja

### Option A: Repository Terpisah (RECOMMENDED)

1. **Buat repository baru di GitHub khusus frontend:**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit - Vite React Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/task-monitor-dashboard.git
   git push -u origin main
   ```

2. **Connect repository ini ke Hostinger:**
   - Repository: `task-monitor-dashboard` (frontend only)
   - Branch: `main`
   - Root directory: `/` (karena ini sudah frontend only)
   - Framework: Vite ✓ (akan auto-detect dengan benar)

3. **Build settings akan otomatis:**
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x
   ```

### Option B: Monorepo dengan Root Directory Setting

Jika mau tetap 1 repository:

1. **Push seluruh project ke GitHub:**
   ```bash
   git add .
   git commit -m "Add frontend and backend"
   git push
   ```

2. **Di Hostinger, set Root directory:**
   - Root directory: `/frontend`
   - Framework: Vite (akan detect dengan benar)
   - Build command: `npm run build`
   - Output: `dist`

### Option C: Manual Upload (Paling Mudah untuk Sekarang)

Karena sudah build, langsung upload saja:

1. **File sudah ready di `frontend/dist/`**

2. **Upload via File Manager:**
   - Login Hostinger Panel
   - File Manager
   - Navigate ke `public_html/`
   - Delete semua file di public_html
   - Upload semua dari `frontend/dist/`:
     - `index.html`
     - `assets/` folder
     - `.htaccess`
     - `_redirects`
     - `vite.svg`

3. **Done!** Buka domain Anda.

## Rekomendasi Saya

**Gunakan Option C (Manual Upload) untuk sekarang** karena:
- ✅ Paling cepat (5 menit)
- ✅ Tidak perlu setup GitHub
- ✅ File sudah ready di `dist/`
- ✅ Langsung bisa test

Nanti kalau mau auto-deploy, bisa setup GitHub (Option A).

## Step-by-Step Manual Upload

### 1. Pastikan Build Sudah Ready

```bash
cd frontend
npm run build
```

Check folder `dist/` harus ada:
- ✓ index.html
- ✓ assets/ (folder dengan JS & CSS)
- ✓ .htaccess
- ✓ _redirects
- ✓ vite.svg

### 2. Login Hostinger

1. Buka: https://hpanel.hostinger.com
2. Login dengan akun Anda
3. Pilih website yang mau di-deploy

### 3. Buka File Manager

1. Klik **File Manager** di sidebar
2. Navigate ke folder `public_html/`
3. **BACKUP dulu** jika ada file penting:
   - Select all
   - Download as ZIP
   - Simpan di komputer

### 4. Clean public_html

1. Select all files di public_html
2. Klik **Delete**
3. Confirm delete

### 5. Upload Files

1. Klik **Upload** button
2. Select all files dari `frontend/dist/`:
   - Drag & drop atau browse
   - Upload `index.html`
   - Upload folder `assets/`
   - Upload `.htaccess`
   - Upload `_redirects`
   - Upload `vite.svg`

### 6. Verify Upload

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

### 7. Set Permissions

1. Select all files
2. Right click → Permissions
3. Set to **755** for folders
4. Set to **644** for files

### 8. Test!

1. Buka domain Anda di browser
2. Dashboard harus muncul
3. Test login: admin / admin123
4. Test navigation (jangan ada 404)

## Environment Variables

Setelah upload, jika WebSocket error:

1. Edit file di File Manager
2. Buka `assets/index-xxx.js`
3. Search `VITE_API_URL`
4. Atau lebih baik: rebuild dengan .env yang benar

**Cara proper:**

1. Edit `frontend/.env`:
   ```env
   VITE_API_URL=http://YOUR_VPS_IP:3001
   VITE_WS_URL=http://YOUR_VPS_IP:3001
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Upload ulang folder `assets/`

## Troubleshooting

### Dashboard tidak muncul (blank page)

1. Check browser console (F12)
2. Lihat error apa
3. Biasanya: file path salah atau permissions

**Fix:**
```bash
# Set permissions via SSH
chmod -R 755 public_html
chmod 644 public_html/index.html
chmod 644 public_html/.htaccess
```

### 404 Error saat navigate

File `.htaccess` tidak ada atau tidak work.

**Fix:**
1. Pastikan `.htaccess` ada di public_html
2. Check isi file sesuai template
3. Restart Apache (di Hostinger panel)

### WebSocket connection failed

Backend API tidak running atau URL salah.

**Fix:**
1. Check backend API running: `http://YOUR_VPS_IP:3001/health`
2. Update VITE_WS_URL di .env
3. Rebuild dan upload ulang

## Next Steps

Setelah manual upload berhasil:

1. ✅ Test semua fitur
2. ✅ Enable SSL (HTTPS)
3. ✅ Update backend CORS untuk allow domain
4. ✅ Change default password
5. 🔄 Setup GitHub auto-deploy (optional)

## Kesimpulan

**Untuk sekarang: Gunakan Manual Upload (Option C)**

Paling cepat dan mudah. Nanti kalau mau auto-deploy, tinggal setup GitHub.
