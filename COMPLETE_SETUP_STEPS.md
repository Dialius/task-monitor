# 🎯 Complete Setup Steps - Final Deployment

## Current Status

✅ Backend deployed and running on port 3001  
✅ Frontend deployed  
❌ API routing not working (needs subdomain)

## What We Need To Do

Create subdomain `api.rosybrown-horse-106773.hostingersite.com` to fix API routing.

---

## 📋 Step-by-Step Instructions

### STEP 1: Create Subdomain in hPanel (5 minutes)

**You need to do this manually in hPanel:**

1. **Open hPanel:**
   - Go to: https://hpanel.hostinger.com/
   - Login with your Hostinger credentials

2. **Navigate to Subdomains:**
   - Click "Domains" in left sidebar
   - Click "Subdomains"

3. **Create Subdomain:**
   - Click "Create Subdomain" button
   - Fill in:
     - **Subdomain:** `api`
     - **Domain:** `rosybrown-horse-106773.hostingersite.com`
     - **Document Root:** `/public_html/api`
   - Click "Create"

4. **Wait for Confirmation:**
   - You should see success message
   - Subdomain will be: `api.rosybrown-horse-106773.hostingersite.com`

**Screenshot locations in hPanel:**
```
Home → Domains → Subdomains → Create Subdomain
```

---

### STEP 2: Configure Backend (2 minutes)

**Run these commands on your local machine:**

```bash
# Upload setup script
scp -P 65002 setup-subdomain.sh u909490256@153.92.9.187:~/

# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Run setup script
bash ~/setup-subdomain.sh
```

**What this does:**
- Updates backend `.env` with subdomain URL
- Creates `.htaccess` for API subdomain
- Restarts PM2 process

---

### STEP 3: Rebuild Frontend (3 minutes)

**Run on your local machine:**

```bash
# Navigate to frontend
cd D:\task-monitor\frontend

# Verify .env has subdomain URL
cat .env
# Should show:
# VITE_API_URL=https://api.rosybrown-horse-106773.hostingersite.com
# VITE_WS_URL=wss://api.rosybrown-horse-106773.hostingersite.com

# Rebuild frontend
npm run build
```

---

### STEP 4: Deploy Frontend (2 minutes)

**Option A: Using SCP (Recommended)**

```bash
# Upload frontend files
scp -P 65002 -r frontend/dist/* u909490256@153.92.9.187:~/frontend-upload/

# SSH and move files
ssh -p 65002 u909490256@153.92.9.187
cp -r ~/frontend-upload/* ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

**Option B: Using Hostinger File Manager**

1. Go to hPanel → Files → File Manager
2. Navigate to `/domains/rosybrown-horse-106773.hostingersite.com/public_html/`
3. Delete old files: `index.html`, `assets/` folder
4. Upload new files from `D:\task-monitor\frontend\dist\`
5. Make sure `.htaccess` is preserved (don't delete it)

---

### STEP 5: Wait for DNS Propagation (5-15 minutes)

DNS needs time to propagate. While waiting, you can:

**Check DNS status:**
```bash
# Windows
nslookup api.rosybrown-horse-106773.hostingersite.com

