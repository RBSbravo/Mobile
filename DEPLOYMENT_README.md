# MITO Mobile PWA Deployment Guide

## 🚀 Quick Deployment to Vercel

This guide will help you deploy your MITO Mobile app as a Progressive Web App (PWA) on Vercel.

## 📋 Prerequisites

- [Vercel account](https://vercel.com) (free)
- GitHub repository with your mobile app code
- Railway backend deployed and running

## 🔧 Pre-Deployment Checklist

✅ **Backend Connection**: Configured to use Railway URL (`https://backend-ticketing-system.up.railway.app/api`)
✅ **PWA Configuration**: Manifest.json, service worker, and icons created
✅ **Build Process**: Custom build script ready for Vercel
✅ **Environment Variables**: Production configuration set

## 📦 Build Output

The build process creates a `dist/` folder with:

- `index.html` - PWA-enabled HTML file
- `manifest.json` - Web app manifest
- `sw.js` - Service worker for offline functionality
- `icon-192.png` & `icon-512.png` - App icons

## 🌐 Vercel Deployment Steps

### Step 1: Prepare Repository

1. **Commit all changes** to your mobile app
2. **Push to GitHub** repository
3. **Ensure build script works** locally (`npm run build`)

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Import your repository** (mobile-app folder)
5. **Configure project settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (or select mobile-app folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel:

```
NODE_ENV=production
EXPO_PUBLIC_ENV=production
```

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for build** to complete
3. **Get your PWA URL** (e.g., `https://your-app.vercel.app`)

## 🧪 Testing Your PWA

### Desktop Testing

1. **Open PWA URL** in Chrome/Edge
2. **Check browser console** for service worker registration
3. **Look for install prompt** or install button
4. **Test offline functionality**

### Mobile Testing

1. **Open PWA URL** on mobile device
2. **Look for "Add to Home Screen"** option
3. **Install the app** and test functionality
4. **Verify backend connectivity**

## 🔗 Backend Integration

Your PWA is configured to connect to:

- **API Base URL**: `https://backend-ticketing-system.up.railway.app/api`
- **Socket.IO**: `https://backend-ticketing-system.up.railway.app`

## 🛠️ Troubleshooting

### Build Issues

- **Check Node.js version** (use 18.x)
- **Verify all dependencies** are installed
- **Check build logs** in Vercel dashboard

### PWA Issues

- **Verify manifest.json** is accessible
- **Check service worker** registration
- **Test HTTPS** (required for PWA)

### Backend Connection Issues

- **Verify Railway backend** is running
- **Check CORS settings** on backend
- **Test API endpoints** directly

## 📱 PWA Features

Your deployed app includes:

- ✅ **Installable** on mobile devices
- ✅ **Offline functionality** via service worker
- ✅ **Responsive design** for all screen sizes
- ✅ **Native app-like experience**
- ✅ **Real-time updates** via Socket.IO
- ✅ **Add to Home Screen** prompts

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality** thoroughly
2. **Share PWA URL** with users
3. **Monitor performance** in Vercel dashboard
4. **Update backend CORS** to include your PWA domain
5. **Consider app store** submission for native distribution

## 📞 Support

If you encounter issues:

1. **Check Vercel build logs**
2. **Verify backend connectivity**
3. **Test PWA features** in different browsers
4. **Review service worker** registration

---

**Happy Deploying! 🚀**
