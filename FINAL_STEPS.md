# 🎯 Final Steps - Complete Your Setup

## ✅ Yang Sudah Selesai:
- ✅ NVM installed
- ✅ Node.js 20 installed
- ✅ PM2 installed
- ✅ Repository cloned
- ✅ Dependencies installed
- ✅ Backend built
- ✅ Bot started with PM2
- ✅ PM2 process saved

## 🎯 Yang Masih Perlu Dilakukan:

---

## STEP 1: Make NVM Persistent ⚠️ PENTING!

**Kenapa penting?** Agar NVM tetap available setelah logout/login dari SSH.

**Command:**
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

**Verify:**
```bash
# Logout dan login lagi
exit

# SSH lagi
ssh -p 65002 u909490256@153.92.9.187

# Check NVM
nvm --version
node -v
npm -v
```

**Expected Output:**
```
0.39.7
v20.x.x
10.x.x
```

---

## STEP 2: Setup PM2 Startup Script (RECOMMENDED)

**Kenapa penting?** Agar bot auto-start setelah server reboot.

**Command:**
```bash
pm2 startup
```

**Output akan seperti ini:**
```
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/u909490256/.nvm/versions/node/v20.x.x/bin /home/u909490256/.nvm/versions/node/v20.x.x/lib/node_modules/pm2/bin/pm2 startup systemd -u u909490256 --hp /home/u909490256
```

**COPY command yang muncul dan jalankan!**

**Note:** Jika tidak punya sudo access di Hostinger, skip step ini. Bot tetap akan running, tapi perlu manual start setelah server reboot.

---

## STEP 3: Test Dashboard Login 🌐

**URL:** https://rosybrown-horse-106773.hostingersite.com

### First Login (Create Admin Account):

1. **Open dashboard URL**
2. **Enter WhatsApp number:** `628994630519`
3. **Enter any password** (this will be your admin password)
4. **Click "Login"**

**Expected Result:**
- First login will create admin account
- Redirect to dashboard home page
- See bot status: "Stopped" (bot not started yet)

### Subsequent Logins:
- Use same WhatsApp number: `628994630519`
- Use password you set on first login

---

## STEP 4: Start Bot from Dashboard 🤖

### Via Dashboard:

1. **Login to dashboard**
2. **Navigate to "Home" or "Bot Control"**
3. **Click "Start Bot" button**
4. **Wait for bot to initialize** (~10-30 seconds)
5. **Check status:** Should show "Running" 🟢

### Expected Logs:
```
✓ MongoDB connected
✓ WhatsApp client initializing...
✓ WhatsApp QR code generated (if first time)
✓ WhatsApp connected (if session exists)
✓ Notion service initialized
✓ Bot ready!
```

### WhatsApp QR Code (First Time):

**If this is first time connecting WhatsApp:**
1. Check logs in dashboard (Logs page)
2. Look for QR code (ASCII art)
3. Scan QR code with WhatsApp (Linked Devices)
4. Wait for connection

**If session exists:**
- Bot will auto-connect using saved session
- No QR code needed

---

## STEP 5: Test Auto-Deploy 🚀

### Steps:

1. **Edit file di local** (contoh: tambah comment)
   ```bash
   # Di local machine
   cd D:\task-monitor
   
   # Edit file (contoh: src/bot.ts)
   # Tambah comment: // Test auto-deploy
   
   # Commit
   git add .
   git commit -m "test: Test auto-deploy"
   
   # Push
   git push origin main
   ```

2. **Check GitHub Actions**
   - Open: https://github.com/Dialius/task-monitor/actions
   - Should see new workflow running
   - Wait for completion (~2-3 minutes)

3. **Verify deployment**
   ```bash
   # SSH ke Hostinger
   ssh -p 65002 u909490256@153.92.9.187
   
   # Check PM2 status
   pm2 status
   
   # Check logs
   pm2 logs task-monitor-bot --lines 50
   ```

