# 🚀 Cara Menjalankan Dashboard

Panduan lengkap untuk menjalankan bot dan dashboard secara lokal.

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js (v18 atau lebih baru)
- ✅ MongoDB (running di localhost atau MongoDB Atlas)
- ✅ npm atau yarn

---

## 🎯 Quick Start (Paling Mudah)

### Opsi 1: Jalankan Semuanya Sekaligus

Buka **2 terminal** di folder `task-monitor`:

#### Terminal 1: Backend + Bot
```bash
npm start
```

#### Terminal 2: Frontend Dashboard
```bash
cd frontend
npm run dev
```

Selesai! Buka browser: **http://localhost:5173**

---

## 📝 Langkah Detail

### Step 1: Install Dependencies

#### Backend
```bash
# Di folder root (task-monitor)
npm install
```

#### Frontend
```bash
# Di folder frontend
cd frontend
npm install
```

### Step 2: Konfigurasi Environment

Pastikan file `.env` sudah dikonfigurasi dengan benar:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# API Dashboard
API_ENABLED=true
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=your-group-id

# AI Services (optional)
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key

# Notion (optional)
NOTION_DATABASE_ID=your-database-id
NOTION_API_KEY=your-notion-key
```

### Step 3: Build Backend

```bash
# Di folder root
npm run build
```

### Step 4: Jalankan Backend + Bot

```bash
npm start
```

Tunggu sampai muncul:
```
✅ MongoDB connected
✅ WhatsApp connected
✅ API Server running on port 3001
```

### Step 5: Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm run dev
```

Tunggu sampai muncul:
```
VITE v7.3.1  ready in 603 ms
➜  Local:   http://localhost:5173/
```

### Step 6: Buka Dashboard

1. Buka browser: **http://localhost:5173**
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Selesai! Dashboard siap digunakan 🎉

---

## 🔧 Troubleshooting

### Problem 1: Port 3001 sudah digunakan

**Error**: `Port 3001 is already in use`

**Solusi**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Atau ubah port di .env
API_PORT=3002
```

### Problem 2: Port 5173 sudah digunakan

**Error**: `Port 5173 is in use`

**Solusi**: Vite akan otomatis menggunakan port lain (5174, 5175, dst)

### Problem 3: MongoDB connection error

**Error**: `MongooseServerSelectionError`

**Solusi**:
1. Pastikan MongoDB running (jika lokal)
2. Cek MONGODB_URI di `.env`
3. Pastikan IP whitelist di MongoDB Atlas (jika cloud)

### Problem 4: WhatsApp tidak connect

**Error**: `WhatsApp connection failed`

**Solusi**:
1. Hapus folder `auth_info`
2. Restart bot
3. Scan QR code lagi

### Problem 5: Dashboard putih/blank

**Solusi**:
```bash
# Clear cache dan rebuild
cd frontend
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Problem 6: API Error 401 Unauthorized

**Solusi**:
1. Logout dari dashboard
2. Login lagi
3. Token akan di-refresh otomatis

---

## 🎮 Cara Menggunakan Dashboard

### 1. Login
- Buka http://localhost:5173
- Masukkan username: `admin`
- Masukkan password: `admin123`
- Klik "Login"

### 2. Dashboard Home
- Lihat status bot (Running/Stopped)
- Lihat koneksi (WhatsApp, Discord, MongoDB, Notion)
- Lihat uptime bot
- Kontrol bot dengan tombol:
  - ▶️ **Start**: Jalankan bot
  - ⏹️ **Stop**: Matikan bot
  - 🔄 **Restart**: Restart bot
  - ⏸️ **Pause**: Pause bot
  - ▶️ **Resume**: Lanjutkan bot

### 3. Tasks Page
- Lihat semua tugas
- Search tugas
- Filter by type (Tugas, Ujian, Kelompok)
- Filter by status (Pending, Completed, Cancelled)
- Delete tugas

### 4. Logs Page
- Lihat log bot real-time
- Filter by level (Info, Warning, Error, Debug)
- Search logs
- Download logs

### 5. Analytics Page
- Pilih time range (7 days, 30 days, 90 days)
- Lihat statistik:
  - Total messages
  - Tasks created
  - Completion rate
  - Active users
- Lihat distribusi tugas by type
- Lihat distribusi tugas by priority
- Bandingkan WhatsApp vs Discord

