# 🎯 GitHub Actions Manual Trigger Guide

## 📋 Overview

GitHub Actions workflows dapat di-trigger secara manual menggunakan `workflow_dispatch`. Ini berguna ketika:
- Paths filter tidak match dengan perubahan file
- Ingin deploy tanpa push code baru
- Testing workflow
- Emergency deployment

---

## 🚀 Cara Manual Trigger Workflow

### Method 1: Via GitHub Web UI (Recommended) 🖱️

**Step 1: Buka Actions Page**
1. Go to: https://github.com/Dialius/task-monitor/actions
2. Klik tab **"Actions"**

**Step 2: Pilih Workflow**
- Klik **"Deploy Backend to Hostinger"** (untuk backend)
- Atau klik **"Deploy Frontend to Hostinger"** (untuk frontend)
- Atau klik **"Test Build (No Deploy)"** (untuk test tanpa deploy)

**Step 3: Run Workflow**
1. Klik tombol **"Run workflow"** (dropdown di kanan atas)
2. Pilih branch: **main**
3. (Optional) Masukkan reason: "Manual deployment for testing"
4. Klik **"Run workflow"** (tombol hijau)

**Step 4: Monitor Progress**
1. Workflow akan muncul di list dengan status "In progress" 🟡
2. Klik workflow untuk melihat detail logs
3. Tunggu sampai selesai (✅ Success atau ❌ Failed)

---

### Method 2: Via GitHub CLI 💻

**Prerequisites:**
```bash
# Install GitHub CLI
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: See https://cli.github.com/

# Login
gh auth login
```

**Trigger Backend Deployment:**
```bash
gh workflow run "Deploy Backend to Hostinger" \
  --repo Dialius/task-monitor \
  --ref main \
  --field reason="Manual deployment"
```

**Trigger Frontend Deployment:**
```bash
gh workflow run "Deploy Frontend to Hostinger" \
  --repo Dialius/task-monitor \
  --ref main \
  --field reason="Manual deployment"
```

**Trigger Test Build:**
```bash
gh workflow run "Test Build (No Deploy)" \
  --repo Dialius/task-monitor \
  --ref main
```

**Check Workflow Status:**
```bash
# List recent workflow runs
gh run list --repo Dialius/task-monitor

# Watch specific workflow
gh run watch --repo Dialius/task-monitor
```

---

### Method 3: Via GitHub API 🔧

**Using curl:**
```bash
# Get your GitHub Personal Access Token first
# https://github.com/settings/tokens

# Trigger backend deployment
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/Dialius/task-monitor/actions/workflows/deploy-backend.yml/dispatches \
  -d '{"ref":"main","inputs":{"reason":"Manual deployment via API"}}'
```

---

## 🔍 Understanding Paths Filter

### Current Configuration:

**Backend Workflow** (`deploy-backend.yml`):
```yaml
paths:
  - 'src/**'              # Any file in src/ directory
  - 'package.json'        # Root package.json
  - 'package-lock.json'   # Root package-lock.json
  - 'tsconfig.json'       # TypeScript config
  - 'scripts/**'          # Any file in scripts/ directory
  - '.github/workflows/deploy-backend.yml'  # Workflow file itself
```

**Frontend Workflow** (`deploy-frontend.yml`):
```yaml
paths:
  - 'frontend/**'         # Any file in frontend/ directory
  - '.github/workflows/deploy-frontend.yml'  # Workflow file itself
```

### When Workflow is Triggered:

✅ **Will Trigger:**
- Edit `src/bot.ts` → Backend workflow runs
- Edit `frontend/src/App.tsx` → Frontend workflow runs
- Edit `package.json` → Backend workflow runs
- Edit `scripts/test-notion.js` → Backend workflow runs

❌ **Will NOT Trigger:**
- Edit `README.md` → No workflow runs (documentation only)
- Edit `DEPLOYMENT_GUIDE.md` → No workflow runs (documentation only)
- Edit `.env.example` → No workflow runs (not in paths filter)

### Solution for Documentation Changes:

**Option 1: Manual Trigger** (Recommended)
- Use workflow_dispatch to manually trigger deployment

**Option 2: Remove Paths Filter**
- Workflow runs on every push (may waste CI minutes)

**Option 3: Add Documentation to Paths**
- Add `'*.md'` to paths filter (not recommended for deploy workflows)

---

## 📊 Workflow Status

### Check Workflow Status:

**Via Web:**
1. Go to: https://github.com/Dialius/task-monitor/actions
2. See list of recent workflow runs
3. Green ✅ = Success
4. Red ❌ = Failed
5. Yellow 🟡 = In Progress

