#!/bin/bash
# ============================================
# FRONTEND DEPLOYMENT SCRIPT
# ============================================
# Run this script on LOCAL MACHINE to build and deploy frontend

set -e  # Exit on error

echo "🚀 Starting Frontend Deployment..."
echo ""

# ============================================
# STEP 1: Navigate to Frontend Directory
# ============================================
echo "📂 Navigating to frontend directory..."
cd frontend
echo "✅ Current directory: $(pwd)"
echo ""

# ============================================
# STEP 2: Install Dependencies
# ============================================
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# ============================================
# STEP 3: Build Frontend
# ============================================
echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# ============================================
# STEP 4: Show Build Output
# ============================================
echo "📊 Build Output:"
ls -lh dist/
echo ""

# ============================================
# STEP 5: Upload Instructions
# ============================================
echo "📤 ============================================"
echo "📤 UPLOAD INSTRUCTIONS"
echo "📤 ============================================"
echo ""
echo "Option 1: Upload via SCP (Recommended)"
echo "  scp -P 65002 -r dist/* u909490256@153.92.9.187:/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/"
echo ""
echo "Option 2: Upload via Hostinger File Manager"
echo "  1. Login to Hostinger hPanel"
echo "  2. Go to File Manager"
echo "  3. Navigate to: /domains/rosybrown-horse-106773.hostingersite.com/public_html/"
echo "  4. Upload all files from frontend/dist/"
echo ""
echo "Option 3: Upload via FTP"
echo "  Host: 153.92.9.187"
echo "  Port: 21"
echo "  Username: u909490256"
echo "  Password: [your password]"
echo "  Remote path: /domains/rosybrown-horse-106773.hostingersite.com/public_html/"
echo ""

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo "✅ ============================================"
echo "✅ FRONTEND BUILD COMPLETE!"
echo "✅ ============================================"
echo ""
echo "🌐 Dashboard: https://rosybrown-horse-106773.hostingersite.com"
echo ""
echo "📝 Next steps:"
echo "  1. Upload dist/ files to Hostinger (see options above)"
echo "  2. Verify dashboard is accessible"
echo "  3. Test login"
echo ""
