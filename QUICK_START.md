# 🚀 Quick Start - Dashboard

Cara tercepat untuk menjalankan dashboard!

---

## ⚡ Super Quick (Windows)

### Cara 1: Double Click (Paling Mudah!)

1. **Double click** file `start-dashboard.bat`
2. Tunggu 10 detik
3. Browser akan otomatis terbuka
4. Login dengan:
   - Username: `admin`
   - Password: `admin123`

**SELESAI!** 🎉

---

## 🖥️ Manual Start (Semua OS)

### Buka 2 Terminal

#### Terminal 1: Backend
```bash
npm start
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Buka Browser
http://localhost:5173

### Login
- Username: `admin`
- Password: `admin123`

---

## 🛑 Cara Stop

### Windows (jika pakai .bat)
- Tutup window "Backend API"
- Tutup window "Frontend Dashboard"

### Manual
- Terminal 1: Tekan `Ctrl + C`
- Terminal 2: Tekan `Ctrl + C`

---

## ❓ Troubleshooting

### Dashboard tidak muncul?

1. **Cek apakah backend running**
   - Buka: http://localhost:3001/health
   - Harus muncul: `{"status":"ok",...}`

2. **Cek apakah frontend running**
   - Lihat terminal frontend
   - Harus ada: `Local: http://localhost:5173/`

3. **Restart semua**
   - Stop backend & frontend
   - Jalankan lagi

### Error "Port already in use"?

**Backend (port 3001)**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Frontend (port 5173)**:
- Vite akan otomatis pakai port lain (5174, 5175, dst)

### MongoDB error?

Cek file `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

Pastikan:
- Username & password benar
- IP whitelist di MongoDB Atlas (jika cloud)

---

## 📱 Access dari HP/Laptop Lain

### 1. Jalankan frontend dengan --host

```bash
cd frontend
npm run dev -- --host
```

### 2. Lihat IP address

Terminal akan menampilkan:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### 3. Buka dari device lain

Buka browser di HP/laptop lain:
```
http://192.168.1.100:5173
```

**Note**: Harus di WiFi yang sama!

---

## 🎯 Checklist

Sebelum run, pastikan:

- [ ] Node.js sudah terinstall
- [ ] MongoDB running (atau MongoDB Atlas ready)
- [ ] File `.env` sudah dikonfigurasi
- [ ] Dependencies sudah di-install:
  ```bash
  npm install
  cd frontend && npm install
  ```
- [ ] Backend sudah di-build:
  ```bash
  npm run build
  ```

---

## 🎮 Fitur Dashboard

### 1. Dashboard Home
- Status bot (Running/Stopped)
- Koneksi (WhatsApp, Discord, MongoDB, Notion)
- Uptime
- Control bot (Start/Stop/Restart/Pause/Resume)
- CPU & Memory usage
- Terminal logs

### 2. Tasks
- Lihat semua tugas
- Search & filter
- Delete tugas

### 3. Logs
- Real-time logs
- Filter by level
- Download logs

### 4. Analytics
- Statistik tugas
- Distribusi by type & priority
- Platform comparison

### 5. Config
- Toggle WhatsApp/Discord
- Atur jadwal reminder
- Log level

---

## 📞 Need Help?

Baca dokumentasi lengkap:
- **CARA_RUN_DASHBOARD.md** - Panduan detail
- **DASHBOARD_FINAL_SUMMARY.md** - Summary lengkap
- **FRONTEND_DEBUG_STEPS.md** - Troubleshooting

---

## ✅ Success!

Jika dashboard sudah muncul dan bisa login, berarti berhasil! 🎉

Sekarang kamu bisa:
- ✅ Monitor bot real-time
- ✅ Control bot dari browser
- ✅ Manage tasks
- ✅ Lihat analytics
- ✅ Configure settings

**Happy monitoring!** 🚀
