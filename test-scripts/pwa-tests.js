/**
 * Progressive Web App (PWA) Testing Script for SmartSpendr
 * Tests PWA installation, offline functionality, and service worker behavior
 */

class PWATestSuite {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      warning: 'color: #FF9800'
    };
    console.log(`%c[PWA TEST] ${message}`, colors[type]);
  }

  async runTest(testName, testFn) {
    this.testCount++;
    this.log(`Running: ${testName}`);
    
    try {
      const result = await testFn();
      if (result !== false) {
        this.passedTests++;
        this.log(`✅ PASS: ${testName}`, 'success');
        this.results.push({ test: testName, status: 'PASS', details: result });
      } else {
        this.failedTests++;
        this.log(`❌ FAIL: ${testName}`, 'error');
        this.results.push({ test: testName, status: 'FAIL', details: 'Test returned false' });
      }
    } catch (error) {
      this.failedTests++;
      this.log(`❌ ERROR: ${testName} - ${error.message}`, 'error');
      this.results.push({ test: testName, status: 'ERROR', details: error.message });
    }
  }

  // Test 1: Check if Web App Manifest exists
  async testWebAppManifest() {
    return this.runTest('Web App Manifest', async () => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      
      if (!manifestLink) {
        this.log('No manifest link found in HTML', 'warning');
        return false;
      }

      try {
        const manifestUrl = manifestLink.href;
        const response = await fetch(manifestUrl);
        const manifest = await response.json();
        
        this.log(`Manifest URL: ${manifestUrl}`, 'info');
        this.log(`App name: ${manifest.name || manifest.short_name}`, 'info');
        this.log(`Theme color: ${manifest.theme_color}`, 'info');
        this.log(`Icons: ${manifest.icons ? manifest.icons.length : 0}`, 'info');
        
        const hasRequiredFields = manifest.name || manifest.short_name;
        const hasIcons = manifest.icons && manifest.icons.length > 0;
        const hasStartUrl = manifest.start_url;
        
        return hasRequiredFields && hasIcons && hasStartUrl;
      } catch (error) {
        this.log(`Error fetching manifest: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 2: Check Service Worker registration
  async testServiceWorkerRegistration() {
    return this.runTest('Service Worker Registration', async () => {
      if (!('serviceWorker' in navigator)) {
        this.log('Service Worker not supported', 'warning');
        return false;
      }

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        this.log(`Found ${registrations.length} service worker registrations`, 'info');
        
        if (registrations.length === 0) {
          // Try to register service worker if not found
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            this.log('Service worker registered successfully', 'success');
            return true;
          } catch (regError) {
            this.log(`Service worker registration failed: ${regError.message}`, 'warning');
            return false;
          }
        }

        // Check active service worker
        const activeWorker = registrations[0].active;
        if (activeWorker) {
          this.log(`Active service worker: ${activeWorker.scriptURL}`, 'info');
          this.log(`Service worker state: ${activeWorker.state}`, 'info');
        }

        return registrations.length > 0;
      } catch (error) {
        this.log(`Service worker check failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 3: Check PWA installation capability
  async testPWAInstallation() {
    return this.runTest('PWA Installation Capability', () => {
      // Check for beforeinstallprompt event support
      const supportsInstall = 'onbeforeinstallprompt' in window;
      
      // Check if already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
      
      // Check for install prompt in global scope
      const hasInstallPrompt = window.deferredPrompt !== undefined;
      
      this.log(`Supports install prompt: ${supportsInstall}`, 'info');
      this.log(`Is standalone mode: ${isStandalone}`, 'info');
      this.log(`Has deferred prompt: ${hasInstallPrompt}`, 'info');
      
      return supportsInstall || isStandalone;
    });
  }

  // Test 4: Test offline detection
  async testOfflineDetection() {
    return this.runTest('Offline Detection', () => {
      const isOnline = navigator.onLine;
      const hasOnlineEvents = 'ononline' in window && 'onoffline' in window;
      
      this.log(`Currently online: ${isOnline}`, 'info');
      this.log(`Supports online/offline events: ${hasOnlineEvents}`, 'info');
      
      // Test event listeners
      let onlineEventSupported = false;
      let offlineEventSupported = false;
      
      try {
        window.addEventListener('online', () => { onlineEventSupported = true; });
        window.addEventListener('offline', () => { offlineEventSupported = true; });
      } catch (error) {
        this.log(`Event listener setup failed: ${error.message}`, 'warning');
      }
      
      return hasOnlineEvents;
    });
  }

  // Test 5: Test Cache API support
  async testCacheAPI() {
    return this.runTest('Cache API Support', async () => {
      if (!('caches' in window)) {
        this.log('Cache API not supported', 'warning');
        return false;
      }

      try {
        const cacheNames = await caches.keys();
        this.log(`Found ${cacheNames.length} caches`, 'info');
        
        if (cacheNames.length > 0) {
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const cachedRequests = await cache.keys();
            this.log(`Cache "${cacheName}": ${cachedRequests.length} cached resources`, 'info');
          }
        }
        
        return true;
      } catch (error) {
        this.log(`Cache API test failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 6: Test Background Sync support
  async testBackgroundSync() {
    return this.runTest('Background Sync Support', async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const hasBackgroundSync = 'sync' in registration;
        
        this.log(`Background Sync supported: ${hasBackgroundSync}`, 'info');
        
        if (hasBackgroundSync) {
          // Test registering a sync event
          try {
            await registration.sync.register('test-sync');
            this.log('Successfully registered background sync', 'success');
          } catch (syncError) {
            this.log(`Background sync registration failed: ${syncError.message}`, 'warning');
          }
        }
        
        return hasBackgroundSync;
      } catch (error) {
        this.log(`Background sync test failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 7: Test Push Notifications support
  async testPushNotifications() {
    return this.runTest('Push Notifications Support', async () => {
      if (!('Notification' in window)) {
        this.log('Notifications not supported', 'warning');
        return false;
      }

      const permission = Notification.permission;
      this.log(`Notification permission: ${permission}`, 'info');
      
      const supportsPush = 'PushManager' in window;
      this.log(`Push Manager supported: ${supportsPush}`, 'info');
      
      if (supportsPush && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const hasPushManager = 'pushManager' in registration;
          this.log(`Service Worker Push Manager: ${hasPushManager}`, 'info');
          return hasPushManager;
        } catch (error) {
          this.log(`Push notification test failed: ${error.message}`, 'error');
        }
      }
      
      return supportsPush;
    });
  }

  // Test 8: Test App Icons and Splash Screen
  async testAppIconsAndSplash() {
    return this.runTest('App Icons and Splash Screen', async () => {
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink) return false;
        
        const response = await fetch(manifestLink.href);
        const manifest = await response.json();
        
        const icons = manifest.icons || [];
        const hasMultipleSizes = icons.length > 1;
        const hasLargeIcon = icons.some(icon => {
          const sizes = icon.sizes?.split('x');
          return sizes && parseInt(sizes[0]) >= 192;
        });
        
        this.log(`Total icons: ${icons.length}`, 'info');
        this.log(`Has large icon (192x192+): ${hasLargeIcon}`, 'info');
        this.log(`Has splash screen config: ${!!manifest.background_color}`, 'info');
        
        return icons.length > 0 && hasLargeIcon;
      } catch (error) {
        this.log(`Icon test failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 9: Test App Shortcuts
  async testAppShortcuts() {
    return this.runTest('App Shortcuts', async () => {
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink) return false;
        
        const response = await fetch(manifestLink.href);
        const manifest = await response.json();
        
        const shortcuts = manifest.shortcuts || [];
        this.log(`App shortcuts defined: ${shortcuts.length}`, 'info');
        
        if (shortcuts.length > 0) {
          shortcuts.forEach((shortcut, index) => {
            this.log(`Shortcut ${index + 1}: ${shortcut.name} -> ${shortcut.url}`, 'info');
          });
        }
        
        return shortcuts.length > 0;
      } catch (error) {
        this.log(`Shortcuts test failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 10: Test Network Independence (offline functionality)
  async testNetworkIndependence() {
    return this.runTest('Network Independence', async () => {
      // Test if app can work offline by checking cached resources
      if (!('caches' in window)) {
        return false;
      }

      try {
        const cacheNames = await caches.keys();
        let hasCachedResources = false;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const cachedRequests = await cache.keys();
          
          if (cachedRequests.length > 0) {
            hasCachedResources = true;
            
            // Check for essential resources
            const hasIndexPage = cachedRequests.some(req => 
              req.url.includes('index.html') || req.url.endsWith('/'));
            const hasCSS = cachedRequests.some(req => 
              req.url.includes('.css'));
            const hasJS = cachedRequests.some(req => 
              req.url.includes('.js'));
            
            this.log(`Cache has index page: ${hasIndexPage}`, 'info');
            this.log(`Cache has CSS: ${hasCSS}`, 'info');
            this.log(`Cache has JS: ${hasJS}`, 'info');
            
            if (hasIndexPage && (hasCSS || hasJS)) {
              return true;
            }
          }
        }
        
        this.log(`Has cached resources: ${hasCachedResources}`, 'info');
        return hasCachedResources;
      } catch (error) {
        this.log(`Network independence test failed: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 11: Test Security (HTTPS requirement)
  async testSecurityRequirements() {
    return this.runTest('Security Requirements', () => {
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1' ||
                         location.hostname === '[::1]';
      
      const meetsSecurityReq = isHTTPS || isLocalhost;
      
      this.log(`Protocol: ${location.protocol}`, 'info');
      this.log(`Hostname: ${location.hostname}`, 'info');
      this.log(`Meets security requirements: ${meetsSecurityReq}`, 'info');
      
      return meetsSecurityReq;
    });
  }

  // Test 12: Test Performance (load times)
  async testPerformance() {
    return this.runTest('Performance Metrics', () => {
      if (!('performance' in window)) {
        this.log('Performance API not supported', 'warning');
        return false;
      }

      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        const firstPaint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
        
        this.log(`Page load time: ${loadTime.toFixed(2)}ms`, 'info');
        this.log(`DOM content loaded: ${domContentLoaded.toFixed(2)}ms`, 'info');
        if (firstPaint) {
          this.log(`First paint: ${firstPaint.startTime.toFixed(2)}ms`, 'info');
        }
        
        // Consider good performance if load time < 3000ms
        return loadTime < 3000;
      }
      
      return false;
    });
  }

  // Helper method to wait for condition
  async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (condition()) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }

  // Main test runner
  async runAllTests() {
    this.log('Starting PWA Test Suite', 'info');
    this.log('========================', 'info');
    
    await this.testWebAppManifest();
    await this.testServiceWorkerRegistration();
    await this.testPWAInstallation();
    await this.testOfflineDetection();
    await this.testCacheAPI();
    await this.testBackgroundSync();
    await this.testPushNotifications();
    await this.testAppIconsAndSplash();
    await this.testAppShortcuts();
    await this.testNetworkIndependence();
    await this.testSecurityRequirements();
    await this.testPerformance();
    
    this.displayResults();
  }

  displayResults() {
    this.log('========================', 'info');
    this.log('TEST SUITE COMPLETED', 'info');
    this.log(`Total Tests: ${this.testCount}`, 'info');
    this.log(`Passed: ${this.passedTests}`, 'success');
    this.log(`Failed: ${this.failedTests}`, 'error');
    this.log(`Success Rate: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`, 'info');
    
    console.table(this.results);
    
    if (this.failedTests > 0) {
      this.log('FAILED TESTS:', 'error');
      this.results.filter(r => r.status !== 'PASS').forEach(result => {
        this.log(`- ${result.test}: ${result.details}`, 'error');
      });
    }

    // PWA Score calculation
    const pwaScore = this.calculatePWAScore();
    this.log(`PWA COMPLIANCE SCORE: ${pwaScore}/100`, 'info');
    this.displayPWARecommendations(pwaScore);
  }

  calculatePWAScore() {
    const weights = {
      'Web App Manifest': 15,
      'Service Worker Registration': 20,
      'PWA Installation Capability': 10,
      'Offline Detection': 8,
      'Cache API Support': 15,
      'Background Sync Support': 8,
      'Push Notifications Support': 8,
      'App Icons and Splash Screen': 10,
      'App Shortcuts': 5,
      'Network Independence': 20,
      'Security Requirements': 15,
      'Performance Metrics': 10
    };

    let totalScore = 0;
    let maxScore = 0;

    this.results.forEach(result => {
      const weight = weights[result.test] || 0;
      maxScore += weight;
      if (result.status === 'PASS') {
        totalScore += weight;
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  }

  displayPWARecommendations(score) {
    this.log('PWA RECOMMENDATIONS:', 'info');
    
    if (score >= 80) {
      this.log('🎉 Excellent PWA implementation!', 'success');
    } else if (score >= 60) {
      this.log('👍 Good PWA foundation, some improvements needed', 'warning');
    } else {
      this.log('⚠️ PWA implementation needs significant improvements', 'error');
    }

    // Specific recommendations based on failed tests
    const failedTests = this.results.filter(r => r.status !== 'PASS');
    if (failedTests.length > 0) {
      this.log('Priority improvements:', 'warning');
      failedTests.forEach(test => {
        this.log(`• Fix: ${test.test}`, 'warning');
      });
    }
  }
}

// PWA Installation Helper
class PWAInstallHelper {
  static async checkInstallability() {
    const tests = new PWATestSuite();
    tests.log('Checking PWA installability...', 'info');
    
    // Quick installability check
    const manifestCheck = await tests.testWebAppManifest();
    const swCheck = await tests.testServiceWorkerRegistration();
    const securityCheck = await tests.testSecurityRequirements();
    
    return manifestCheck && swCheck && securityCheck;
  }

  static async promptInstall() {
    if (window.deferredPrompt) {
      const result = await window.deferredPrompt.prompt();
      console.log('Install prompt result:', result);
      window.deferredPrompt = null;
      return result;
    } else {
      console.log('No install prompt available');
      return null;
    }
  }
}

// Manual test instructions
const MANUAL_PWA_TEST_INSTRUCTIONS = `
🔧 MANUAL PWA TESTS
===================

1. INSTALLATION TEST:
   - Look for browser install prompt (address bar icon)
   - Click install button if available
   - Verify app installs to home screen/desktop
   - Launch installed app, verify standalone mode

2. OFFLINE FUNCTIONALITY TEST:
   - Visit app online, navigate through pages
   - Disconnect internet (go offline)
   - Refresh page, verify app still loads
   - Try adding expense offline
   - Reconnect, verify data syncs

3. BACKGROUND SYNC TEST:
   - Add expense while offline
   - Close app/browser tab
   - Reconnect to internet
   - Verify data syncs automatically

4. PUSH NOTIFICATIONS TEST:
   - Grant notification permission
   - Trigger notification from app
   - Close app, verify notifications still work
   - Test notification click actions

5. APP SHORTCUTS TEST (if supported):
   - Right-click app icon (desktop)
   - Long-press app icon (mobile)
   - Verify shortcuts appear and work

6. PERFORMANCE TEST:
   - Measure page load times
   - Test app on slow network (3G)
   - Verify smooth animations
   - Check bundle size in DevTools

Run automated tests with:
> const pwaTests = new PWATestSuite();
> pwaTests.runAllTests();

Check installability:
> PWAInstallHelper.checkInstallability();

Prompt installation:
> PWAInstallHelper.promptInstall();
`;

// Export for use
window.PWATestSuite = PWATestSuite;
window.PWAInstallHelper = PWAInstallHelper;

// Display instructions
console.log(MANUAL_PWA_TEST_INSTRUCTIONS);
console.log('%c🔧 Ready to run PWA tests!', 'color: #4CAF50; font-size: 16px; font-weight: bold');
console.log('%cRun: new PWATestSuite().runAllTests()', 'color: #2196F3; font-size: 14px');