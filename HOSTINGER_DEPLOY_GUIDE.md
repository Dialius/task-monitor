# 🚀 Panduan Upload & Setup ke Hostinger

File `HOSTINGER_DEPLOY.zip` sudah siap! Ikuti langkah ini dengan teliti.

## 1️⃣ Membersihkan File Lama (PENTING)
1. Buka **File Manager** di hPanel Hostinger.
2. Masuk ke folder `domains/nama-domain-anda.com/`.
3. **Hapus** folder `public_html` yang lama (atau rename jadi `public_html_old` buat backup).
4. **Hapus** folder `api` jika ada.

## 2️⃣ Upload File Zip
1. Di folder `domains/nama-domain-anda.com/` (sejajar dengan posisi `public_html` tadi), klik tombol **Upload**.
2. Pilih file `HOSTINGER_DEPLOY.zip` dari komputer Anda.
3. Setelah upload selesai, klik kanan file zip tersebut dan pilih **Extract**.
4. Masukkan nama folder tujuan: `.` (titik saja, artinya extract di folder saat ini).
5. Pastikan sekarang Anda melihat struktur seperti ini:
   ```
   domains/nama-domain-anda.com/
   ├── api/               <-- Backend Node.js
   ├── public_html/       <-- Frontend React & .htaccess
   └── ...
   ```

## 3️⃣ Install Backend Dependencies
Kita perlu install library Node.js di server.
1. Buka fitur **SSH Access** di hPanel (atau pakai Terminal komputer Anda jika sudah setup SSH).
2. Login ke SSH.
3. Jalankan perintah ini (copy-paste satu per satu):

   ```bash
   # Masuk ke folder API
   cd domains/nama-domain-anda.com/api
   
   # Cek apakah Node.js sudah ada (jika belum, lihat bab Troubleshooting di bawah)
   node -v
   npm -v

   # Install dependencies (Proses ini butuh 1-3 menit)
   npm install --production
   ```

## 4️⃣ Setup Environment Variable
File `.env` sudah ikut ter-upload, tapi kita perlu pastikan isinya benar.
1. Di File Manager, buka `api/.env`.
2. Pastikan isinya sesuai dengan server (terutama Database URL).

## 5️⃣ Menjalankan Aplikasi (PM2)
Masih di Terminal SSH:

```bash
# Pastikan Anda masih di dalam folder api
pwd
# Harus output: /home/uXXXXXXX/domains/nama-domain-anda.com/api

# Install PM2 jika belum ada (skip jika sudah)
npm install -g pm2

# Jalankan aplikasi
pm2 start ecosystem.config.js

# Simpan agar jalan otomatis saat server restart
pm2 save
pm2 startup
```

## 6️⃣ Cek Website
Buka domain Anda di browser (`https://nama-domain-anda.com`).
- Jika muncul halaman login/dashboard: **BERHASIL!** 🎉
- Jika muncul error, jangan panik. Cek log dengan perintah: `pm2 logs`

---

## 🆘 Troubleshooting

**Q: `npm install` gagal atau `node` not found?**
A: Anda perlu install NVM di Hostinger (jika VPS/Cloud) atau aktifkan Node.js di hPanel (jika Shared Hosting Premium/Business).
Untuk Shared Hosting biasa, kadang harus install NVM manual:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

**Q: Website blank putih?**
A: Cek Console Browser (F12 -> Console). Jika ada error 404/500, cek `.htaccess`. Pastikan file `.htaccess` ada di dalam `public_html`.

**Q: API Error / Login Gagal?**
A: Cek koneksi database di `.env`. Pastikan IP Hostinger sudah di-whitelist di MongoDB Atlas.