# Should eventually show an IP address
```

**Check PM2 status:**
```bash
ssh -p 65002 u909490256@153.92.9.187 "pm2 status"
```

---

### STEP 6: Verify Everything Works (5 minutes)

**Test 1: API Health Check**

```bash
curl https://api.rosybrown-horse-106773.hostingersite.com/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-02-11T..."}
```

**Test 2: Dashboard Login**

1. Open: https://rosybrown-horse-106773.hostingersite.com/login
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Should successfully login and see dashboard

**Test 3: Check Browser Console**

1. Open dashboard
2. Press F12 → Console tab
3. Should see:
   - ✅ WebSocket connected
   - ✅ No CORS errors
   - ✅ API requests to `api.rosybrown-horse-106773.hostingersite.com`

---

### STEP 7: Start Bot (2 minutes)

1. **In Dashboard:**
   - Click "Start Bot" button
   - Wait for status to change to "Running"

2. **Scan QR Code:**
   - QR code will appear in dashboard
   - Open WhatsApp on your phone
   - Go to: Settings → Linked Devices → Link a Device
   - Scan the QR code

3. **Verify Connection:**
   - Dashboard should show "Connected"
   - Bot status: 🟢 Running

---

### STEP 8: Test Bot Commands (3 minutes)

Send these commands to your WhatsApp group:

```
/status
/help
/list_tugas
```

**Expected responses:**
- `/status` → Bot status and info
- `/help` → List of available commands
- `/list_tugas` → List of tasks from Notion

---

## 🎉 Success Checklist

After completing all steps, verify:

- [ ] Subdomain created in hPanel
- [ ] Backend configured and running
- [ ] Frontend rebuilt with subdomain URL
- [ ] Frontend deployed to Hostinger
- [ ] DNS propagated (can access subdomain)
- [ ] API health check returns JSON
- [ ] Dashboard login works
- [ ] No CORS errors in browser console
- [ ] Bot starts from dashboard
- [ ] WhatsApp QR code appears
- [ ] WhatsApp connected
- [ ] Bot responds to commands

---

## 🚨 Troubleshooting

### Issue: DNS Not Propagating

**Symptoms:** `nslookup` returns "can't find"

**Solution:**
1. Wait longer (can take up to 24 hours)
2. Clear DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   ```
3. Try different DNS server:
   ```bash
   nslookup api.rosybrown-horse-106773.hostingersite.com 8.8.8.8
   ```

### Issue: 502 Bad Gateway

**Symptoms:** API returns 502 error

**Solution:**
```bash
# Check if PM2 is running
ssh -p 65002 u909490256@153.92.9.187 "pm2 status"

# Check logs
ssh -p 65002 u909490256@153.92.9.187 "pm2 logs task-monitor-bot --lines 50"

# Restart if needed
ssh -p 65002 u909490256@153.92.9.187 "pm2 restart task-monitor-bot"
```

### Issue: CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solution:**
```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Check .env
cat ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/.env | grep CORS

# Should show both URLs:
# CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com,https://api.rosybrown-horse-106773.hostingersite.com

# If not, run setup script again
bash ~/setup-subdomain.sh
```

### Issue: Dashboard Shows Blank Page

**Symptoms:** White screen, no content

**Solution:**
1. Check browser console for errors
2. Verify frontend files uploaded correctly
3. Check `.htaccess` exists in `/public_html/`
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Bot Won't Start

**Symptoms:** "Start Bot" button doesn't work

**Solution:**
```bash
# Check API logs
ssh -p 65002 u909490256@153.92.9.187 "pm2 logs task-monitor-bot --lines 100"

# Check MongoDB connection
ssh -p 65002 u909490256@153.92.9.187 "grep MONGODB_URI ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/.env"

# Restart PM2
ssh -p 65002 u909490256@153.92.9.187 "pm2 restart task-monitor-bot"
```

---

## 📞 Need Help?

If you get stuck on any step, let me know and I can:
1. Guide you through hPanel interface
2. Debug specific errors
3. Provide alternative solutions
4. Help with SSH commands

---

## 📊 Quick Reference

**URLs:**
- Frontend: https://rosybrown-horse-106773.hostingersite.com
- API: https://api.rosybrown-horse-106773.hostingersite.com
- hPanel: https://hpanel.hostinger.com

**SSH:**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

**PM2 Commands:**
```bash
pm2 status                    # Check status
pm2 logs task-monitor-bot     # View logs
pm2 restart task-monitor-bot  # Restart bot
pm2 stop task-monitor-bot     # Stop bot
```

**File Locations:**
- Backend: `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/`
- Frontend: `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/`
- Logs: `~/.pm2/logs/`

---

## 🎯 Summary

**Total Time:** ~30 minutes (including DNS wait)

**What You'll Do:**
1. Create subdomain in hPanel (manual)
2. Run setup script on server (automated)
3. Rebuild and deploy frontend (automated)
4. Wait for DNS (automatic)
5. Test and verify (manual)
6. Start bot and connect WhatsApp (manual)

**Result:**
- ✅ Fully functional dashboard
- ✅ API accessible via subdomain
- ✅ Bot running and connected to WhatsApp
- ✅ All commands working

Let's do this! 🚀