**Expected Result:**
- GitHub Actions: ✅ Success
- Bot: Restarted automatically
- Logs: Show new deployment
- No errors

---

## STEP 6: Verify Everything Working 🔍

### Check Bot Status:
```bash
pm2 status
```

**Expected:**
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ task-monitor-bot   │ fork     │ 0    │ online    │ 0%       │ 65.0mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### Check Logs:
```bash
pm2 logs task-monitor-bot --lines 50
```

**Look for:**
- ✅ No errors
- ✅ MongoDB connected
- ✅ WhatsApp connected (if enabled)
- ✅ API server running
- ✅ WebSocket server active

### Check Dashboard:
- Open: https://rosybrown-horse-106773.hostingersite.com
- Login successful
- Bot status: 🟢 Running
- Logs showing in real-time
- Metrics updating

### Check API:
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xx..."
}
```

---

## STEP 7: Test Bot Commands (Optional) 💬

### WhatsApp Commands:

**Send to WhatsApp group/channel:**
```
/status
```

**Expected Response:**
- Bot info
- Connection status
- Admin list

**Try other commands:**
```
/help
/list_tugas
/add_tugas_cepat besok ujian matematika
```

---

## STEP 8: Monitor for 24 Hours 📊

### Daily Check:
```bash
# SSH ke Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Quick health check
pm2 status && pm2 logs task-monitor-bot --lines 20
```

### What to Look For:
- ✅ Bot status: online
- ✅ No crashes (restart count = 0)
- ✅ Memory usage stable (~50-100 MB)
- ✅ No errors in logs
- ✅ WhatsApp connection stable
- ✅ MongoDB connection stable

---

## 🎉 Setup Complete Checklist

- [ ] NVM persistent in ~/.bashrc
- [ ] PM2 startup script configured (optional)
- [ ] Dashboard login tested
- [ ] Admin account created
- [ ] Bot started from dashboard
- [ ] WhatsApp connected (QR code scanned)
- [ ] Auto-deploy tested
- [ ] Bot commands tested
- [ ] 24-hour monitoring done
- [ ] No errors in logs

---

## 🚨 Troubleshooting

### Issue: Dashboard login fails
**Solution:**
```bash
# Check API server
pm2 logs task-monitor-bot --lines 50

# Check if API running
curl http://localhost:3001/api/health
```

### Issue: Bot won't start from dashboard
**Solution:**
```bash
# Check logs for errors
pm2 logs task-monitor-bot --lines 100

# Common issues:
# - MongoDB connection failed
# - WhatsApp session expired
# - Port already in use
```

### Issue: WhatsApp QR code not showing
**Solution:**
```bash
# Check logs (QR code will be ASCII art)
pm2 logs task-monitor-bot --lines 200

# Or check auth_info directory
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
ls -la auth_info/
```

### Issue: Auto-deploy fails
**Solution:**
1. Check GitHub Actions logs
2. Verify GitHub Secrets configured
3. Check SSH connection
4. Verify NVM loaded in workflow

---

## 📞 Need Help?

### Documentation:
- `DEPLOYMENT_SUCCESS.md` - Current deployment status
- `QUICK_SETUP_COMMANDS.md` - Quick reference
- `HOSTINGER_MANUAL_SETUP.md` - Detailed guide
- `BACKEND_SETUP_COMPLETE.md` - Complete documentation

### Common Commands:
```bash
# SSH to Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Check PM2 status
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Monitor bot
pm2 monit
```

---

## 🎊 After All Steps Complete

**Congratulations!** 🎉

Your bot is now:
- ✅ Running 24/7 on Hostinger
- ✅ Auto-deploying on code push
- ✅ Monitored via PM2
- ✅ Controlled via dashboard
- ✅ Production-ready

**You can now:**
- Edit code locally
- Push to GitHub
- Auto-deploy to production
- Monitor via dashboard
- Control bot via dashboard
- No manual intervention needed!

---

**Enjoy your automated task monitoring bot!** 🤖✨
