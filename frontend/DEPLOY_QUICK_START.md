# 🚀 Quick Start: Deploy ke Hostinger

## Cara Tercepat (5 Menit)

### 1. Push ke GitHub

```bash
cd frontend
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/task-monitor-dashboard.git
git push -u origin main
```

### 2. Connect ke Hostinger

1. Buka: https://hpanel.hostinger.com
2. Klik **Websites** → **Add Website**
3. Pilih **Connect to GitHub**
4. Authorize Hostinger
5. Pilih repository: `task-monitor-dashboard`
6. Pilih branch: `main`

### 3. Verify Build Settings

Hostinger akan auto-detect, pastikan:

```
Framework: Vite ✓
Build Command: npm run build ✓
Output Directory: dist ✓
Install Command: npm install ✓
Node Version: 18.x ✓
```

### 4. Add Environment Variables

Di Hostinger panel, tambahkan:

```
VITE_API_URL=http://YOUR_VPS_IP:3001
VITE_WS_URL=http://YOUR_VPS_IP:3001
```

Ganti `YOUR_VPS_IP` dengan IP VPS Anda.

### 5. Deploy!

Klik **Deploy** dan tunggu 2-5 menit.

Done! 🎉

---

## Cara Manual (Jika GitHub Tidak Bisa)

### 1. Build Locally

```bash
cd frontend
npm install
npm run build
```

### 2. Upload ke Hostinger

1. Login ke Hostinger Panel
2. Buka **File Manager**
3. Navigate ke `public_html/`
4. Delete semua file existing
5. Upload semua file dari folder `dist/`:
   - `index.html`
   - `assets/` (folder)
   - `vite.svg`
   - `.htaccess`
   - `_redirects`

### 3. Done!

Buka domain Anda di browser.

---

## Troubleshooting

### "Framework tidak kompatibel"

Pastikan file ini ada di root:
- ✓ `package.json`
- ✓ `vite.config.ts`
- ✓ `index.html`

### 404 Error saat navigate

Pastikan file `.htaccess` ada di public_html.

### WebSocket Error

1. Check backend API running
2. Check VITE_WS_URL benar
3. Check CORS di backend

---

## Next Steps

1. ✓ Deploy dashboard
2. ✓ Test login (admin/admin123)
3. ✓ Start bot dari dashboard
4. ✓ Check real-time logs
5. ⚠️ **GANTI PASSWORD DEFAULT!**

---

Untuk panduan lengkap, baca: `HOSTINGER_VITE_DEPLOYMENT.md`
