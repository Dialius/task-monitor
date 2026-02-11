# 🔧 GitHub Actions Troubleshooting Guide

## 🎯 Masalah: GitHub Actions Tidak Trigger

### Gejala:
- Commit sudah push ke GitHub
- Workflow tidak muncul di Actions tab
- Tidak ada workflow run yang baru

---

## ✅ Solusi 1: Cek Workflow Files

### Pastikan workflow files ada di path yang benar:
```
.github/workflows/deploy-backend.yml
.github/workflows/deploy-frontend.yml
.github/workflows/test-build.yml
```

### Verify:
```bash
ls -la .github/workflows/
```

**Expected output:**
```
deploy-backend.yml
deploy-frontend.yml
test-build.yml
```

---

## ✅ Solusi 2: Cek Branch Name

### Workflow trigger pada branch:
- `main` ✅
- `master` ✅

### Cek branch saat ini:
```bash
git branch
```

**Expected output:**
```
* main
```

### Jika branch salah, switch ke main:
```bash
git checkout main
```

---

## ✅ Solusi 3: Cek GitHub Actions Enabled

### Steps:
1. Buka: https://github.com/Dialius/task-monitor/settings/actions
2. Pastikan "Actions permissions" = **Allow all actions and reusable workflows**
3. Pastikan "Workflow permissions" = **Read and write permissions**

### Atau via command line:
```bash
# Check if Actions is enabled
gh api repos/Dialius/task-monitor/actions/permissions
```

---

## ✅ Solusi 4: Manual Trigger Workflow

### Via GitHub UI:
1. Buka: https://github.com/Dialius/task-monitor/actions
2. Pilih workflow (contoh: "Test Build")
3. Klik "Run workflow"
4. Pilih branch: `main`
5. Klik "Run workflow"

### Via GitHub CLI:
```bash
# Install GitHub CLI (if not installed)
# Windows: winget install GitHub.cli

# Login
gh auth login

# Trigger workflow manually
gh workflow run "Test Build (No Deploy)" --ref main
gh workflow run "Deploy Backend to Hostinger" --ref main
gh workflow run "Deploy Frontend to Hostinger" --ref main
```

---

## ✅ Solusi 5: Force Trigger dengan Empty Commit

### Create empty commit to trigger workflow:
```bash
# Empty commit
git commit --allow-empty -m "chore: Trigger GitHub Actions"

# Push
git push origin main
```

---

## ✅ Solusi 6: Cek Workflow Syntax

### Validate workflow syntax:
```bash
# Install actionlint (workflow linter)
# Windows: scoop install actionlint

# Lint workflows
actionlint .github/workflows/*.yml
```

### Atau online:
1. Copy workflow content
2. Paste ke: https://rhysd.github.io/actionlint/
3. Check for errors

---

## ✅ Solusi 7: Cek GitHub Secrets

### Required secrets:
- `SSH_HOST` = `153.92.9.187`
- `SSH_USERNAME` = `u909490256`
- `SSH_PASSWORD` = `[your-password]`
- `SSH_PORT` = `65002`
- `VITE_API_URL` = `https://rosybrown-horse-106773.hostingersite.com/api`
- `VITE_WS_URL` = `wss://rosybrown-horse-106773.hostingersite.com`

### Verify secrets exist:
1. Buka: https://github.com/Dialius/task-monitor/settings/secrets/actions
2. Pastikan semua secrets ada
3. Jika ada yang missing, tambahkan

---

## ✅ Solusi 8: Cek Workflow Paths

### Backend workflow triggers on:
```yaml
paths:
  - 'src/**'
  - 'package.json'
  - 'package-lock.json'
  - 'tsconfig.json'
  - 'scripts/**'
  - '.github/workflows/deploy-backend.yml'
```

### Frontend workflow triggers on:
```yaml
paths:
  - 'frontend/**'
  - '.github/workflows/deploy-frontend.yml'
```

### Test-build workflow triggers on:
```yaml
# Triggers on ANY push to main/master
```

**Note:** Jika commit tidak mengubah file di paths tersebut, workflow tidak akan trigger!

---

## ✅ Solusi 9: Trigger Test-Build Workflow

### Test-build workflow SELALU trigger pada push ke main/master

### Make a small change:
```bash
# Edit README or any file
echo "# Test" >> README.md

# Commit
git add README.md
git commit -m "test: Trigger GitHub Actions"

# Push
git push origin main
```

