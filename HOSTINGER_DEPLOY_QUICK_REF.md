# Hostinger Deploy - Quick Reference

## ✅ Yang Sudah Dilakukan

1. ✅ Script `build:frontend` ditambahkan ke root `package.json`
2. ✅ Frontend sudah siap deploy

## 🚀 Langkah Deploy (5 Menit)

### 1. Commit & Push

```bash
git add package.json
git commit -m "Add build:frontend script for Hostinger"
git push origin main
```

### 2. Configure Hostinger

Login: https://hpanel.hostinger.com

**Framework Settings:**
```
Framework: Vite
Branch: main
Node version: 22.x
Root directory: /  (kosongkan)
```

**Build Settings:**
```
Install command: npm install
Build command: npm run build:frontend
Output directory: frontend/dist
```

**Environment Variables:**

Variable 1:
- Name: `VITE_API_URL`
- Value: `http://localhost:3001`

Variable 2:
- Name: `VITE_WS_URL`
- Value: `http://localhost:3001`

### 3. Deploy!

Klik **Deploy** → Tunggu 1-2 menit → Done! 🎉

---

## 📋 Cara Kerja

```
Hostinger
  ↓
Clone repo
  ↓
npm install (root)
  ↓
npm run build:frontend
  ↓
  cd frontend
  npm install
  npm run build
  ↓
Deploy frontend/dist/
  ↓
Live! 🚀
```

---

## 🔍 Verify Build Locally

```bash
# Test script
npm run build:frontend

# Check output
ls frontend/dist/
# Should see: index.html, assets/, .htaccess
```

---

## ⚠️ Troubleshooting

### Build Failed?

Check Hostinger build logs:
1. Dashboard → Deployments
2. Click latest deployment
3. View logs

### Common Issues:

**"Cannot find frontend"**
→ Check Root directory: `/` (bukan `/frontend`)

**"Build command failed"**
→ Check Build command: `npm run build:frontend`

**"Output not found"**
→ Check Output directory: `frontend/dist`

**Blank page after deploy**
→ Check environment variables added

---

## 📝 Update Frontend

```bash
# 1. Edit files
cd frontend
# ... make changes ...

# 2. Commit & push
git add .
git commit -m "Update: ..."
git push

# 3. Auto-deploy!
# Hostinger will rebuild automatically
```

---

## 🎯 Settings Summary

Copy-paste ini ke Hostinger:

```
Framework: Vite
Branch: main
Node: 22.x
Root: /
Install: npm install
Build: npm run build:frontend
Output: frontend/dist

Env Vars:
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

---

## ✨ Done!

Setelah deploy success:
1. Buka domain Anda
2. Login: admin / admin123
3. Test dashboard
4. ⚠️ Ganti password!

---

Butuh help? Baca: `BUILD_SCRIPT_WORKAROUND_GUIDE.md`
