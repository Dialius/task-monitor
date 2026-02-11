# 🚀 Auto-Deploy Setup Guide

## Overview

Project ini sekarang punya **GitHub Actions** untuk auto-deploy:
- ✅ **Frontend** auto-deploy ke Hostinger via FTP
- ✅ **Backend** auto-deploy ke Hostinger via SSH
- ✅ Deploy otomatis setiap push ke branch `main`
- ✅ Bisa manual trigger juga

---

## 📁 Workflow Files

### 1. Frontend Deploy (`.github/workflows/deploy-frontend.yml`)

**Trigger:**
- Push ke `main` dengan perubahan di folder `frontend/`
- Manual trigger via GitHub Actions UI

**Process:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Build frontend (`npm run build`)
5. Deploy `frontend/dist/` ke Hostinger via FTP

**Deploy ke:** `/public_html/` (root domain)

### 2. Backend Deploy (`.github/workflows/deploy-backend.yml`)

**Trigger:**
- Push ke `main` dengan perubahan di folder `src/`
- Manual trigger via GitHub Actions UI

**Process:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Build backend (`npm run build:backend`)
5. SSH ke Hostinger
6. Pull latest code
7. Install production dependencies
8. Build backend
9. Restart PM2 process

**Deploy ke:** `/public_html/api/` (subdomain atau subfolder)

---

## 🔧 Setup Instructions

### Step 1: Enable GitHub Actions

GitHub Actions sudah enabled by default untuk public repositories. Untuk private:

1. Buka repository di GitHub
2. **Settings** → **Actions** → **General**
3. **Allow all actions and reusable workflows**
4. **Save**

### Step 2: Add GitHub Secrets

Buka: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Tambahkan secrets berikut:

#### Frontend Secrets (FTP):

```
FTP_SERVER = ftp.yourdomain.com
FTP_USERNAME = u909490256@yourdomain.com
FTP_PASSWORD = your_ftp_password
VITE_API_URL = https://api.yourdomain.com
VITE_WS_URL = https://api.yourdomain.com
```

#### Backend Secrets (SSH):

```
SSH_HOST = yourdomain.com
SSH_USERNAME = u909490256
SSH_PASSWORD = your_ssh_password
SSH_PORT = 65002
```

**Cara dapat info ini:** Lihat file `.github/SETUP_SECRETS.md`

### Step 3: Setup Backend di Hostinger

#### 3.1. SSH ke Hostinger

```bash
ssh u909490256@yourdomain.com -p 65002
```

#### 3.2. Create API Directory

```bash
cd ~/public_html
mkdir -p api
cd api
```

#### 3.3. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/task-monitor.git .
```

#### 3.4. Install Dependencies

```bash
npm install --production
```

#### 3.5. Build Backend

```bash
npm run build:backend
```

#### 3.6. Setup Environment Variables

```bash
nano .env
```

Paste environment variables (MongoDB, Discord, WhatsApp, Notion, dll).

#### 3.7. Install PM2

```bash
npm install -g pm2
```

#### 3.8. Start Backend

```bash
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup
```

### Step 4: Setup Subdomain (Optional)

Jika mau backend di subdomain `api.yourdomain.com`:

1. Hostinger Panel → **Domains**
2. Pilih domain → **Subdomains**
3. Create subdomain: `api`
4. Document root: `/public_html/api`
5. Enable SSL untuk subdomain

### Step 5: Test Auto-Deploy

#### Test Frontend:

```bash
# Edit file frontend
echo "# Test" >> frontend/README.md

# Commit dan push
git add .
git commit -m "Test: Frontend auto-deploy"
git push
```

Buka GitHub → **Actions** → Lihat workflow running

#### Test Backend:

```bash
# Edit file backend
echo "// Test" >> src/bot.ts

# Commit dan push
git add .
git commit -m "Test: Backend auto-deploy"
git push
```

Buka GitHub → **Actions** → Lihat workflow running

---

## 🎯 How It Works

### Frontend Deploy Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Developer Push ke GitHub                             │
│    git push origin main                                 │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. GitHub Actions Triggered                             │
│    - Detect changes in frontend/                        │
│    - Start workflow                                     │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Build Process                                        │
│    - npm ci (install dependencies)                      │
│    - npm run build (Vite build)                         │
│    - Output: frontend/dist/                             │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. FTP Deploy                                           │
│    - Connect to Hostinger FTP                           │
│    - Upload frontend/dist/ to /public_html/             │
│    - Clean old files                                    │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Live! 🎉                                             │
│    https://yourdomain.com                               │
└─────────────────────────────────────────────────────────┘
```

