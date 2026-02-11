# Setup GitHub Secrets untuk Auto-Deploy

## 📋 Secrets yang Dibutuhkan

Untuk auto-deploy work, Anda perlu tambahkan secrets di GitHub repository.

### 1. Buka Repository Settings

1. Buka repository di GitHub
2. Klik **Settings** (tab paling kanan)
3. Sidebar kiri → **Secrets and variables** → **Actions**
4. Klik **New repository secret**

---

## 🔐 Secrets untuk Frontend Deploy (FTP)

### FTP_SERVER
- **Name:** `FTP_SERVER`
- **Value:** `ftp.yourdomain.com` atau IP FTP server Hostinger
- **Cara dapat:** Hostinger Panel → File Manager → FTP Accounts

### FTP_USERNAME
- **Name:** `FTP_USERNAME`
- **Value:** Username FTP Anda (biasanya: `u909490256` atau email)
- **Cara dapat:** Hostinger Panel → File Manager → FTP Accounts

### FTP_PASSWORD
- **Name:** `FTP_PASSWORD`
- **Value:** Password FTP Anda
- **Cara dapat:** Hostinger Panel → File Manager → FTP Accounts → Reset password jika lupa

### VITE_API_URL
- **Name:** `VITE_API_URL`
- **Value:** `https://api.yourdomain.com` atau `http://localhost:3001` (untuk testing)
- **Keterangan:** URL backend API

### VITE_WS_URL
- **Name:** `VITE_WS_URL`
- **Value:** `https://api.yourdomain.com` atau `http://localhost:3001`
- **Keterangan:** URL WebSocket server

---

## 🔐 Secrets untuk Backend Deploy (SSH)

### SSH_HOST
- **Name:** `SSH_HOST`
- **Value:** `yourdomain.com` atau IP server
- **Cara dapat:** Hostinger Panel → Advanced → SSH Access

### SSH_USERNAME
- **Name:** `SSH_USERNAME`
- **Value:** Username SSH (biasanya: `u909490256`)
- **Cara dapat:** Hostinger Panel → Advanced → SSH Access

### SSH_PASSWORD
- **Name:** `SSH_PASSWORD`
- **Value:** Password SSH Anda
- **Cara dapat:** Hostinger Panel → Advanced → SSH Access

### SSH_PORT
- **Name:** `SSH_PORT`
- **Value:** `65002` (default Hostinger) atau port SSH Anda
- **Cara dapat:** Hostinger Panel → Advanced → SSH Access

---

## 📝 Cara Tambah Secret

1. **Buka GitHub Repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Masukkan **Name** dan **Value**
5. **Add secret**
6. Ulangi untuk semua secrets

---

## 🎯 Cara Dapat Info FTP dari Hostinger

### Step 1: Login Hostinger Panel
https://hpanel.hostinger.com

### Step 2: Buka File Manager
Sidebar → **File Manager**

### Step 3: Klik FTP Accounts
Di bagian atas File Manager, ada button **FTP Accounts**

### Step 4: Copy Info
```
FTP Server: ftp.yourdomain.com
Username: u909490256@yourdomain.com
Password: (klik Change Password jika lupa)
Port: 21
```

---

## 🎯 Cara Dapat Info SSH dari Hostinger

### Step 1: Login Hostinger Panel
https://hpanel.hostinger.com

### Step 2: Buka Advanced
Sidebar → **Advanced**

### Step 3: Klik SSH Access
Di menu Advanced, pilih **SSH Access**

### Step 4: Enable SSH (jika belum)
Klik **Enable SSH Access**

### Step 5: Copy Info
```
SSH Host: yourdomain.com
Username: u909490256
Password: (sama dengan Hostinger panel password)
Port: 65002
```

---

## ✅ Checklist Secrets

Pastikan semua secrets ini sudah ditambahkan:

### Frontend Deploy:
- [ ] FTP_SERVER
- [ ] FTP_USERNAME
- [ ] FTP_PASSWORD
- [ ] VITE_API_URL
- [ ] VITE_WS_URL

### Backend Deploy:
- [ ] SSH_HOST
- [ ] SSH_USERNAME
- [ ] SSH_PASSWORD
- [ ] SSH_PORT

---

## 🧪 Test Auto-Deploy

### Test Frontend Deploy:

1. Edit file di folder `frontend/` (contoh: `frontend/README.md`)
2. Commit dan push:
   ```bash
   git add .
   git commit -m "Test: Frontend auto-deploy"
   git push
   ```
3. Buka GitHub → **Actions** tab
4. Lihat workflow "Deploy Frontend to Hostinger" running
5. Tunggu sampai selesai (hijau ✅)
6. Buka domain Anda, perubahan harus muncul

### Test Backend Deploy:

1. Edit file di folder `src/` (contoh: `src/bot.ts`)
2. Commit dan push:
   ```bash
   git add .
   git commit -m "Test: Backend auto-deploy"
   git push
   ```
3. Buka GitHub → **Actions** tab
4. Lihat workflow "Deploy Backend to Hostinger" running
5. Tunggu sampai selesai (hijau ✅)
6. SSH ke server dan check: `pm2 status`

---

## 🐛 Troubleshooting

### Workflow Failed: "FTP connection failed"

**Penyebab:** FTP credentials salah atau FTP tidak enabled.

**Solusi:**
1. Check FTP_SERVER, FTP_USERNAME, FTP_PASSWORD benar
2. Enable FTP di Hostinger Panel
3. Test FTP connection dengan FileZilla

### Workflow Failed: "SSH connection failed"

**Penyebab:** SSH credentials salah atau SSH tidak enabled.

**Solusi:**
1. Check SSH_HOST, SSH_USERNAME, SSH_PASSWORD, SSH_PORT benar
2. Enable SSH di Hostinger Panel
3. Test SSH: `ssh u909490256@yourdomain.com -p 65002`

### Workflow Success tapi Changes Tidak Muncul

**Penyebab:** Cache browser atau CDN.

**Solusi:**
1. Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check di incognito mode

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FTP Deploy Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [SSH Action](https://github.com/appleboy/ssh-action)
- [Hostinger FTP Guide](https://support.hostinger.com/en/articles/1583245-how-to-upload-files-using-ftp)
- [Hostinger SSH Guide](https://support.hostinger.com/en/articles/1583227-how-to-use-ssh)

---

## 🎉 Setelah Setup

Setiap kali push ke branch `main`:
- ✅ Frontend auto-deploy jika ada perubahan di folder `frontend/`
- ✅ Backend auto-deploy jika ada perubahan di folder `src/`
- ✅ Tidak perlu manual upload lagi!
- ✅ Deployment history tersimpan di GitHub Actions

Enjoy auto-deploy! 🚀