**Via CLI:**
```bash
gh run list --repo Dialius/task-monitor --limit 10
```

### View Workflow Logs:

**Via Web:**
1. Click on workflow run
2. Click on job name (e.g., "deploy")
3. Expand steps to see logs

**Via CLI:**
```bash
# Get run ID
gh run list --repo Dialius/task-monitor

# View logs
gh run view RUN_ID --repo Dialius/task-monitor --log
```

---

## 🎯 Common Scenarios

### Scenario 1: Documentation Update (No Code Change)

**Problem:** Pushed documentation changes, but workflow didn't run

**Solution:**
```bash
# Option A: Manual trigger via web
# Go to Actions → Deploy Backend → Run workflow

# Option B: Manual trigger via CLI
gh workflow run "Deploy Backend to Hostinger" --repo Dialius/task-monitor --ref main
```

---

### Scenario 2: Emergency Deployment

**Problem:** Need to deploy immediately without pushing new code

**Solution:**
```bash
# Trigger deployment manually
gh workflow run "Deploy Backend to Hostinger" \
  --repo Dialius/task-monitor \
  --ref main \
  --field reason="Emergency deployment - hotfix"
```

---

### Scenario 3: Test Workflow Without Deploying

**Problem:** Want to test if build works without actually deploying

**Solution:**
```bash
# Use test-build workflow
gh workflow run "Test Build (No Deploy)" --repo Dialius/task-monitor --ref main
```

---

### Scenario 4: Deploy Specific Branch

**Problem:** Want to deploy from feature branch

**Solution:**
```bash
# Trigger workflow on specific branch
gh workflow run "Deploy Backend to Hostinger" \
  --repo Dialius/task-monitor \
  --ref feature-branch-name \
  --field reason="Deploy feature branch for testing"
```

---

## 🔧 Troubleshooting

### Issue 1: "Run workflow" button not visible

**Cause:** workflow_dispatch not configured

**Solution:** Already fixed in updated workflows ✅

---

### Issue 2: Workflow triggered but failed

**Cause:** Various (SSH connection, build error, etc.)

**Solution:**
1. Check workflow logs
2. Identify error
3. Fix issue
4. Re-trigger workflow

---

### Issue 3: Workflow not in list

**Cause:** Workflow file has syntax error

**Solution:**
1. Check workflow YAML syntax
2. Use YAML validator: https://www.yamllint.com/
3. Fix syntax errors
4. Push fix

---

## 📝 Best Practices

### 1. Use Descriptive Reasons
```bash
# Good
--field reason="Deploy hotfix for login bug"

# Bad
--field reason="deploy"
```

### 2. Test Before Deploy
```bash
# Run test build first
gh workflow run "Test Build (No Deploy)" --repo Dialius/task-monitor --ref main

# If success, then deploy
gh workflow run "Deploy Backend to Hostinger" --repo Dialius/task-monitor --ref main
```

### 3. Monitor Workflow Progress
```bash
# Watch workflow in real-time
gh run watch --repo Dialius/task-monitor
```

### 4. Check Logs After Deployment
```bash
# View logs
gh run view --repo Dialius/task-monitor --log

# Or SSH to server
ssh -p 65002 u909490256@153.92.9.187 "pm2 logs task-monitor-bot --lines 50"
```

---

## 🎉 Summary

**3 Ways to Trigger Workflow:**
1. ✅ **Auto-trigger** - Push code that matches paths filter
2. ✅ **Manual trigger (Web)** - Click "Run workflow" button
3. ✅ **Manual trigger (CLI)** - Use `gh workflow run` command

**When to Use Manual Trigger:**
- Documentation-only changes
- Emergency deployment
- Testing workflow
- Deploy specific branch

**Workflows Available:**
1. **Deploy Backend to Hostinger** - Deploy backend code
2. **Deploy Frontend to Hostinger** - Deploy frontend code
3. **Test Build (No Deploy)** - Test build without deploying

---

## 📞 Quick Reference

### Manual Trigger (Web):
```
1. Go to: https://github.com/Dialius/task-monitor/actions
2. Click workflow name
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow" button
```

### Manual Trigger (CLI):
```bash
gh workflow run "Deploy Backend to Hostinger" --repo Dialius/task-monitor --ref main
```

### Check Status:
```bash
gh run list --repo Dialius/task-monitor
```

### View Logs:
```bash
gh run view --repo Dialius/task-monitor --log
```

---

**Now you can trigger workflows manually anytime!** 🚀
