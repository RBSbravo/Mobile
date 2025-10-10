# MITO Mobile App - PWA Deployment Guide

## 🚀 Vercel Deployment Instructions

### Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repository with your mobile app code
- Railway backend deployed and running

### Step-by-Step Deployment

#### 1. Prepare Your Repository

1. Commit all changes to your GitHub repository
2. Ensure all PWA files are in place:
   - `public/manifest.json`
   - `public/sw.js`
   - `public/index.html`
   - `public/icon-192.png`
   - `public/icon-512.png`
   - `vercel.json`

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `mobile-app`
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. Set Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_API_BASE_URL=https://backend-ticketing-system.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://backend-ticketing-system.up.railway.app
NEXT_PUBLIC_WS_URL=wss://backend-ticketing-system.up.railway.app
NEXT_PUBLIC_APP_NAME=MITO Task Manager Mobile App
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

#### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your PWA will be available at the provided Vercel URL

### 🔧 Local Testing

#### Test PWA Features Locally

```bash
# Install dependencies
npm install

# Start development server
npm run web

# Build for production
npm run build:web
```

#### Test Production Build Locally

```bash
# Serve the built files
npx serve dist
```

### 📱 PWA Features

Your mobile app now includes:

- ✅ **Offline Support**: Service worker caches essential files
- ✅ **Install Prompt**: Users can install as native app
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Push Notifications**: Real-time notifications support
- ✅ **Background Sync**: Syncs data when connection restored
- ✅ **App-like Experience**: Full-screen, standalone mode

### 🔗 Backend Integration

The app automatically connects to your Railway backend:

- **API Base URL**: `https://backend-ticketing-system.up.railway.app/api`
- **Socket.IO**: Real-time features enabled
- **Authentication**: JWT token-based auth
- **File Uploads**: Supports task attachments

### 🐛 Troubleshooting

#### Common Issues:

1. **Build Fails**: Check Node.js version (use 18+)
2. **API Errors**: Verify Railway backend is running
3. **PWA Not Installing**: Check manifest.json and service worker
4. **Offline Issues**: Clear browser cache and reinstall

#### Debug Commands:

```bash
# Check service worker registration
# Open browser DevTools > Application > Service Workers

# Test offline functionality
# DevTools > Network > Offline checkbox

# Check PWA manifest
# DevTools > Application > Manifest
```

### 📊 Performance Optimization

The PWA includes:

- **Code Splitting**: Loads only necessary components
- **Asset Caching**: Static files cached for offline use
- **Lazy Loading**: Images and components load on demand
- **Compression**: Gzip compression enabled
- **CDN**: Global content delivery via Vercel

### 🔄 Updates and Maintenance

- **Automatic Updates**: Service worker handles updates
- **Version Control**: Track changes via Git
- **Monitoring**: Use Vercel Analytics for performance metrics
- **Backup**: Regular database backups via Railway

### 📞 Support

For issues or questions:

1. Check Vercel deployment logs
2. Verify Railway backend status
3. Test API endpoints manually
4. Check browser console for errors

---

**🎉 Congratulations!** Your MITO Mobile App is now deployed as a PWA on Vercel!
