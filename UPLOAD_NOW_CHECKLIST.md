# ✅ Upload Sekarang - Quick Checklist

## Status: READY TO UPLOAD! 🚀

Build sudah complete di folder `frontend/dist/`

## Files Ready:
- ✅ index.html
- ✅ assets/ (folder dengan JS & CSS)
- ✅ .htaccess (untuk SPA routing)
- ✅ _redirects
- ✅ vite.svg

---

## 5 Langkah Upload (5 Menit)

### 1. Login Hostinger
→ https://hpanel.hostinger.com

### 2. Buka File Manager
→ Sidebar: **File Manager**

### 3. Clean public_html
→ Select All → Delete

### 4. Upload Files
→ Drag & drop semua dari `frontend/dist/` ke public_html

### 5. Test!
→ Buka domain Anda di browser

---

## Upload Files Ini:

Dari folder: `D:\task-monitor\frontend\dist\`

Upload ke: `public_html/`

**Files:**
```
✓ index.html
✓ vite.svg
✓ .htaccess
✓ _redirects
✓ assets/ (folder lengkap)
```

---

## Cara Upload

### Option A: Drag & Drop (Paling Mudah)

1. Buka File Explorer
2. Navigate ke `D:\task-monitor\frontend\dist\`
3. Select All (Ctrl+A)
4. Drag ke File Manager Hostinger
5. Wait 1-2 menit
6. Done!

### Option B: Upload Button

1. Klik **Upload** di File Manager
2. Select files dari `dist/`
3. Upload satu per satu atau zip dulu
4. Done!

---

## After Upload

### Test Checklist:

- [ ] Buka domain di browser
- [ ] Dashboard muncul (tidak blank)
- [ ] Login works (admin/admin123)
- [ ] Navigate ke Tasks (tidak 404)
- [ ] Navigate ke Logs (tidak 404)
- [ ] Navigate ke Analytics (tidak 404)
- [ ] Navigate ke Config (tidak 404)
- [ ] No console errors (F12)

### If Success:

🎉 **DONE!** Dashboard sudah live!

**Next:**
1. ⚠️ Ganti password default!
2. ✅ Enable SSL (HTTPS)
3. ✅ Update backend CORS

### If Error:

Check `MANUAL_UPLOAD_GUIDE.md` bagian Troubleshooting.

---

## Quick Commands

### Rebuild (Jika Perlu):

```bash
cd frontend
npm run build
```

### Check Build Output:

```bash
ls frontend/dist/
```

Should see: index.html, assets/, .htaccess, vite.svg

---

## Environment Variables

Setelah upload, jika WebSocket error:

1. Edit `frontend/.env`:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_WS_URL=https://api.yourdomain.com
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Upload ulang folder `assets/`

---

## Support

Need help? Read: `MANUAL_UPLOAD_GUIDE.md`

---

**Ready?** Let's upload! 🚀
