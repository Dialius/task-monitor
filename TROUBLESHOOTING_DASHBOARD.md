# 🔧 Troubleshooting Dashboard

## Status Saat Ini

### Backend ✅
- **Status**: Running
- **Port**: 3001
- **WhatsApp**: Connected
- **Logs**: Terlihat di terminal

### Frontend ✅
- **Status**: Running
- **Port**: 5173
- **Vite**: Ready

---

## 🐛 Problem: Dashboard Tidak Muncul

### Kemungkinan Penyebab

#### 1. Browser Cache
**Gejala**: Halaman putih atau tidak load

**Solusi**:
```
1. Tekan Ctrl + Shift + R (hard refresh)
2. Atau Ctrl + F5
3. Atau buka Incognito/Private window
```

#### 2. Port Salah
**Gejala**: "Cannot connect" atau "ERR_CONNECTION_REFUSED"

**Cek**:
```bash
# Pastikan frontend di port 5173
# Buka: http://localhost:5173
```

Jika port berbeda, cek output terminal frontend:
```
➜  Local:   http://localhost:5174/  # Mungkin port lain
```

#### 3. Backend Tidak Running
**Gejala**: Login gagal atau "Network Error"

**Cek**:
```bash
# Test backend health
curl http://localhost:3001/health
```

Harus return:
```json
{"status":"ok","timestamp":"..."}
```

#### 4. CORS Error
**Gejala**: Error di console browser "CORS policy"

**Solusi**: Sudah dikonfigurasi di backend, tapi cek `.env`:
```env
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## ✅ Cara Memastikan Semuanya Running

### Step 1: Cek Backend

```bash
# Terminal 1 - Lihat logs
# Harus ada output seperti:
✅ BOT IS RUNNING!
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519:44@s.whatsapp.net
```

### Step 2: Cek Frontend

```bash
# Terminal 2 - Lihat logs
# Harus ada output:
VITE v7.3.1  ready in 556 ms
➜  Local:   http://localhost:5173/
```

### Step 3: Test Backend API

```bash
# Test health endpoint
curl http://localhost:3001/health

# Expected:
{"status":"ok","timestamp":"2026-02-11T..."}
```

### Step 4: Test Login

```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected:
{"token":"eyJhbGci...","refreshToken":"...","user":{...}}
```

### Step 5: Buka Browser

1. Buka browser (Chrome/Edge/Firefox)
2. Akses: http://localhost:5173
3. Harus muncul halaman login
4. Login dengan:
   - Username: `admin`
   - Password: `admin123`

---

## 🔍 Debug Steps

### 1. Cek Browser Console

Tekan `F12` atau `Ctrl+Shift+I`, lalu:

1. **Console Tab** - Lihat error messages
   - Jika ada error merah, screenshot dan kirim
   
2. **Network Tab** - Lihat API requests
   - Refresh halaman
   - Lihat request ke `/api/auth/login`
   - Status harus 200 OK

3. **Application Tab** - Lihat localStorage
   - Cek apakah ada `token` setelah login

### 2. Cek Terminal Logs

**Backend Terminal**:
```
# Harus ada logs seperti:
[timestamp]: GET /api/bot/status {"ip":"::1",...}
[timestamp]: GET /api/bot/metrics {"ip":"::1",...}
```

**Frontend Terminal**:
```
# Tidak ada error
# Jika ada error, akan muncul di sini
```

### 3. Test Manual

```bash
# 1. Stop semua
Ctrl + C di kedua terminal

# 2. Clear cache
cd frontend
rm -rf node_modules/.vite
rm -rf dist

# 3. Rebuild backend
cd ..
npm run build

# 4. Start lagi
# Terminal 1
npm start

# Terminal 2
cd frontend
npm run dev
```

---

## 🚨 Common Errors

### Error 1: "Cannot GET /"
**Penyebab**: Frontend tidak running atau port salah

**Solusi**:
```bash
cd frontend
npm run dev
```

### Error 2: "Network Error" saat login
**Penyebab**: Backend tidak running

**Solusi**:
```bash
npm start
```

### Error 3: "Invalid token"
**Penyebab**: Token expired atau salah

**Solusi**:
1. Logout
2. Clear localStorage (F12 > Application > Local Storage > Clear)
3. Login lagi

### Error 4: Halaman putih
**Penyebab**: JavaScript error atau build issue

**Solusi**:
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Error 5: "Connection replaced" di WhatsApp
**Penyebab**: WhatsApp Web terbuka di browser lain

**Solusi**:
1. Tutup semua WhatsApp Web di browser
2. Logout dari semua device
3. Restart bot

---

## 📱 Quick Test Commands

### Test Backend
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Frontend
```bash
# Buka di browser
start http://localhost:5173

# Atau manual
# Chrome: chrome.exe http://localhost:5173
# Firefox: firefox.exe http://localhost:5173
```

---

## 🎯 Expected Behavior

### Saat Buka Dashboard

1. **Loading Screen** (2-3 detik)
   - Robot icon dengan animasi
   - "Initializing..." → "Checking authentication..." → "Loading dashboard..."

2. **Login Page** (jika belum login)
   - Form username & password
   - Default credentials hint
   - Login button

3. **Dashboard Home** (setelah login)
   - Sidebar kiri dengan menu
   - Header dengan user info
   - Status cards (Uptime, WhatsApp, Discord, MongoDB)
   - Control panel (Start/Stop/Restart/Pause/Resume)
   - Metrics panel (CPU/Memory charts)
   - Terminal logs

### Saat Login

1. Masukkan username: `admin`
2. Masukkan password: `admin123`
3. Klik "Login"
4. Redirect ke dashboard home
5. Sidebar muncul dengan 5 menu:
   - 🏠 Dashboard
   - 📚 Tasks
   - 📋 Logs
   - 📊 Analytics
   - ⚙️ Config

---

## 🔄 Restart Everything

Jika masih bermasalah, restart semua:

```bash
# 1. Stop semua process
# Tekan Ctrl + C di kedua terminal

# 2. Kill port (jika masih digunakan)
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F

# 3. Clear cache
cd frontend
rm -rf node_modules/.vite
rm -rf dist

# 4. Rebuild
cd ..
npm run build

# 5. Start backend
npm start

# 6. Start frontend (terminal baru)
cd frontend
npm run dev

# 7. Buka browser
start http://localhost:5173
```

---

## 📞 Still Not Working?

### Collect Information

1. **Screenshot browser console** (F12 > Console)
2. **Screenshot network tab** (F12 > Network)
3. **Copy terminal logs** (backend & frontend)
4. **Check versions**:
   ```bash
   node --version  # Should be v18+
   npm --version
   ```

### Check Files

```bash
# Pastikan file ada
ls frontend/dist/  # Harus ada index.html
ls dist/  # Harus ada index.js

# Cek .env
cat .env | grep API_ENABLED  # Harus true
cat .env | grep API_PORT  # Harus 3001
```

---

## ✅ Success Indicators

Dashboard berjalan dengan baik jika:

- ✅ Backend terminal menunjukkan "BOT IS RUNNING!"
- ✅ Frontend terminal menunjukkan "ready in XXXms"
- ✅ Browser menampilkan login page atau dashboard
- ✅ Bisa login dengan admin/admin123
- ✅ Dashboard menampilkan status bot
- ✅ Tidak ada error di console browser
- ✅ API requests di Network tab status 200 OK

---

**Last Updated**: 2026-02-11
**Status**: Both servers running
**Backend**: ✅ Port 3001
**Frontend**: ✅ Port 5173
