# Deploy Frontend ke Hostinger - Panduan Final

## ✅ Masalah Sudah Diperbaiki

Build script di root sudah diubah untuk build **frontend**, bukan backend.

```json
{
  "scripts": {
    "build": "npm install --prefix frontend && cd frontend && npm run build"
  }
}
```

Sekarang ketika Hostinger run `npm run build`, akan:
1. Install dependencies di folder `frontend/`
2. Masuk ke folder `frontend/`
3. Run `npm run build` (Vite build)

---

## 🚀 Cara Deploy ke Hostinger

### Step 1: Push Changes ke GitHub

```bash
# Add semua perubahan
git add .

# Commit
git commit -m "Fix: Update build script for Hostinger deployment"

# Push
git push origin main
```

### Step 2: Configure Hostinger

Login ke Hostinger dan set:

```
Framework: Vite
Branch: main
Node version: 22.x
Root directory: /

Build Settings:
├─ Build command: npm run build
├─ Output directory: frontend/dist
└─ Install command: npm install --prefix frontend
```

**PENTING:** Output directory harus `frontend/dist` (bukan hanya `dist`)

### Step 3: Environment Variables

Tambahkan di Hostinger panel (satu per satu):

**Variable 1:**
```
Name: VITE_API_URL
Value: http://localhost:3001
```

**Variable 2:**
```
Name: VITE_WS_URL
Value: http://localhost:3001
```

(Nanti update setelah backend deployed)

### Step 4: Deploy

Klik **Deploy** dan tunggu 3-5 menit.

---

## 📋 Checklist Settings Hostinger

Pastikan settings ini **PERSIS** seperti ini:

- [ ] Framework: **Vite** (bukan Express!)
- [ ] Branch: **main**
- [ ] Node version: **22.x** atau **18.x**
- [ ] Root directory: **/** (root, bukan /frontend)
- [ ] Build command: **npm run build**
- [ ] Output directory: **frontend/dist**
- [ ] Install command: **npm install --prefix frontend**
- [ ] Environment variables: VITE_API_URL dan VITE_WS_URL

---

## 🔍 Apa yang Akan Terjadi?

### 1. Hostinger Clone Repository

```
/repository/
├── src/              (backend - diabaikan)
├── frontend/         (frontend - ini yang di-build)
├── package.json      (root)
└── ...
```

### 2. Hostinger Run Install

```bash
npm install --prefix frontend
```

Ini install dependencies **hanya** di folder `frontend/`, tidak install backend dependencies.

### 3. Hostinger Run Build

```bash
npm run build
```

Yang akan execute:
```bash
npm install --prefix frontend && cd frontend && npm run build
```

Ini akan:
1. Install frontend dependencies (double check)
2. Masuk ke folder `frontend/`
3. Run `npm run build` (Vite build)

### 4. Hostinger Deploy Output

Hostinger ambil file dari `frontend/dist/`:
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── .htaccess
└── vite.svg
```

Dan deploy ke domain Anda!

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"

**Penyebab:** Hostinger masih install backend dependencies.

**Solusi:** 
- Pastikan Install command: `npm install --prefix frontend`
- Bukan: `npm install` (ini install dari root)

### Error: "Output directory not found"

**Penyebab:** Output directory salah.

**Solusi:**
- Set Output directory: `frontend/dist`
- Bukan: `dist` atau `/dist`

### Build Success tapi Blank Page

**Penyebab:** Base path salah atau assets tidak load.

**Solusi:**
1. Check browser console (F12)
2. Lihat error apa
3. Biasanya: CORS atau API URL salah

### WebSocket Connection Failed

**Penyebab:** Backend belum deployed atau URL salah.

**Solusi:**
- Untuk sekarang, dashboard akan error karena backend belum ada
- Nanti setelah backend deployed, update VITE_API_URL dan VITE_WS_URL
- Rebuild dan deploy ulang

---

## 📊 Expected Build Output

Jika berhasil, Hostinger logs akan show:

```
✓ Installing dependencies...
✓ Running build command...
✓ Building frontend...

> task-monitor-dashboard@1.0.0 build
> tsc -b && vite build

vite v7.3.1 building for production...
✓ 1814 modules transformed.
dist/index.html                   0.70 kB
dist/assets/index-xxx.css        19.50 kB
dist/assets/index-xxx.js        278.96 kB

✓ built in 4.37s
✓ Copied .htaccess and _redirects to dist/

✓ Build successful!
✓ Deploying to production...
✓ Deployment complete!
```

---

## 🎯 Next Steps Setelah Frontend Deployed

### 1. Test Frontend

Buka domain Anda: `https://yourdomain.com`

**Expected:**
- ✅ Dashboard muncul
- ✅ Login page accessible
- ❌ Login akan error (backend belum ada)
- ❌ WebSocket error (backend belum ada)

Ini **NORMAL** karena backend belum deployed.

### 2. Deploy Backend

Ada 2 opsi:

**Option A: Backend di VPS ($4.99/month)**
- Bot running 24/7
- API server untuk dashboard
- Reliable dan stable

**Option B: Backend di Hostinger (risky)**
- Setup Node.js app di Hostinger
- Bot mungkin sering disconnect
- Tidak ideal untuk production

### 3. Update Environment Variables

Setelah backend deployed, update di Hostinger:

```
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

Lalu rebuild dan deploy ulang frontend.

### 4. Test Full System

- ✅ Login works
- ✅ WebSocket connects
- ✅ Bot controls work
- ✅ Real-time logs work
- ✅ All features work

---

## 📝 Summary

### Yang Sudah Diperbaiki:

1. ✅ Build script di root diubah untuk build frontend
2. ✅ Install command hanya install frontend dependencies
3. ✅ Output directory point ke `frontend/dist`
4. ✅ Vite config sudah optimal
5. ✅ Deployment files (.htaccess, _redirects) auto-copy

### Yang Perlu Dilakukan:

1. 🔄 Push changes ke GitHub
2. 🔄 Configure Hostinger dengan settings di atas
3. 🔄 Deploy frontend
4. 🔄 Test dashboard (akan error karena backend belum ada)
5. 🔄 Deploy backend (VPS atau Hostinger)
6. 🔄 Update environment variables
7. 🔄 Rebuild frontend
8. 🔄 Test full system

---

## 🎉 Setelah Ini

Frontend Anda akan deployed dan accessible di domain Hostinger!

Untuk backend, kita bisa setup terpisah (recommended: VPS) atau di Hostinger juga (risky tapi bisa).

Mau lanjut deploy backend atau test frontend dulu? 😊
