// Navigation Test Script for MITO Mobile App
// This script helps diagnose navigation issues in PWA mode

const NavigationTester = {
  // Test PWA installation and display mode
  testPWAMode: () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = window.navigator.standalone || isStandalone;
    
    console.log('PWA Mode Test:', {
      isStandalone,
      isInstalled,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
    
    return { isStandalone, isInstalled };
  },

  // Test safe area insets support
  testSafeAreaInsets: () => {
    const supportsTop = CSS.supports('padding-top: env(safe-area-inset-top)');
    const supportsBottom = CSS.supports('padding-bottom: env(safe-area-inset-bottom)');
    const supportsLeft = CSS.supports('padding-left: env(safe-area-inset-left)');
    const supportsRight = CSS.supports('padding-right: env(safe-area-inset-right)');
    
    console.log('Safe Area Insets Test:', {
      supportsTop,
      supportsBottom,
      supportsLeft,
      supportsRight,
      allSupported: supportsTop && supportsBottom && supportsLeft && supportsRight
    });
    
    return { supportsTop, supportsBottom, supportsLeft, supportsRight };
  },

  // Test viewport configuration
  testViewport: () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const viewportContent = viewport ? viewport.getAttribute('content') : null;
    
    console.log('Viewport Test:', {
      viewportContent,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
      screenWidth: screen.width,
      screenHeight: screen.height,
      devicePixelRatio: window.devicePixelRatio
    });
    
    return { viewportContent, dimensions: { width: window.innerWidth, height: window.innerHeight } };
  },

  // Test navigation bar visibility
  testNavigationBar: () => {
    const tabBar = document.querySelector('[data-testid="tab-bar"]') || 
                   document.querySelector('.tab-bar-container') ||
                   document.querySelector('[class*="tab"]');
    
    const computedStyle = tabBar ? window.getComputedStyle(tabBar) : null;
    
    console.log('Navigation Bar Test:', {
      tabBarFound: !!tabBar,
      display: computedStyle ? computedStyle.display : 'not found',
      visibility: computedStyle ? computedStyle.visibility : 'not found',
      position: computedStyle ? computedStyle.position : 'not found',
      zIndex: computedStyle ? computedStyle.zIndex : 'not found',
      bottom: computedStyle ? computedStyle.bottom : 'not found'
    });
    
    return { tabBarFound: !!tabBar, computedStyle };
  },

  // Test React Navigation state
  testReactNavigation: () => {
    // This would need to be called from within the React app
    console.log('React Navigation Test: Run this from within the React app context');
    return { message: 'Run from React context' };
  },

  // Run all tests
  runAllTests: () => {
    console.log('=== MITO Navigation Diagnostic Tests ===');
    const results = {
      pwa: NavigationTester.testPWAMode(),
      safeArea: NavigationTester.testSafeAreaInsets(),
      viewport: NavigationTester.testViewport(),
      navigationBar: NavigationTester.testNavigationBar(),
      reactNavigation: NavigationTester.testReactNavigation()
    };
    
    console.log('=== Test Results Summary ===', results);
    return results;
  },

  // Fix common issues automatically
  autoFix: () => {
    console.log('=== Attempting Auto-Fix ===');
    
    // Fix viewport if needed
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const currentContent = viewport.getAttribute('content');
      if (!currentContent.includes('user-scalable=no')) {
        viewport.setAttribute('content', currentContent + ', user-scalable=no');
        console.log('Fixed viewport meta tag');
      }
    }
    
    // Add safe area CSS if not present
    if (!document.querySelector('#mito-safe-area-fix')) {
      const style = document.createElement('style');
      style.id = 'mito-safe-area-fix';
      style.textContent = `
        @media (display-mode: standalone) {
          body { padding-bottom: env(safe-area-inset-bottom); }
          .tab-bar-container { 
            position: fixed !important; 
            bottom: 0 !important; 
            z-index: 9999 !important; 
          }
        }
      `;
      document.head.appendChild(style);
      console.log('Added safe area CSS fix');
    }
    
    console.log('Auto-fix completed');
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.MITONavigationTester = NavigationTester;
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('Running MITO Navigation Tests...');
    NavigationTester.runAllTests();
  }, 2000);
}

export default NavigationTester;
