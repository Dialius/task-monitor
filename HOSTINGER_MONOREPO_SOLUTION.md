# Solusi Deploy Frontend dari Monorepo di Hostinger

## Hasil Research

Setelah research detail, saya menemukan bahwa **Hostinger GitHub deployment TIDAK support custom working directory** untuk monorepo dengan cara yang sama seperti platform lain (Vercel, Netlify, Railway).

## Masalah

1. ❌ Setting "Root directory: /frontend" **TIDAK WORK** di Hostinger
2. ❌ Hostinger tetap run `npm install` dan `npm run build` dari root repository
3. ❌ Tidak bisa custom install command dengan `cd frontend && npm install`
4. ❌ Build command tidak bisa pakai `cd frontend && npm run build`

## Solusi yang Tersedia

### ✅ Solusi 1: Repository Terpisah (RECOMMENDED)

Ini cara yang **paling reliable** dan **officially supported** oleh Hostinger.

**Cara:**
1. Buat repository baru di GitHub khusus untuk frontend
2. Push folder `frontend/` ke repository baru
3. Connect repository baru ke Hostinger
4. Deploy otomatis work!

**Keuntungan:**
- ✅ Pasti work (officially supported)
- ✅ Auto-deploy on push
- ✅ Clean separation
- ✅ No workarounds needed

**Langkah Detail:**

```bash
# 1. Buat folder baru untuk frontend-only repo
mkdir task-monitor-dashboard
cd task-monitor-dashboard

# 2. Copy semua file dari frontend/
cp -r ../task-monitor/frontend/* .
cp -r ../task-monitor/frontend/.* . 2>/dev/null || true

# 3. Initialize git
git init
git add .
git commit -m "Initial commit - Vite React Dashboard"
git branch -M main

# 4. Create repo di GitHub dan push
git remote add origin https://github.com/YOUR_USERNAME/task-monitor-dashboard.git
git push -u origin main
```

Kemudian connect ke Hostinger:
- Framework: Vite (auto-detect)
- Root directory: `/` (karena sudah frontend-only)
- Build command: `npm run build`
- Output: `dist`

---

### ✅ Solusi 2: Build Script Workaround

Modifikasi `package.json` di **ROOT** untuk build frontend.

**File: package.json (root)**

Tambahkan script:

```json
{
  "name": "task-monitor-monorepo",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "build:frontend": "cd frontend && npm install && npm run build",
    "build:backend": "tsc"
  }
}
```

**Cara Deploy:**
1. Di Hostinger settings:
   - Framework: **Vite** (pilih manual)
   - Root directory: `/` (kosongkan atau root)
   - Build command: `npm run build:frontend`
   - Output directory: `frontend/dist`

2. Hostinger akan:
   - Run `npm install` di root (install root dependencies)
   - Run `npm run build:frontend` (yang akan cd ke frontend dan build)
   - Deploy dari `frontend/dist`

**Kelemahan:**
- ⚠️ Install dependencies 2x (root + frontend)
- ⚠️ Lebih lambat
- ⚠️ Butuh dependencies di root package.json

---

### ✅ Solusi 3: Manual Upload (Paling Cepat untuk Sekarang)

Build locally dan upload hasil build.

**Cara:**

```bash
# 1. Build locally
cd frontend
npm install
npm run build

# 2. Upload via Hostinger File Manager
# - Login Hostinger Panel
# - File Manager → public_html/
# - Delete all files
# - Upload all from frontend/dist/:
#   - index.html
#   - assets/ folder
#   - .htaccess
#   - vite.svg
```

**Keuntungan:**
- ✅ Paling cepat (5 menit)
- ✅ Tidak perlu GitHub
- ✅ Pasti work
- ✅ No configuration needed

**Kelemahan:**
- ❌ Manual process (no auto-deploy)
- ❌ Harus upload setiap update

---

### ❌ Solusi 4: Git Submodule (NOT RECOMMENDED)

Pakai git submodule untuk reference frontend repo.

**Cara:**
```bash
# Di root repo
git submodule add https://github.com/YOUR_USERNAME/frontend-repo.git frontend
```

**Kelemahan:**
- ❌ Kompleks
- ❌ Sulit maintain
- ❌ Hostinger mungkin tidak support submodule dengan baik

---

## Rekomendasi Berdasarkan Situasi

### Jika Mau Auto-Deploy (Production-Ready)
→ **Gunakan Solusi 1: Repository Terpisah**

Ini approach yang paling clean dan officially supported. Setiap push otomatis deploy.

