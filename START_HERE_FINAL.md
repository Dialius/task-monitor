# 🚀 START HERE - Final Deployment Steps

## 📊 Current Status

✅ **Backend Deployed**
- Code uploaded to Hostinger
- PM2 running: `task-monitor-bot` (online)
- API server running on port 3001
- MongoDB configured

✅ **Frontend Deployed**
- Dashboard accessible
- Static files serving

✅ **Infrastructure Ready**
- Node.js 20 installed
- All dependencies installed
- Environment variables configured

❌ **API Routing Issue**
- Requests to `/api/*` not working
- Need subdomain to fix

---

## 🎯 What You Need To Do Now

Follow these steps in order:

### 1️⃣ Create Subdomain (5 minutes) - **YOU MUST DO THIS**

**Go to hPanel and create subdomain:**

1. Open: https://hpanel.hostinger.com/
2. Login with your credentials
3. Go to: **Domains → Subdomains**
4. Click: **"Create Subdomain"**
5. Fill in:
   - Subdomain: `api`
   - Domain: `rosybrown-horse-106773.hostingersite.com`
   - Document Root: `/public_html/api`
6. Click: **"Create"**

**Result:** Subdomain `api.rosybrown-horse-106773.hostingersite.com` will be created

---

### 2️⃣ Run Setup Script (2 minutes) - **AUTOMATED**

After creating subdomain, run this on your local machine:

```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Run setup script (already uploaded)
bash ~/setup-subdomain.sh

# Exit SSH
exit
```

**What this does:**
- Updates backend configuration
- Creates API .htaccess
- Restarts PM2

---

### 3️⃣ Rebuild Frontend (3 minutes) - **AUTOMATED**

```bash
# On your local machine
cd D:\task-monitor\frontend

# Rebuild
npm run build
```

---

### 4️⃣ Deploy Frontend (2 minutes) - **CHOOSE ONE**

**Option A: SCP Upload (Recommended)**

```bash
scp -P 65002 -r frontend/dist/* u909490256@153.92.9.187:~/frontend-new/

ssh -p 65002 u909490256@153.92.9.187
cp -r ~/frontend-new/* ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/
exit
```

**Option B: File Manager**

1. Go to hPanel → Files → File Manager
2. Navigate to `/public_html/`
3. Delete: `index.html`, `assets/` folder
4. Upload files from: `D:\task-monitor\frontend\dist\`

---

### 5️⃣ Wait & Verify (10 minutes)

**Wait for DNS propagation (5-15 minutes):**

```bash
# Check DNS
nslookup api.rosybrown-horse-106773.hostingersite.com
```

**Test API:**

```bash
curl https://api.rosybrown-horse-106773.hostingersite.com/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

**Test Dashboard:**

1. Open: https://rosybrown-horse-106773.hostingersite.com/login
2. Login: `admin` / `admin123`
3. Should work!

---

### 6️⃣ Start Bot (2 minutes)

1. In dashboard, click **"Start Bot"**
2. Scan QR code with WhatsApp
3. Bot should connect!

---

## 📚 Documentation

**Main Guides:**
- `COMPLETE_SETUP_STEPS.md` - Detailed step-by-step with troubleshooting
- `SUBDOMAIN_SETUP_GUIDE.md` - Complete subdomain setup guide
- `DEPLOYMENT_STATUS_FINAL.md` - Current status and technical details

**Scripts:**
- `setup-subdomain.sh` - Backend configuration script (already uploaded)
- `deploy-to-hostinger.ps1` - Deployment script (already used)

**Reference:**
- `CURRENT_ISSUE_AND_SOLUTION.md` - Problem analysis
- `API_DEPLOYMENT_SOLUTION.md` - Deployment details

---

## 🚨 Quick Troubleshooting

### DNS Not Working?
```bash
# Wait longer (up to 24 hours)
# Clear DNS cache
ipconfig /flushdns
```

### API Returns 502?
```bash
ssh -p 65002 u909490256@153.92.9.187 "pm2 restart task-monitor-bot"
```

### Dashboard Blank?
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12)

### CORS Errors?
```bash
ssh -p 65002 u909490256@153.92.9.187 "bash ~/setup-subdomain.sh"
```

---

## ✅ Success Checklist

After completing all steps:

- [ ] Subdomain created in hPanel
- [ ] Setup script executed
- [ ] Frontend rebuilt
- [ ] Frontend deployed
- [ ] DNS propagated
- [ ] API health check works
- [ ] Dashboard login works
- [ ] Bot starts successfully
- [ ] WhatsApp connected
- [ ] Bot responds to commands

---

## 🎯 Next Steps After Success

Once everything works:

1. **Test All Features:**
   - `/status` - Check bot status
   - `/help` - List commands
   - `/list_tugas` - View tasks
   - `/add_tugas_cepat` - Add task with AI

2. **Configure Notion:**
   - Verify Notion database connection
   - Test task sync
   - Check reminders

3. **Setup Monitoring:**
   - Check PM2 logs regularly
   - Monitor bot uptime
   - Test WhatsApp connection

4. **Production Checklist:**
   - Change default password
   - Setup backup strategy
   - Document your workflow

---

## 📞 Need Help?

If you get stuck:

1. Check `COMPLETE_SETUP_STEPS.md` for detailed troubleshooting
2. Check PM2 logs: `ssh -p 65002 u909490256@153.92.9.187 "pm2 logs task-monitor-bot"`
3. Let me know which step failed and I'll help debug

---

## 🎉 You're Almost There!

**Estimated Time:** 30 minutes total

**What's Left:**
1. Create subdomain (5 min) ← **START HERE**
2. Run setup script (2 min)
3. Rebuild frontend (3 min)
4. Deploy frontend (2 min)
5. Wait for DNS (10 min)
6. Test & verify (5 min)
7. Start bot (2 min)

**Let's finish this!** 🚀

---

## 📋 Quick Command Reference

```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Run setup
bash ~/setup-subdomain.sh

# Check PM2
pm2 status
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Test API
curl https://api.rosybrown-horse-106773.hostingersite.com/health
```

---

**Ready? Start with Step 1: Create Subdomain in hPanel!** 👆
