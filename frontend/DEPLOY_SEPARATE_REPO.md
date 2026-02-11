# Deploy Frontend - Repository Terpisah

## Masalah
Hostinger tidak bisa build dari subfolder `/frontend` karena tetap run build script dari root.

## Solusi: Buat Repository Baru Khusus Frontend

### Step 1: Buat Repository Baru di GitHub

1. Buka GitHub: https://github.com/new
2. Repository name: `task-monitor-dashboard`
3. Description: `Task Monitor Bot Dashboard - React + Vite`
4. Public atau Private (terserah)
5. **JANGAN** initialize dengan README
6. Klik **Create repository**

### Step 2: Push Frontend ke Repository Baru

```bash
# Masuk ke folder frontend
cd frontend

# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Vite React Dashboard"

# Set branch ke main
git branch -M main

# Add remote (ganti YOUR_USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/task-monitor-dashboard.git

# Push
git push -u origin main
```

### Step 3: Connect ke Hostinger

1. Login Hostinger Panel
2. **Websites** → **Add Website** (atau edit existing)
3. Pilih **Connect to GitHub**
4. Authorize Hostinger
5. Pilih repository: `task-monitor-dashboard`
6. Pilih branch: `main`

### Step 4: Configure Build Settings

Hostinger akan auto-detect Vite. Verify settings:

```
Framework: Vite ✓
Branch: main
Node version: 22.x
Root directory: /  (karena ini sudah frontend-only repo)

Build command: npm run build
Output directory: dist
Install command: npm install
```

### Step 5: Add Environment Variables

Di Hostinger panel, tambahkan (satu per satu):

**Variable 1:**
- Name: `VITE_API_URL`
- Value: `http://localhost:3001`

**Variable 2:**
- Name: `VITE_WS_URL`
- Value: `http://localhost:3001`

(Nanti update setelah backend deployed)

### Step 6: Deploy!

Klik **Deploy** dan tunggu 2-5 menit.

---

## Struktur Repository

Sekarang Anda punya 2 repository:

### Repository 1: Backend + Bot (existing)
```
task-monitor/
├── src/
├── dist/
├── package.json
└── ... (backend code)
```

### Repository 2: Frontend Dashboard (new)
```
task-monitor-dashboard/
├── src/
├── dist/
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── ... (frontend code)
```

---

## Keuntungan Approach Ini

✅ **Clean separation** - Frontend dan backend terpisah
✅ **Easy deployment** - Hostinger langsung detect Vite
✅ **Independent updates** - Update frontend tanpa touch backend
✅ **No build conflicts** - Tidak ada confusion antara backend/frontend build
✅ **Better organization** - Setiap repo punya purpose jelas

---

## Update Frontend di Masa Depan

```bash
cd frontend
# Make changes...
git add .
git commit -m "Update: ..."
git push
```

Hostinger akan auto-deploy setiap kali push! 🎉

---

## Alternative: Manual Upload (Jika Tidak Mau GitHub)

Jika tidak mau setup GitHub:

1. Build locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload `dist/` ke Hostinger via File Manager:
   - Login Hostinger Panel
   - File Manager → `public_html/`
   - Delete all files
   - Upload all from `dist/`:
     - `index.html`
     - `assets/` folder
     - `.htaccess`
     - `vite.svg`

3. Done!

---

## Recommended: Separate Repo + GitHub Auto-Deploy

Ini approach paling clean dan professional. Setiap push otomatis deploy! 🚀
