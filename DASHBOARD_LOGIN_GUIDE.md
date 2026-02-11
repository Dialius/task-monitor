# 🔐 Dashboard Login Guide

## 📋 Login Options

Dashboard mendukung 2 cara login:

### Option 1: Default Admin (Quick) ⚡
**Username:** `admin`
**Password:** `admin123`

### Option 2: WhatsApp Number (Custom) 📱
**Username:** `628994630519` (WhatsApp number dari .env)
**Password:** `admin123` (default, bisa diganti)

---

## 🚀 Quick Start

### 1. Login dengan Default Admin

1. Open: https://rosybrown-horse-106773.hostingersite.com/login
2. Enter:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click **"Login"**
4. ✅ Success! Redirect to dashboard

### 2. Change Password (RECOMMENDED)

Setelah login:
1. Navigate to **"Settings"** atau **"Profile"**
2. Click **"Change Password"**
3. Enter:
   - **Old Password:** `admin123`
   - **New Password:** (your secure password)
4. Click **"Save"**

---

## 🔧 Create WhatsApp Number User

Jika ingin login dengan WhatsApp number, jalankan script ini di server:

### Via SSH Hostinger:

```bash
# SSH ke Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Navigate to api directory
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Run script to create user
node scripts/create-dashboard-user.js
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

✅ Dashboard Admin User Created!
   Username: 628994630519
   Password: admin123
   Role: admin

⚠️  IMPORTANT: Change password after first login!

✅ Default admin user also created (username: admin, password: admin123)

✅ Done!
```

### Then Login:

1. Open: https://rosybrown-horse-106773.hostingersite.com/login
2. Enter:
   - **Username:** `628994630519`
   - **Password:** `admin123`
3. Click **"Login"**
4. ✅ Success!

---

## 🔍 Troubleshooting

### Issue 1: "Invalid credentials"

**Possible causes:**
1. User belum dibuat
2. Password salah
3. MongoDB tidak connected

**Solution:**
```bash
# Check if MongoDB connected
pm2 logs task-monitor-bot --lines 50 | grep -i mongodb

# Create user manually
node scripts/create-dashboard-user.js

# Check if user exists (via MongoDB)
# Or check logs for user creation message
```

---

### Issue 2: Dashboard tidak bisa diakses

**Solution:**
```bash
# Check API server status
pm2 status

# Check API logs
pm2 logs task-monitor-bot --lines 50

# Restart API server
pm2 restart task-monitor-bot

# Test API health
curl http://localhost:3001/api/health
```

---

### Issue 3: User sudah ada tapi lupa password

**Solution 1: Reset via Script**

Edit `scripts/create-dashboard-user.js` untuk delete dan recreate user:

```javascript
// Add before creating user:
await User.deleteOne({ username: whatsappNumber });
```

**Solution 2: Reset via MongoDB**

```bash
# Connect to MongoDB (if you have access)
# Delete user and recreate
```

**Solution 3: Use Default Admin**

Login dengan `admin/admin123` dan manage users dari dashboard.

---

## 🔐 Security Best Practices

### 1. Change Default Password

**IMMEDIATELY** after first login, change password:
- Old: `admin123`
- New: Strong password (min 8 chars, mix of letters, numbers, symbols)

### 2. Use Strong Passwords

**Good password examples:**
- `MySecure@Pass2024`
- `TaskBot#2024!Secure`
- `Admin$WhatsApp99`

**Bad password examples:**
- `admin` (too simple)
- `123456` (too simple)
- `password` (too common)

### 3. Don't Share Credentials

- Keep username/password private
- Don't commit credentials to Git
- Use environment variables for sensitive data

### 4. Regular Password Changes

Change password every 3-6 months for security.

---

## 📊 User Management

### Check Existing Users

Via MongoDB or API endpoint (if implemented):

```bash
# Via script (create a list-users.js script)
node scripts/list-users.js
```

### Create Additional Users

Modify `scripts/create-dashboard-user.js` to create more users:

```javascript
// Create multiple users
const users = [
  { username: '628994630519', password: 'admin123', role: 'admin' },
  { username: '628123456789', password: 'user123', role: 'user' },
];

for (const userData of users) {
  await User.create(userData);
}
```

### Delete Users

Via MongoDB or create delete script:

```javascript
await User.deleteOne({ username: '628994630519' });
```

---

## 🎯 Login Flow

### Successful Login:

```
1. User enters username/password
2. Frontend sends POST /api/auth/login
3. Backend validates credentials
4. Backend generates JWT token
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard
7. ✅ User logged in
```

### Failed Login:

```
1. User enters wrong credentials
2. Frontend sends POST /api/auth/login
3. Backend returns 401 Unauthorized
4. Frontend shows error message
5. ❌ Login failed
```

---

## 🔗 API Endpoints

### Login
```
POST /api/auth/login
Body: { username, password }
Response: { token, refreshToken, user }
```

### Logout
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### Change Password
```
POST /api/auth/change-password
Headers: { Authorization: Bearer <token> }
Body: { oldPassword, newPassword }
Response: { success: true }
```

### Get Current User
```
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

---

## 📝 Environment Variables

### Dashboard User Configuration

Add to `.env`:

```env
# Dashboard default admin credentials
DASHBOARD_DEFAULT_USERNAME=admin
DASHBOARD_DEFAULT_PASSWORD=admin123

# Or use WhatsApp number from existing config
FIRST_ADMIN_WHATSAPP_ID=628994630519
```

---

## 🎉 Quick Summary

### For Quick Access:
1. Login: `admin` / `admin123`
2. Change password immediately
3. Done! ✅

### For WhatsApp Number Login:
1. SSH to server
2. Run: `node scripts/create-dashboard-user.js`
3. Login: `628994630519` / `admin123`
4. Change password
5. Done! ✅

---

## 📞 Need Help?

### Common Issues:
- **Can't login:** Check MongoDB connection and user creation
- **Forgot password:** Use default admin or reset via script
- **Dashboard not loading:** Check API server status

### Useful Commands:
```bash
# Check API status
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart API
pm2 restart task-monitor-bot

# Create user
node scripts/create-dashboard-user.js
```

---

**Dashboard URL:** https://rosybrown-horse-106773.hostingersite.com
**Default Login:** `admin` / `admin123`
**WhatsApp Login:** `628994630519` / `admin123` (after running script)

**⚠️ IMPORTANT: Change password after first login!**
