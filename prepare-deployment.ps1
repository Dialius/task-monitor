# Skrip Persiapan Deployment Hostinger (Fixed for Linux Compatibility)
$deployDir = "deploy-package"
$apiDir = "$deployDir/api"
$publicDir = "$deployDir/public_html"

# 1. Bersihkan folder deploy sebelumnya
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir
New-Item -ItemType Directory -Path $apiDir
New-Item -ItemType Directory -Path $publicDir

# 2. Setup folder API (Backend)
Write-Host "Copying Backend files..."
Copy-Item "dist" -Destination "$apiDir/dist" -Recurse
Copy-Item "package.json" -Destination "$apiDir/package.json"
Copy-Item "package-lock.json" -Destination "$apiDir/package-lock.json"
Copy-Item "ecosystem.config.js" -Destination "$apiDir/ecosystem.config.js"
Copy-Item ".env" -Destination "$apiDir/.env"
if (Test-Path "$apiDir/dist/node_modules") { Remove-Item "$apiDir/dist/node_modules" -Recurse -Force }

# 3. Setup folder public_html (Frontend)
Write-Host "Copying Frontend files..."
Copy-Item "frontend/dist/*" -Destination "$publicDir" -Recurse

# 4. Amankan .htaccess
Write-Host "Overwriting .htaccess with Reverse Proxy rules..."
Copy-Item ".htaccess" -Destination "$publicDir/.htaccess" -Force

# 5. Zip menggunakan TAR (PENTING: Agar path separator '/' terbaca di Linux)
Write-Host "Zipping package using TAR..."
$zipFile = "HOSTINGER_DEPLOY.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }

# Pindah ke directory deploy-package agar struktur zipnya langsung isi folder
cd $deployDir
tar -a -c -f "../$zipFile" *
cd ..

Write-Host "✅ Deployment package (Repo Revision) ready: $zipFile"
Write-Host "Gunakan file zip baru ini untuk upload."
