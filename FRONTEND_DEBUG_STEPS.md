# Frontend Debug Steps

## Current Status
- Backend API: ✅ Running on http://localhost:3001
- Frontend Dev: ✅ Running on http://localhost:5173
- Build: ✅ Successful
- App.tsx: 🔧 Simplified for testing

## Issue: White Screen

### Possible Causes
1. JavaScript error preventing React from rendering
2. CSS not loading properly
3. Tailwind CSS not compiling
4. Import errors in components
5. Browser console errors

## Debug Steps

### Step 1: Check Simple React App
**Current State**: App.tsx simplified to basic HTML
**Expected**: Should see green text "Task Monitor Bot" on dark background

**If you see the text**: React is working! Problem is in components/routing
**If still white**: Problem is with React/Vite setup

### Step 2: Open Browser Console
Press `F12` or `Ctrl+Shift+I` to open DevTools

**Check for errors**:
- Red error messages in Console tab
- Failed network requests in Network tab
- Look for 404 errors or CORS errors

### Step 3: Common Errors & Solutions

#### Error: "Cannot find module"
**Solution**: Missing dependency
```bash
cd frontend
npm install
```

#### Error: "Unexpected token"
**Solution**: Syntax error in code
- Check the error message for file and line number
- Fix the syntax error

#### Error: "Failed to fetch"
**Solution**: API not running or CORS issue
- Check backend is running: http://localhost:3001/health
- Check CORS_ORIGINS in .env includes http://localhost:5173

#### Error: Tailwind classes not working
**Solution**: Tailwind not compiling
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Step 4: Restore Full App
Once simple app works, restore the full version:

```bash
# Copy backup back
cp src/App-backup.tsx src/App.tsx
```

Or manually restore from backup file.

### Step 5: Test Each Component
If full app fails, test components one by one:

1. Test LoginPage only
2. Test HomePage only
3. Test with routing
4. Test with stores

## Quick Fixes

### Fix 1: Clear Cache
```bash
cd frontend
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Fix 2: Reinstall Dependencies
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Fix 3: Check Environment Variables
```bash
# frontend/.env should have:
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### Fix 4: Verify Backend API
```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

## Current App.tsx (Simplified)
```tsx
function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e1e1e', 
      color: '#00ff00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '48px' }}>🤖</h1>
      <h2 style={{ fontSize: '32px' }}>Task Monitor Bot</h2>
      <p style={{ color: '#cccccc' }}>Dashboard Loading...</p>
      <p style={{ color: '#858585', fontSize: '14px' }}>
        If you see this, React is working!
      </p>
    </div>
  );
}
```

## Next Steps

1. **Open browser**: http://localhost:5173
2. **Check what you see**:
   - ✅ Green text on dark background → React works, restore full app
   - ❌ White screen → Open console (F12), check for errors
   - ❌ Error page → Read error message, apply fixes above

3. **Report back**: Tell me what you see or any error messages

## Backup Files
- `frontend/src/App-backup.tsx` - Full app with routing and auth
- Original components are intact in:
  - `frontend/src/pages/LoginPage.tsx`
  - `frontend/src/pages/HomePage.tsx`
  - `frontend/src/components/ControlPanel.tsx`
  - `frontend/src/stores/authStore.ts`
  - `frontend/src/stores/botStore.ts`

## Restore Command
Once simple app works:
```bash
cd frontend/src
cp App-backup.tsx App.tsx
```

Then refresh browser.