**Expected:** Test-build workflow akan trigger!

---

## ✅ Solusi 10: Cek GitHub Status

### Cek apakah GitHub Actions sedang down:
- https://www.githubstatus.com/

### Jika GitHub Actions down:
- Tunggu sampai service kembali normal
- Retry push setelah service normal

---

## 🎯 Quick Fix: Force Trigger All Workflows

### Method 1: Via GitHub UI (Recommended)

1. **Buka Actions tab:**
   https://github.com/Dialius/task-monitor/actions

2. **Trigger each workflow:**
   - Klik "Test Build (No Deploy)"
   - Klik "Run workflow" → Select branch: main → Run
   - Klik "Deploy Backend to Hostinger"
   - Klik "Run workflow" → Select branch: main → Run
   - Klik "Deploy Frontend to Hostinger"
   - Klik "Run workflow" → Select branch: main → Run

### Method 2: Via Empty Commit

```bash
# Create empty commit
git commit --allow-empty -m "chore: Force trigger GitHub Actions"

# Push
git push origin main
```

### Method 3: Via File Change

```bash
# Edit a file that triggers all workflows
echo "// Trigger workflows" >> src/bot.ts

# Commit
git add src/bot.ts
git commit -m "chore: Trigger workflows"

# Push
git push origin main
```

---

## 📊 Verify Workflows Triggered

### Check Actions tab:
1. Buka: https://github.com/Dialius/task-monitor/actions
2. Refresh page (F5)
3. Should see new workflow runs

### Expected output:
```
✅ Test Build (No Deploy) - Running/Completed
✅ Deploy Backend to Hostinger - Running/Completed (if src/** changed)
✅ Deploy Frontend to Hostinger - Running/Completed (if frontend/** changed)
```

---

## 🚨 Common Issues

### Issue 1: "No workflows found"

**Cause:** Workflow files tidak di-commit atau di path yang salah

**Solution:**
```bash
# Check if workflow files exist
ls -la .github/workflows/

# If not, they're not committed
git status

# Add and commit
git add .github/workflows/
git commit -m "fix: Add workflow files"
git push origin main
```

### Issue 2: "Workflow disabled"

**Cause:** Workflow di-disable di GitHub

**Solution:**
1. Buka: https://github.com/Dialius/task-monitor/actions
2. Klik workflow yang disabled
3. Klik "Enable workflow"

### Issue 3: "Actions not enabled"

**Cause:** GitHub Actions tidak enabled di repository

**Solution:**
1. Buka: https://github.com/Dialius/task-monitor/settings/actions
2. Enable "Allow all actions and reusable workflows"
3. Save

### Issue 4: "Workflow syntax error"

**Cause:** YAML syntax error di workflow file

**Solution:**
```bash
# Validate YAML syntax
# Use online validator: https://www.yamllint.com/

# Or install yamllint
pip install yamllint
yamllint .github/workflows/*.yml
```

---

## 🎯 Recommended Workflow

### Daily development:

1. **Develop locally**
   ```bash
   # Edit code
   # Test locally
   ```

2. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: New feature"
   git push origin main
   ```

3. **Check Actions tab**
   - Open: https://github.com/Dialius/task-monitor/actions
   - Verify workflows triggered
   - Wait for completion

4. **If workflows don't trigger:**
   - Use manual trigger via GitHub UI
   - Or use empty commit method

---

## 📞 Need Help?

### Quick commands:

```bash
# Check current branch
git branch

# Check remote
git remote -v

# Check last commits
git log --oneline -10

# Force trigger workflows
git commit --allow-empty -m "chore: Trigger workflows"
git push origin main
```

### URLs:
- **Actions:** https://github.com/Dialius/task-monitor/actions
- **Settings:** https://github.com/Dialius/task-monitor/settings/actions
- **Secrets:** https://github.com/Dialius/task-monitor/settings/secrets/actions

---

## ✅ Summary

**Most common solutions:**
1. ✅ Manual trigger via GitHub UI (easiest!)
2. ✅ Empty commit to force trigger
3. ✅ Check if Actions enabled in settings
4. ✅ Verify workflow files exist and committed

**Success rate:** 99% dengan salah satu solusi di atas!

---

**Good luck!** 🚀
