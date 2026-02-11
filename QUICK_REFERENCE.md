# 🚀 Quick Reference - Dashboard

## 📍 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔐 Login

- **Username**: `admin`
- **Password**: `admin123`

## 🎮 Commands

### Start Dashboard
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Stop Dashboard
```bash
# Tekan Ctrl + C di kedua terminal
```

### Restart
```bash
# Stop dulu (Ctrl + C)
# Lalu start lagi
npm start
cd frontend && npm run dev
```

### Build
```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🔍 Check Status

### Backend Running?
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok",...}
```

### Frontend Running?
```bash
# Buka browser: http://localhost:5173
# Harus muncul login page
```

### Bot Connected?
```bash
# Lihat terminal backend
# Harus ada: ✅ WhatsApp connected successfully!
```

## 🐛 Quick Fixes

### Dashboard tidak muncul?
```bash
# Hard refresh browser
Ctrl + Shift + R
```

### Login gagal?
```bash
# Cek backend running
curl http://localhost:3001/health
```

### Port sudah digunakan?
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Clear cache
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## 📊 Dashboard Features

### 🏠 Home
- Bot status & uptime
- Connection status (WhatsApp, Discord, MongoDB, Notion)
- Control panel (Start/Stop/Restart/Pause/Resume)
- CPU & Memory charts
- Terminal logs

### 📚 Tasks
- View all tasks
- Search & filter
- Delete tasks
- Statistics

### 📋 Logs
- Real-time logs
- Filter by level
- Download logs

### 📊 Analytics
- Task statistics
- Distribution charts
- Platform comparison
- Time range selector

### ⚙️ Config
- Platform toggles
- Scheduler settings
- Log level
- Save/Reset

## 🔧 Troubleshooting

### Problem: Halaman putih
**Fix**: Ctrl + Shift + R (hard refresh)

### Problem: Login gagal
**Fix**: Cek backend running (`curl http://localhost:3001/health`)

### Problem: "Network Error"
**Fix**: Backend tidak running, jalankan `npm start`

### Problem: "Connection replaced"
**Fix**: Tutup WhatsApp Web di browser lain

## 📞 Need Help?

1. **Cek logs** di terminal backend & frontend
2. **Buka console** browser (F12)
3. **Test API** dengan curl
4. **Baca** TROUBLESHOOTING_DASHBOARD.md

## ✅ Success Checklist

- [ ] Backend running (port 3001)
- [ ] Frontend running (port 5173)
- [ ] WhatsApp connected
- [ ] Bisa buka http://localhost:5173
- [ ] Bisa login dengan admin/admin123
- [ ] Dashboard menampilkan data
- [ ] Tidak ada error di console

## 🎯 Quick Test

```bash
# 1. Test backend
curl http://localhost:3001/health

# 2. Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. Buka browser
start http://localhost:5173
```

---

**Status**: ✅ Both servers running
**Backend**: Port 3001
**Frontend**: Port 5173
**WhatsApp**: Connected
