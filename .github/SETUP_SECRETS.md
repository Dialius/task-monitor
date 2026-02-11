# Setup GitHub Secrets untuk Auto-Deploy

## 📋 Secrets yang Dibutuhkan

Untuk auto-deploy work, Anda perlu tambahkan secrets di GitHub repository.

### 1. Buka Repository Settings

1. Buka repository di GitHub: https://github.com/Dialius/task-monitor
2. Klik **Settings** (tab paling kanan)
3. Sidebar kiri → **Secrets and variables** → **Actions**
4. Klik **New repository secret**

---

## 🔐 Secrets untuk Deploy (SSH)

Berdasarkan info SSH Anda:

### SSH_HOST
- **Name:** `SSH_HOST`
- **Value:** `153.92.9.187`
- **Keterangan:** IP server Hostinger Anda

### SSH_USERNAME
- **Name:** `SSH_USERNAME`
- **Value:** `u909490256`
- **Keterangan:** Username SSH Anda

### SSH_PASSWORD
- **Name:** `SSH_PASSWORD`
- **Value:** `[password SSH Anda]`
- **Keterangan:** Password yang Anda pakai untuk SSH login

### SSH_PORT
- **Name:** `SSH_PORT`
- **Value:** `65002`
- **Keterangan:** Port SSH Hostinger

---

## 🔐 Secrets untuk Frontend Environment

### VITE_API_URL
- **Name:** `VITE_API_URL`
- **Value:** `https://rosybrown-horse-106773.hostingersite.com/api` (atau subdomain jika ada)
- **Keterangan:** URL backend API

### VITE_WS_URL
- **Name:** `VITE_WS_URL`
- **Value:** `https://rosybrown-horse-106773.hostingersite.com` (atau subdomain jika ada)
- **Keterangan:** URL WebSocket server

---

## 📝 Cara Tambah Secret

1. **Buka GitHub Repository:** https://github.com/Dialius/task-monitor
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Masukkan **Name** dan **Value**
5. **Add secret**
6. Ulangi untuk semua secrets

---

## ✅ Checklist Secrets

Pastikan semua secrets ini sudah ditambahkan:

- [ ] SSH_HOST = `153.92.9.187`
- [ ] SSH_USERNAME = `u909490256`
- [ ] SSH_PASSWORD = `[your password]`
- [ ] SSH_PORT = `65002`
- [ ] VITE_API_URL = `https://rosybrown-horse-106773.hostingersite.com/api`
- [ ] VITE_WS_URL = `https://rosybrown-horse-106773.hostingersite.com`

---

## 🎯 Path Structure di Hostinger

Berdasarkan SSH info Anda:

```
/home/u909490256/domains/
├── jastiphype.shop/                                    (project lain)
└── rosybrown-horse-106773.hostingersite.com/          (project ini)
    ├── DO_NOT_UPLOAD_HERE/
    └── public_html/                                    (frontend)
        └── api/                                        (backend - perlu dibuat)
```

---

## 🔧 Setup Backend Directory

Sebelum auto-deploy work, Anda perlu setup backend directory dulu:

```bash
# SSH ke Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Navigate ke domain
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html

# Create API directory
mkdir -p api
cd api

# Clone repository
git clone https://github.com/Dialius/task-monitor.git .

# Install dependencies
npm install --production

# Build
npm run build:backend

# Create .env file
nano .env
# Paste your environment variables (MongoDB, Discord, WhatsApp, Notion, dll)

# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup
```

---

## 🧪 Test Auto-Deploy

### Test Frontend Deploy:

```bash
# Edit file frontend
echo "# Test" >> frontend/README.md

# Commit dan push
git add .
git commit -m "Test: Frontend auto-deploy"
git push
```

Buka GitHub → **Actions** → Lihat workflow "Deploy Frontend to Hostinger" running

### Test Backend Deploy:

```bash
# Edit file backend
echo "// Test" >> src/bot.ts

# Commit dan push
git add .
git commit -m "Test: Backend auto-deploy"
git push
```

Buka GitHub → **Actions** → Lihat workflow "Deploy Backend to Hostinger" running

---

## 🐛 Troubleshooting

### Workflow Failed: "SSH connection failed"

**Check:**
1. SSH_HOST = `153.92.9.187` ✓
2. SSH_USERNAME = `u909490256` ✓
3. SSH_PASSWORD benar?
4. SSH_PORT = `65002` ✓

**Test SSH manually:**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

### Backend Deploy Failed: "Directory not found"

**Penyebab:** Backend directory belum dibuat.

**Solusi:** Setup backend directory dulu (lihat section "Setup Backend Directory" di atas)

### Frontend Deploy Success tapi Blank Page

**Check:**
1. Browser console (F12) untuk error
2. VITE_API_URL dan VITE_WS_URL benar?
3. Backend running? Check: `pm2 status`

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [SCP Action](https://github.com/appleboy/scp-action)

---

## 🎉 Setelah Setup

Setiap kali push ke branch `main` atau `master`:
- ✅ Frontend auto-deploy jika ada perubahan di folder `frontend/`
- ✅ Backend auto-deploy jika ada perubahan di folder `src/`
- ✅ Tidak perlu manual upload lagi!
- ✅ Deployment history tersimpan di GitHub Actions

Enjoy auto-deploy! 🚀
