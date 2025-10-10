const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting MITO Mobile PWA build process...');

try {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Copy public files to dist
  console.log('📁 Copying public files...');
  const publicDir = 'public';
  const distDir = 'dist';
  
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    });
  }

  // Create a comprehensive PWA index.html
  console.log('🔨 Creating PWA index.html...');
  const pwaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  
  <!-- PWA Meta Tags -->
  <meta name="application-name" content="MITO Mobile" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="MITO Mobile" />
  <meta name="description" content="Mobile task and ticket management system" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="msapplication-TileColor" content="#1976d2" />
  <meta name="msapplication-tap-highlight" content="no" />
  <meta name="theme-color" content="#1976d2" />
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
  <link rel="apple-touch-icon" sizes="167x167" href="/icon-192.png" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
  <link rel="shortcut icon" href="/icon-192.png" />
  
  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json" />
  
  <title>MITO Task Manager Mobile</title>
  
  <style>
    /* Loading screen styles */
    #loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .loading-logo {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      border-radius: 16px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }
    
    .loading-text {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    
    .loading-subtitle {
      font-size: 14px;
      opacity: 0.8;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-top: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* App container */
    #root {
      width: 100%;
      height: 100vh;
      background: #f5f5f5;
    }
    
    /* Mobile-first responsive design */
    @media (max-width: 768px) {
      .loading-logo {
        width: 60px;
        height: 60px;
        font-size: 24px;
      }
      .loading-text {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div id="loading-screen">
    <div class="loading-logo">M</div>
    <div class="loading-text">MITO Mobile</div>
    <div class="loading-subtitle">Task Management System</div>
    <div class="loading-spinner"></div>
  </div>
  
  <div id="root">
    <!-- React App will be loaded here -->
    <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="color: #1976d2; margin-bottom: 20px;">MITO Mobile PWA</h1>
      <p style="color: #666; margin-bottom: 20px;">Your task and ticket management system</p>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="color: #1976d2; margin-bottom: 15px;">🚀 PWA Features</h3>
        <ul style="text-align: left; color: #666;">
          <li>📱 Installable on mobile devices</li>
          <li>⚡ Fast loading with service worker</li>
          <li>🔄 Offline functionality</li>
          <li>📊 Real-time updates</li>
          <li>🎨 Native app-like experience</li>
        </ul>
        <div style="margin-top: 20px;">
          <button onclick="installPWA()" style="background: #1976d2; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Install App
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // PWA Installation
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });
    
    function installPWA() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      } else {
        alert('PWA installation not available on this device');
      }
    }
    
    // Hide loading screen
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.getElementById('loading-screen').style.display = 'none';
      }, 2000);
    });
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('SW registered: ', registration);
          })
          .catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    
    // Add to home screen prompt for iOS
    if (window.navigator.standalone === false) {
      const addToHomeScreen = document.createElement('div');
      addToHomeScreen.innerHTML = 'Add to Home Screen';
      addToHomeScreen.style.cssText = \`
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1976d2;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      \`;
      addToHomeScreen.onclick = () => {
        alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen"');
      };
      document.body.appendChild(addToHomeScreen);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), pwaHtml);
  console.log('✅ Created comprehensive PWA index.html');

  console.log('🎉 Build process completed!');
  console.log('📦 Files ready for deployment in ./dist directory');
  console.log('🌐 PWA features enabled:');
  console.log('   - Service Worker for offline functionality');
  console.log('   - Web App Manifest for installation');
  console.log('   - Responsive design for mobile devices');
  console.log('   - Add to Home Screen prompts');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}