### Backend Deploy Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Developer Push ke GitHub                             │
│    git push origin main                                 │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. GitHub Actions Triggered                             │
│    - Detect changes in src/                             │
│    - Start workflow                                     │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Build Process (on GitHub)                            │
│    - npm ci                                             │
│    - npm run build:backend                              │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. SSH to Hostinger                                     │
│    - Connect via SSH                                    │
│    - cd ~/public_html/api                               │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Update & Rebuild (on Hostinger)                      │
│    - git pull origin main                               │
│    - npm install --production                           │
│    - npm run build:backend                              │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Restart PM2                                          │
│    - pm2 restart task-monitor-bot                       │
│    - pm2 save                                           │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Live! 🎉                                             │
│    https://api.yourdomain.com                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoring Deployments

### View Deployment Status

1. Buka repository di GitHub
2. Klik tab **Actions**
3. Lihat list workflows:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - 🟡 Yellow dot = Running

### View Deployment Logs

1. Klik workflow yang ingin dilihat
2. Klik job name (contoh: "deploy")
3. Expand steps untuk lihat logs detail

### Manual Trigger Deployment

1. Tab **Actions**
2. Pilih workflow (Frontend atau Backend)
3. Klik **Run workflow**
4. Pilih branch (main)
5. Klik **Run workflow**

---

## 🐛 Troubleshooting

### Frontend Deploy Failed: "FTP Upload Failed"

**Check:**
- FTP credentials benar?
- FTP enabled di Hostinger?
- Network/firewall issue?

**Debug:**
```bash
# Test FTP connection
ftp ftp.yourdomain.com
# Login dengan FTP_USERNAME dan FTP_PASSWORD
```

### Backend Deploy Failed: "SSH Connection Failed"

**Check:**
- SSH credentials benar?
- SSH enabled di Hostinger?
- SSH port benar (65002)?

**Debug:**
```bash
# Test SSH connection
ssh u909490256@yourdomain.com -p 65002
```

### Backend Deploy Success tapi Bot Tidak Running

**Check PM2 status:**
```bash
ssh u909490256@yourdomain.com -p 65002
pm2 status
pm2 logs task-monitor-bot
```

**Restart manually:**
```bash
pm2 restart task-monitor-bot
```

### Changes Tidak Muncul di Website

**Penyebab:** Browser cache

**Solusi:**
- Hard refresh: Ctrl+Shift+R
- Clear cache
- Incognito mode

---

## 🎨 Customization

### Change Deploy Branch

Edit workflow file, ubah:

```yaml
on:
  push:
    branches:
      - main  # Ubah ke branch lain
```

### Add Deploy Notifications

Tambahkan step di workflow:

```yaml
- name: 📢 Notify Deployment
  if: success()
  run: |
    curl -X POST ${{ secrets.DISCORD_WEBHOOK }} \
      -H "Content-Type: application/json" \
      -d '{"content":"✅ Deployment successful!"}'
```

### Deploy to Multiple Environments

Buat workflow terpisah untuk staging:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop
```

---

## 📝 Best Practices

### 1. Test Locally Before Push

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
npm run build:backend
node dist/index.js
```

### 2. Use Feature Branches

```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create Pull Request
# Merge to main → Auto-deploy!
```

### 3. Monitor Deployments

- Check GitHub Actions after every push
- Setup notifications (email, Slack, Discord)
- Monitor PM2 logs: `pm2 logs`

### 4. Rollback if Needed

```bash
# Rollback to previous commit
git revert HEAD
git push

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force
```

---

## 🎉 Benefits

✅ **No Manual Upload** - Push dan deploy otomatis
✅ **Consistent Deployments** - Sama setiap kali
✅ **Version Control** - Semua deployment tracked
✅ **Rollback Easy** - Revert commit = rollback
✅ **CI/CD Pipeline** - Professional workflow
✅ **Time Saving** - Deploy dalam hitungan menit

---

## 📚 Next Steps

1. ✅ Setup GitHub Secrets
2. ✅ Setup backend di Hostinger
3. ✅ Test auto-deploy
4. ✅ Monitor deployments
5. ✅ Enjoy automated workflow!

---

## 🆘 Need Help?

- Check `.github/SETUP_SECRETS.md` untuk setup secrets
- Check GitHub Actions logs untuk debug
- Check PM2 logs: `pm2 logs task-monitor-bot`
- Contact Hostinger support jika ada masalah server

Happy deploying! 🚀
