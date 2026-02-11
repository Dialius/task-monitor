# Build Script Workaround - Panduan Lengkap

## Konsep Dasar

Build Script Workaround adalah teknik untuk "menipu" Hostinger agar build frontend dari monorepo dengan menambahkan custom script di root `package.json`.

## Cara Kerja Detail

### 1. Hostinger Clone Repository

```bash
# Hostinger melakukan:
git clone https://github.com/yourusername/task-monitor.git
cd task-monitor
```

Hasil: Hostinger dapat seluruh monorepo
```
task-monitor/
├── src/              # Backend code
├── frontend/         # Frontend code
├── package.json      # Root package.json (KITA MODIFIKASI INI)
└── ...
```

### 2. Hostinger Install Dependencies

```bash
# Hostinger run:
npm install
```

Ini install dependencies yang ada di root `package.json` (backend dependencies).

### 3. Hostinger Run Build Command

```bash
# Hostinger run:
npm run build:frontend
```

Ini trigger script yang kita tambahkan di root `package.json`:

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm install && npm run build"
  }
}
```

### 4. Script Kita Dijalankan

Script `build:frontend` melakukan 3 hal:

**Step 1: `cd frontend`**
- Pindah ke folder frontend
- Working directory sekarang: `/task-monitor/frontend`

**Step 2: `npm install`**
- Install dependencies frontend
- Baca `frontend/package.json`
- Install React, Vite, dll

**Step 3: `npm run build`**
- Run Vite build
- Compile TypeScript
- Bundle assets
- Output ke `frontend/dist/`

### 5. Hostinger Deploy Output

Hostinger ambil file dari `frontend/dist/` dan deploy ke domain.

---

## Implementasi Step-by-Step

### Step 1: Modifikasi Root package.json

File `package.json` di root sudah saya update dengan script:

```json
{
  "name": "multi-platform-class-reminder-bot",
  "scripts": {
    "build": "tsc",
    "build:frontend": "cd frontend && npm install && npm run build",
    "build:backend": "tsc"
  }
}
```

**Penjelasan:**
- `build` - Build backend (original)
- `build:frontend` - Build frontend (NEW!)
- `build:backend` - Build backend (alias)

### Step 2: Commit & Push Changes

```bash
# Add changes
git add package.json

# Commit
git commit -m "Add build:frontend script for Hostinger deployment"

# Push
git push origin main
```

### Step 3: Configure Hostinger

Login ke Hostinger dan set:

#### Framework Settings:
```
Framework: Vite
Branch: main
Node version: 22.x
Root directory: /  (KOSONGKAN atau /)
```

#### Build Settings:
```
Install command: npm install
Build command: npm run build:frontend
Output directory: frontend/dist
```

#### Environment Variables:
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### Step 4: Deploy

Klik **Deploy** dan tunggu.

---

## Proses Build di Hostinger

### Timeline Build:

```
[00:00] Clone repository
[00:05] npm install (root dependencies)
[00:15] npm run build:frontend
[00:16]   ↳ cd frontend
[00:17]   ↳ npm install (frontend dependencies)
[00:45]   ↳ npm run build (Vite build)
[01:00] Copy frontend/dist/ to deployment
[01:05] Deploy complete!
```

### Log Output yang Akan Muncul:

```bash
> Cloning repository...
✓ Repository cloned

> Installing dependencies...
npm install
added 689 packages in 10s

> Building application...
npm run build:frontend

> cd frontend && npm install && npm run build

npm install
added 450 packages in 30s

> task-monitor-dashboard@1.0.0 build
> tsc -b && vite build

vite v7.3.1 building for production...
✓ 1814 modules transformed.
dist/index.html                   0.70 kB
dist/assets/index-xxx.css        19.50 kB
dist/assets/index-xxx.js        278.96 kB
✓ built in 15s

> Deploying to domain...
✓ Deployment successful!
```

---

## Struktur File Setelah Build

### Di Server Hostinger:

```
/home/u909490256/domains/yourdomain.com/
├── .builds/
│   └── source/
│       └── repository/          # Clone dari GitHub
│           ├── src/             # Backend (tidak dipakai)
│           ├── frontend/
│           │   ├── src/
│           │   ├── dist/        # ← Build output
│           │   │   ├── index.html
│           │   │   ├── assets/
│           │   │   └── ...
│           │   ├── package.json
│           │   └── ...
│           └── package.json
│
└── public_html/                 # ← Deployment target
    ├── index.html               # Copied from frontend/dist/
    ├── assets/
    └── ...
```

---

## Keuntungan Build Script Workaround

### ✅ Pros:

1. **Tetap 1 Repository**
   - Tidak perlu split repository
   - Backend dan frontend tetap dalam 1 repo
   - Mudah maintain

2. **GitHub Auto-Deploy**
   - Push ke GitHub → Auto deploy
   - Tidak perlu manual upload
   - CI/CD otomatis

3. **Flexible**
   - Bisa build backend atau frontend
   - Bisa tambah script lain
   - Easy to customize

4. **Version Control**
   - Semua dalam 1 repo
   - History lengkap
   - Easy rollback

### ❌ Cons:

1. **Install Dependencies 2x**
   - Root dependencies (backend)
   - Frontend dependencies
   - Build time lebih lama (~1-2 menit)

2. **Disk Space**
   - 2 set node_modules
   - Root: ~500MB
   - Frontend: ~300MB
   - Total: ~800MB

3. **Potential Conflicts**
   - Jika ada dependency dengan nama sama
   - Bisa conflict antara root dan frontend
   - Perlu careful management

4. **Build Time**
   - Lebih lama dari repository terpisah
   - Root install: ~10s
   - Frontend install: ~30s
   - Frontend build: ~15s
   - Total: ~55s vs ~45s (separate repo)

---

## Troubleshooting

### Problem 1: "cd: no such file or directory"

**Cause:** Folder `frontend` tidak ada di repository

**Solution:**
```bash
# Verify folder exists
ls -la
# Should see frontend/ folder

