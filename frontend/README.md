# Task Monitor Dashboard

Dashboard web untuk monitoring dan kontrol bot Task Monitor. Dibangun dengan React 19, TypeScript, Vite, dan Tailwind CSS.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time updates
- **Zustand** - State management
- **React Router** - Routing
- **Recharts** - Charts & analytics
- **Axios** - HTTP client

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

Output akan ada di folder `dist/`

## 👀 Preview Build

```bash
npm run preview
```

Preview akan berjalan di `http://localhost:4173`

## 🌐 Deployment ke Hostinger

### Metode 1: GitHub Integration (Recommended)

1. Push code ke GitHub repository
2. Login ke Hostinger panel
3. Pilih "Website" → "Add Website"
4. Pilih "Connect to GitHub"
5. Pilih repository dan branch
6. Hostinger akan auto-detect Vite framework
7. Build settings akan otomatis:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
8. Klik "Deploy"

### Metode 2: Manual Upload

1. Build project:
   ```bash
   npm run build
   ```

2. Upload semua file dari folder `dist/` ke public_html di Hostinger

3. Pastikan file `.htaccess` ada di root untuk SPA routing

### Metode 3: Git Deploy

1. Login ke Hostinger SSH
2. Clone repository:
   ```bash
   cd domains/yourdomain.com/public_html
   git clone https://github.com/yourusername/yourrepo.git .
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build:
   ```bash
   npm run build
   ```

5. Copy dist ke public_html:
   ```bash
   cp -r dist/* ../
   ```

## 🔧 Environment Variables

Buat file `.env` di root folder frontend:

```env
# API Backend URL
VITE_API_URL=https://your-vps-ip:3001
VITE_WS_URL=https://your-vps-ip:3001

# Or use domain
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com
```

## 📁 Project Structure

```
frontend/
├── dist/                 # Build output
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── assets/          # Images, fonts, etc
│   ├── components/      # React components
│   │   ├── BotControls.tsx
│   │   ├── MetricsPanel.tsx
│   │   ├── Sidebar.tsx
│   │   └── Terminal.tsx
│   ├── hooks/           # Custom hooks
│   │   └── useWebSocket.ts
│   ├── pages/           # Page components
│   │   ├── Analytics.tsx
│   │   ├── Config.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Logs.tsx
│   │   └── Tasks.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── stores/          # Zustand stores
│   │   └── botStore.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── .htaccess           # Apache config for SPA
├── hostinger.json      # Hostinger config
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.cjs # Tailwind config
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite config
```

## 🎨 Features

- ✅ Real-time bot monitoring
- ✅ Bot control (Start/Stop/Restart)
- ✅ Live logs terminal
- ✅ Task management (CRUD)
- ✅ Analytics & charts
- ✅ Configuration editor
- ✅ WebSocket real-time updates
- ✅ Responsive design
- ✅ Dark theme (terminal style)
- ✅ Authentication

## 🔐 Default Credentials

- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Ganti password default setelah deployment!

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Build Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Hostinger tidak detect framework
- Pastikan file `package.json` ada di root
- Pastikan ada `vite.config.ts`
- Pastikan `"type": "module"` ada di package.json

### SPA routing tidak work (404 error)
- Pastikan file `.htaccess` ada di public_html
- Atau gunakan file `_redirects` untuk Netlify-style hosting

### WebSocket connection error
- Pastikan VITE_WS_URL benar di `.env`
- Pastikan backend API running
- Check CORS settings di backend

## 📚 Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 📄 License

MIT
