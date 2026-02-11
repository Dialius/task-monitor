# Deploy to Hostinger via SCP
# This script uploads the backend code to Hostinger

Write-Host "🚀 Deploying to Hostinger..." -ForegroundColor Cyan

# Step 1: Build the project
Write-Host "`n📦 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Create deployment package
Write-Host "`n📁 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy-package") {
    Remove-Item -Recurse -Force "deploy-package"
}
New-Item -ItemType Directory -Path "deploy-package" | Out-Null

# Copy necessary files
Copy-Item -Recurse "dist" "deploy-package/"
Copy-Item -Recurse "src" "deploy-package/"
Copy-Item "package.json" "deploy-package/"
Copy-Item "package-lock.json" "deploy-package/"
Copy-Item "tsconfig.json" "deploy-package/"
Copy-Item ".env.example" "deploy-package/"

# Copy .env if exists
if (Test-Path ".env") {
    Copy-Item ".env" "deploy-package/"
    Write-Host "   ✓ Copied .env file" -ForegroundColor Green
}

Write-Host "   ✓ Deployment package created" -ForegroundColor Green

# Step 3: Upload via SCP
Write-Host "`n📤 Uploading to Hostinger..." -ForegroundColor Yellow
Write-Host "   This will prompt for your SSH password" -ForegroundColor Gray

scp -P 65002 -r deploy-package u909490256@153.92.9.187:/home/u909490256/task-monitor-deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "`n💡 Alternative: Use Hostinger File Manager" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://hpanel.hostinger.com/" -ForegroundColor Gray
    Write-Host "   2. Files → File Manager" -ForegroundColor Gray
    Write-Host "   3. Upload files from: deploy-package/" -ForegroundColor Gray
    exit 1
}

Write-Host "   ✓ Files uploaded successfully" -ForegroundColor Green

# Step 4: Deploy on server
Write-Host "`n🔧 Deploying on server..." -ForegroundColor Yellow
Write-Host "   This will prompt for your SSH password again" -ForegroundColor Gray

$deployScript = @'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20

echo "Deploying API..."
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Copy files
cp -r /home/u909490256/task-monitor-deploy/* .

# Install dependencies
npm install

# Create directories
mkdir -p auth_info logs
chmod 755 auth_info logs

# Start with PM2
pm2 start dist/index.js --name task-monitor-bot
pm2 save

echo "✅ Deployment complete!"
pm2 status
'@

ssh -p 65002 u909490256@153.92.9.187 $deployScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Verify
Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n📊 Verification:" -ForegroundColor Cyan
Write-Host "   1. Check API: https://rosybrown-horse-106773.hostingersite.com/api/health" -ForegroundColor Gray
Write-Host "   2. Check Dashboard: https://rosybrown-horse-106773.hostingersite.com/login" -ForegroundColor Gray
Write-Host "   3. Login with: admin / admin123" -ForegroundColor Gray

# Cleanup
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "deploy-package"
Write-Host "   ✓ Cleanup complete" -ForegroundColor Green

Write-Host "`n🎉 All done!" -ForegroundColor Green