# If not, check .gitignore
cat .gitignore
# Make sure frontend/ is not ignored
```

### Problem 2: "npm: command not found in frontend"

**Cause:** npm tidak tersedia di subfolder

**Solution:**
Script sudah benar, ini seharusnya tidak terjadi. Tapi jika terjadi:

```json
{
  "scripts": {
    "build:frontend": "cd frontend && /usr/bin/npm install && /usr/bin/npm run build"
  }
}
```

### Problem 3: Build Success tapi Deploy Blank Page

**Cause:** Output directory salah

**Solution:**
Pastikan di Hostinger settings:
```
Output directory: frontend/dist
```

Bukan:
```
Output directory: dist  ❌
```

### Problem 4: Environment Variables Tidak Work

**Cause:** Vite tidak dapat env vars

**Solution:**
1. Pastikan prefix `VITE_`:
   ```
   VITE_API_URL=...  ✓
   API_URL=...       ❌
   ```

2. Rebuild setelah update env vars

3. Check di browser console:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```

### Problem 5: "Cannot find module 'vite'"

**Cause:** Frontend dependencies tidak terinstall

**Solution:**
Script sudah include `npm install`, tapi jika masih error:

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm ci && npm run build"
  }
}
```

`npm ci` lebih reliable dari `npm install` untuk CI/CD.

---

## Optimasi Build Time

### 1. Use npm ci Instead of npm install

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm ci && npm run build"
  }
}
```

**Keuntungan:**
- Lebih cepat (~20% faster)
- Lebih reliable
- Clean install

### 2. Cache node_modules

Hostinger biasanya cache node_modules antar build.

Jika tidak, tambahkan di script:

```json
{
  "scripts": {
    "build:frontend": "cd frontend && ([ -d node_modules ] || npm ci) && npm run build"
  }
}
```

Ini skip install jika node_modules sudah ada.

### 3. Parallel Install (Advanced)

Jika mau install root dan frontend parallel:

```json
{
  "scripts": {
    "build:frontend": "npm install & cd frontend && npm install && wait && npm run build"
  }
}
```

Tapi ini risky, bisa conflict.

---

## Alternative Scripts

### Option A: Separate Install & Build

```json
{
  "scripts": {
    "install:frontend": "cd frontend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "deploy:frontend": "npm run install:frontend && npm run build:frontend"
  }
}
```

Di Hostinger:
```
Build command: npm run deploy:frontend
```

### Option B: With Cleanup

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm install && npm run build && cd .. && echo 'Build complete!'"
  }
}
```

### Option C: With Error Handling

```json
{
  "scripts": {
    "build:frontend": "cd frontend && npm install || exit 1 && npm run build || exit 1"
  }
}
```

Ini akan stop jika install atau build gagal.

---

## Testing Locally

Sebelum push ke Hostinger, test dulu locally:

```bash
# Test script
npm run build:frontend

# Should see:
# - npm install output
# - Vite build output
# - frontend/dist/ folder created

# Verify output
ls -la frontend/dist/
# Should see:
# - index.html
# - assets/
# - .htaccess
# - vite.svg
```

---

## Deployment Checklist

Sebelum deploy ke Hostinger:

- [ ] Script `build:frontend` added to root package.json
- [ ] Changes committed and pushed to GitHub
- [ ] Hostinger settings configured:
  - [ ] Framework: Vite
  - [ ] Build command: `npm run build:frontend`
  - [ ] Output directory: `frontend/dist`
- [ ] Environment variables added:
  - [ ] VITE_API_URL
  - [ ] VITE_WS_URL
- [ ] Tested locally with `npm run build:frontend`
- [ ] frontend/dist/ folder exists after local build

---

## Monitoring Build

### Check Build Logs

Di Hostinger dashboard:
1. Go to your website
2. Click **Deployments**
3. Click latest deployment
4. View **Build logs**

### Common Log Messages

**Success:**
```
✓ Repository cloned
✓ Dependencies installed
✓ Application built
✓ Deployment successful
```

**Failure:**
```
✗ Build failed
Error: Command failed: npm run build:frontend
```

Check full logs untuk detail error.

---

## Update Frontend di Masa Depan

### Workflow:

```bash
# 1. Make changes di frontend/
cd frontend
# ... edit files ...

# 2. Test locally
npm run dev

# 3. Build locally untuk verify
npm run build

# 4. Commit & push
git add .
git commit -m "Update: ..."
git push

# 5. Hostinger auto-deploy!
# Wait 1-2 minutes
# Check deployment logs
# Test di browser
```

---

## Kesimpulan

Build Script Workaround adalah solusi **middle-ground** antara:
- Repository terpisah (paling clean)
- Manual upload (paling cepat)

**Cocok untuk:**
- ✅ Mau tetap 1 repository
- ✅ Mau auto-deploy
- ✅ Tidak masalah build time lebih lama
- ✅ Tidak masalah disk space lebih besar

**Tidak cocok untuk:**
- ❌ Butuh build super cepat
- ❌ Disk space terbatas
- ❌ Banyak conflict dependencies

---

## Next Steps

1. ✅ Script sudah ditambahkan di package.json
2. 🔄 Commit & push changes
3. 🔄 Configure Hostinger settings
4. 🔄 Deploy!

Siap untuk commit dan push? 🚀
