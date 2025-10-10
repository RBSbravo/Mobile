const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting MITO Mobile PWA build...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Make sure you\'re in the mobile-app directory.');
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Create dist directory if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Export web build
  console.log('🌐 Exporting web build...');
  execSync('npx expo export --platform web --output-dir dist', { stdio: 'inherit' });

  // Check if export was successful
  if (!fs.existsSync('dist') || fs.readdirSync('dist').length === 0) {
    throw new Error('Export failed or dist directory is empty');
  }

  // Copy PWA files to dist
  console.log('📱 Copying PWA files...');
  const publicDir = 'public';
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    publicFiles.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join('dist', file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: dist');
  console.log('Files in dist:', fs.readdirSync('dist'));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