### 6. Config Page
- Toggle WhatsApp/Discord
- Atur jadwal reminder:
  - Daily reminder time
  - Weekly reminder day
  - Weekly reminder time
  - Timezone
- Atur log level
- Save changes

---

## 🛑 Cara Stop

### Stop Frontend
Di terminal frontend, tekan: `Ctrl + C`

### Stop Backend
Di terminal backend, tekan: `Ctrl + C`

---

## 🔄 Cara Restart

### Restart Backend
```bash
# Stop (Ctrl + C)
# Start lagi
npm start
```

### Restart Frontend
```bash
# Stop (Ctrl + C)
# Start lagi
cd frontend
npm run dev
```

---

## 📦 Production Build

### Build Frontend untuk Production

```bash
cd frontend
npm run build
```

Output ada di folder `frontend/dist/`

### Preview Production Build

```bash
cd frontend
npm start
```

Buka: http://localhost:4173

---

## 🎯 Checklist Sebelum Run

- [ ] Node.js terinstall
- [ ] MongoDB running atau MongoDB Atlas ready
- [ ] File `.env` sudah dikonfigurasi
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] Backend sudah di-build (`npm run build`)
- [ ] Port 3001 dan 5173 tidak digunakan

---

## 📱 Access dari Device Lain

### Jalankan dengan --host

```bash
cd frontend
npm run dev -- --host
```

Akan muncul:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

Buka dari HP/laptop lain: `http://192.168.1.100:5173`

**Note**: Pastikan di network yang sama (WiFi yang sama)

---

## 🔐 Ganti Password Admin

### Cara 1: Via Script

```bash
node scripts/create-admin.js
```

Masukkan username dan password baru.

### Cara 2: Via MongoDB

```javascript
// Connect ke MongoDB
use multiplatform_class_bot

// Update password
db.users.updateOne(
  { username: "admin" },
  { $set: { password: "hashed_password_here" } }
)
```

---

## 📊 Monitoring

### Cek Status Backend
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:00:00.000Z"
}
```

### Cek Status Bot
```bash
curl http://localhost:3001/api/bot/status
```

### Cek Logs
```bash
# Lihat logs di terminal
# Atau buka dashboard > Logs page
```

---

## 🚀 Tips & Tricks

### 1. Auto-restart Backend saat Development

Install nodemon:
```bash
npm install -g nodemon
```

Jalankan:
```bash
nodemon dist/index.js
```

### 2. Run di Background (Linux/Mac)

```bash
# Backend
nohup npm start > backend.log 2>&1 &

# Frontend
cd frontend
nohup npm run dev > frontend.log 2>&1 &
```

### 3. Run dengan PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start ecosystem.config.js

# Start frontend (production build)
cd frontend
npm run build
pm2 serve dist 5173 --name frontend
```

### 4. Debug Mode

```bash
# Backend dengan debug logs
LOG_LEVEL=debug npm start

# Frontend dengan debug
cd frontend
npm run dev -- --debug
```

---

## 📞 Bantuan

### Jika masih error:

1. **Cek logs di terminal** - Biasanya ada error message yang jelas
2. **Cek browser console** (F12) - Untuk error frontend
3. **Cek file `.env`** - Pastikan semua konfigurasi benar
4. **Restart semua** - Stop backend & frontend, lalu start lagi
5. **Clear cache** - Hapus `node_modules/.vite` dan `dist`

### Common Commands

```bash
# Install dependencies
npm install

# Build backend
npm run build

# Run backend
npm start

# Run frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Check health
curl http://localhost:3001/health

# View logs
tail -f logs/combined.log
```

---

## ✅ Checklist Sukses

Dashboard berjalan dengan baik jika:

- ✅ Backend running di port 3001
- ✅ Frontend running di port 5173
- ✅ Bisa login dengan admin/admin123
- ✅ Dashboard menampilkan status bot
- ✅ WebSocket connected (ada indikator "Live" di dashboard)
- ✅ Bisa control bot (Start/Stop/Restart)
- ✅ Bisa lihat tasks, logs, analytics
- ✅ Tidak ada error di console browser

---

## 🎉 Selamat!

Dashboard sudah berjalan! Sekarang kamu bisa:
- Monitor bot real-time
- Control bot dari browser
- Manage tasks
- Lihat analytics
- Configure settings

**Happy coding!** 🚀
