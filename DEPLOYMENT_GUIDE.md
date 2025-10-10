# MITO Mobile PWA Deployment Guide

This guide will help you deploy the MITO Mobile app as a Progressive Web App (PWA) on Vercel.

## 🚀 Quick Deployment Steps

### 1. Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub account
- Railway backend deployed and running

### 2. Prepare Your Repository

1. Push your code to GitHub
2. Ensure all files are committed and pushed

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the following configuration:
   - **Framework Preset**: Other
   - **Root Directory**: `mobile-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to mobile-app directory
cd mobile-app

# Deploy
vercel --prod
```

### 4. Environment Variables

In your Vercel project settings, add these environment variables:

- `NODE_ENV`: `production`
- `REACT_APP_ENV`: `production`
- `REACT_APP_BACKEND_URL`: `https://your-railway-backend.up.railway.app/api`
- `REACT_APP_SOCKET_URL`: `https://your-railway-backend.up.railway.app`

### 5. Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

## 🔧 Configuration Files

### PWA Manifest (`public/manifest.json`)

- App name, icons, theme colors
- Display mode: standalone
- Offline capabilities

### Service Worker (`public/sw.js`)

- Offline caching
- Background sync
- Push notifications

### Vercel Configuration (`vercel.json`)

- Build settings
- Routing rules
- Cache headers

## 📱 PWA Features

### ✅ Implemented Features

- **Offline Support**: App works without internet
- **Install Prompt**: Users can install as native app
- **Push Notifications**: Real-time notifications
- **Background Sync**: Sync data when online
- **Responsive Design**: Works on all devices

### 🎯 PWA Checklist

- [x] Web App Manifest
- [x] Service Worker
- [x] HTTPS (Vercel provides this)
- [x] Responsive design
- [x] Offline functionality
- [x] Installable

## 🧪 Testing Your PWA

### 1. Local Testing

```bash
# Build the app
npm run build

# Serve locally
npm run web:serve
```

### 2. PWA Testing Tools

- **Chrome DevTools**: Lighthouse audit
- **PWA Builder**: Microsoft's PWA testing tool
- **Web App Manifest Validator**: Validate manifest.json

### 3. Mobile Testing

1. Open your deployed URL on mobile
2. Look for "Add to Home Screen" prompt
3. Test offline functionality
4. Test push notifications

## 🔍 Troubleshooting

### Common Issues

#### Build Fails

- Check Node.js version (should be 16+)
- Ensure all dependencies are installed
- Check for TypeScript errors

#### PWA Not Installable

- Verify manifest.json is accessible
- Check service worker registration
- Ensure HTTPS is enabled

#### Backend Connection Issues

- Verify Railway backend URL
- Check CORS settings
- Test API endpoints manually

### Debug Commands

```bash
# Check build output
npm run build

# Test locally
npm run web:serve

# Check service worker
# Open DevTools > Application > Service Workers
```

## 📊 Performance Optimization

### Build Optimization

- Code splitting
- Tree shaking
- Asset optimization

### PWA Optimization

- Efficient caching strategies
- Minimal service worker
- Optimized manifest

## 🔄 Updates and Maintenance

### Updating the App

1. Make changes to your code
2. Push to GitHub
3. Vercel automatically redeploys

### Service Worker Updates

- Service worker updates automatically
- Users get new version on next visit
- Force update by incrementing version in sw.js

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Test locally first
3. Verify environment variables
4. Check Railway backend status

## 🎉 Success!

Once deployed, your MITO Mobile PWA will be:

- Accessible at your Vercel URL
- Installable on mobile devices
- Working offline
- Connected to your Railway backend
- Ready for production use!

---

**Next Steps:**

1. Test the deployed PWA
2. Share with your team
3. Monitor performance
4. Gather user feedback
5. Iterate and improve