### Jika Mau Cepat Test Sekarang
→ **Gunakan Solusi 3: Manual Upload**

Build locally, upload dist/ ke Hostinger. 5 menit selesai.

### Jika Tetap Mau 1 Repository
→ **Gunakan Solusi 2: Build Script Workaround**

Tapi ini hacky dan tidak ideal.

---

## Implementasi Solusi 1 (Repository Terpisah)

### Step 1: Prepare Frontend-Only Repository

```bash
# Create new directory
mkdir ~/task-monitor-dashboard
cd ~/task-monitor-dashboard

# Copy frontend files
cp -r ~/task-monitor/frontend/* .
cp ~/task-monitor/frontend/.env .
cp ~/task-monitor/frontend/.gitignore .

# Verify structure
ls -la
# Should see:
# - src/
# - public/
# - index.html
# - package.json
# - vite.config.ts
# - etc.
```

### Step 2: Initialize Git

```bash
git init
git add .
git commit -m "Initial commit - Task Monitor Dashboard"
git branch -M main
```

### Step 3: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `task-monitor-dashboard`
3. Description: `Task Monitor Bot Dashboard - React + Vite + TypeScript`
4. Public or Private
5. **DO NOT** initialize with README
6. Click **Create repository**

### Step 4: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/task-monitor-dashboard.git

# Push
git push -u origin main
```

### Step 5: Connect to Hostinger

1. Login Hostinger Panel
2. **Websites** → **Add Website**
3. Select **Node.js Apps**
4. Choose **Import Git Repository**
5. Authorize GitHub
6. Select repository: `task-monitor-dashboard`
7. Select branch: `main`

### Step 6: Configure Build Settings

Hostinger will auto-detect Vite:

```
Framework: Vite ✓
Branch: main
Node version: 22.x
Root directory: /

Build command: npm run build
Output directory: dist
Install command: npm install
```

### Step 7: Add Environment Variables

Add one by one:

**Variable 1:**
- Name: `VITE_API_URL`
- Value: `http://localhost:3001`

**Variable 2:**
- Name: `VITE_WS_URL`
- Value: `http://localhost:3001`

### Step 8: Deploy!

Click **Deploy** and wait 2-5 minutes.

---

## Implementasi Solusi 3 (Manual Upload)

### Step 1: Build Locally

```bash
cd frontend
npm install
npm run build
```

Verify `dist/` folder exists with:
- index.html
- assets/ folder
- .htaccess
- vite.svg

### Step 2: Login Hostinger

1. Go to: https://hpanel.hostinger.com
2. Login with your account
3. Select your website

### Step 3: Open File Manager

1. Click **File Manager** in sidebar
2. Navigate to `public_html/`
3. **Backup existing files** (if any):
   - Select all
   - Download as ZIP
   - Save to computer

### Step 4: Clean public_html

1. Select all files in public_html
2. Click **Delete**
3. Confirm deletion

### Step 5: Upload Files

1. Click **Upload** button
2. Select all files from `frontend/dist/`:
   - Drag & drop or browse
   - Upload `index.html`
   - Upload folder `assets/`
   - Upload `.htaccess`
   - Upload `vite.svg`

Wait for upload to complete.

### Step 6: Verify Structure

Check in File Manager:

```
public_html/
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   ├── react-vendor-xxx.js
│   ├── socket-vendor-xxx.js
│   └── ui-vendor-xxx.js
├── .htaccess
├── index.html
└── vite.svg
```

### Step 7: Set Permissions

1. Select all files
2. Right click → **Permissions**
3. Set folders to **755**
4. Set files to **644**

### Step 8: Test

1. Open your domain in browser
2. Dashboard should load
3. Test login: admin / admin123
4. Test navigation

---

## Kesimpulan

**Hostinger GitHub deployment TIDAK support monorepo dengan subfolder** seperti platform lain.

**Pilihan Terbaik:**
1. **Production**: Repository terpisah (Solusi 1)
2. **Quick Test**: Manual upload (Solusi 3)
3. **Workaround**: Build script (Solusi 2)

**Saya Rekomendasikan:**
- Gunakan **Solusi 3 (Manual Upload)** SEKARANG untuk test
- Setup **Solusi 1 (Repository Terpisah)** nanti untuk auto-deploy

---

## Sources

Research dilakukan dari:
- Hostinger official documentation
- Stack Overflow discussions
- Dev.to tutorials
- Seenode documentation (similar platform)
- GitHub Actions workflows

Content rephrased for compliance with licensing restrictions.
