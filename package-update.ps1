# Script untuk membungkus update Frontend
$zipFile = "public_html_UPDATE.zip"

# Hapus zip lama jika ada
if (Test-Path $zipFile) { Remove-Item $zipFile }

# Masuk ke folder hasil build
cd frontend/dist

# Zip isinya menggunakan tar (agar aman di server Linux)
tar -a -c -f "../../$zipFile" *

Write-Host "✅ File update siap: $zipFile"
