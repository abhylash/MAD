/**
 * Master Test Runner for SmartSpendr
 * Runs all test suites and generates comprehensive test report
 */

class MasterTestRunner {
  constructor() {
    this.allResults = [];
    this.testSuites = [];
    this.startTime = null;
    this.endTime = null;
  }

  log(message, type = 'info') {
    const colors = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      warning: 'color: #FF9800',
      header: 'color: #9C27B0; font-size: 18px; font-weight: bold'
    };
    console.log(`%c[MASTER TEST] ${message}`, colors[type]);
  }

  async runAllTestSuites() {
    this.startTime = new Date();
    this.log('🚀 Starting SmartSpendr Comprehensive Testing', 'header');
    this.log('=============================================', 'info');
    
    // Initialize test suites
    this.testSuites = [
      { name: 'Authentication Tests', suite: new AuthTestSuite(), category: 'Security' },
      { name: 'Expense Management Tests', suite: new ExpenseTestSuite(), category: 'Core Functionality' },
      { name: 'PWA Tests', suite: new PWATestSuite(), category: 'Progressive Web App' }
    ];

    // Run each test suite
    for (const testSuite of this.testSuites) {
      this.log(`\n📋 Running ${testSuite.name}...`, 'info');
      this.log('═'.repeat(50), 'info');
      
      try {
        await testSuite.suite.runAllTests();
        this.allResults.push({
          suiteName: testSuite.name,
          category: testSuite.category,
          results: testSuite.suite.results,
          stats: {
            total: testSuite.suite.testCount,
            passed: testSuite.suite.passedTests,
            failed: testSuite.suite.failedTests,
            successRate: ((testSuite.suite.passedTests / testSuite.suite.testCount) * 100).toFixed(1)
          }
        });
      } catch (error) {
        this.log(`❌ Error running ${testSuite.name}: ${error.message}`, 'error');
        this.allResults.push({
          suiteName: testSuite.name,
          category: testSuite.category,
          results: [],
          stats: { total: 0, passed: 0, failed: 1, successRate: 0 },
          error: error.message
        });
      }
    }

    this.endTime = new Date();
    this.generateMasterReport();
  }

  generateMasterReport() {
    this.log('\n📊 COMPREHENSIVE TEST REPORT', 'header');
    this.log('═'.repeat(60), 'info');
    
    // Calculate overall statistics
    const overallStats = this.calculateOverallStats();
    
    // Display execution summary
    this.displayExecutionSummary(overallStats);
    
    // Display detailed results by category
    this.displayResultsByCategory();
    
    // Display critical issues
    this.displayCriticalIssues();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Display test coverage matrix
    this.displayTestCoverageMatrix();
    
    // Export results for further analysis
    this.exportResults();
  }

  calculateOverallStats() {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    this.allResults.forEach(suite => {
      totalTests += suite.stats.total;
      totalPassed += suite.stats.passed;
      totalFailed += suite.stats.failed;
    });

    return {
      totalTests,
      totalPassed,
      totalFailed,
      overallSuccessRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0,
      executionTime: this.endTime - this.startTime
    };
  }

  displayExecutionSummary(stats) {
    this.log('📈 EXECUTION SUMMARY', 'info');
    this.log('─'.repeat(30), 'info');
    this.log(`Total Test Suites: ${this.allResults.length}`, 'info');
    this.log(`Total Tests: ${stats.totalTests}`, 'info');
    this.log(`Passed: ${stats.totalPassed}`, 'success');
    this.log(`Failed: ${stats.totalFailed}`, 'error');
    this.log(`Overall Success Rate: ${stats.overallSuccessRate}%`, 'info');
    this.log(`Execution Time: ${(stats.executionTime / 1000).toFixed(2)} seconds`, 'info');
    
    // Success rate indicator
    if (stats.overallSuccessRate >= 90) {
      this.log('🎉 EXCELLENT - App is ready for production!', 'success');
    } else if (stats.overallSuccessRate >= 75) {
      this.log('👍 GOOD - Minor issues need attention', 'warning');
    } else if (stats.overallSuccessRate >= 50) {
      this.log('⚠️ FAIR - Several issues need fixing', 'warning');
    } else {
      this.log('🚨 POOR - Significant issues require immediate attention', 'error');
    }
  }

  displayResultsByCategory() {
    this.log('\n📊 RESULTS BY CATEGORY', 'info');
    this.log('─'.repeat(40), 'info');
    
    const categoriesData = [];
    
    this.allResults.forEach(suite => {
      const categoryData = {
        Category: suite.category,
        'Test Suite': suite.suiteName,
        'Total Tests': suite.stats.total,
        'Passed': suite.stats.passed,
        'Failed': suite.stats.failed,
        'Success Rate': `${suite.stats.successRate}%`,
        'Status': suite.stats.successRate >= 80 ? '✅ Pass' : 
                 suite.stats.successRate >= 60 ? '⚠️ Warning' : '❌ Fail'
      };
      
      categoriesData.push(categoryData);
    });
    
    console.table(categoriesData);
  }

  displayCriticalIssues() {
    this.log('\n🚨 CRITICAL ISSUES', 'error');
    this.log('─'.repeat(30), 'info');
    
    const criticalIssues = [];
    
    this.allResults.forEach(suite => {
      if (suite.error) {
        criticalIssues.push(`❌ ${suite.suiteName}: ${suite.error}`);
      }
      
      const failedTests = suite.results.filter(test => test.status !== 'PASS');
      failedTests.forEach(test => {
        // Identify critical tests based on names
        const isCritical = test.test.toLowerCase().includes('login') ||
                          test.test.toLowerCase().includes('security') ||
                          test.test.toLowerCase().includes('auth') ||
                          test.test.toLowerCase().includes('data') ||
                          test.test.toLowerCase().includes('submission');
        
        if (isCritical) {
          criticalIssues.push(`🔥 CRITICAL: ${suite.suiteName} - ${test.test}`);
        }
      });
    });
    
    if (criticalIssues.length === 0) {
      this.log('✅ No critical issues found!', 'success');
    } else {
      criticalIssues.forEach(issue => this.log(issue, 'error'));
    }
  }

  generateRecommendations() {
    this.log('\n💡 RECOMMENDATIONS', 'info');
    this.log('─'.repeat(30), 'info');
    
    const recommendations = [];
    
    this.allResults.forEach(suite => {
      const successRate = parseFloat(suite.stats.successRate);
      
      if (successRate < 50) {
        recommendations.push(`🔴 HIGH PRIORITY: Fix ${suite.suiteName} - Success rate is critically low (${suite.stats.successRate}%)`);
      } else if (successRate < 75) {
        recommendations.push(`🟡 MEDIUM PRIORITY: Improve ${suite.suiteName} - Multiple tests failing (${suite.stats.successRate}%)`);
      } else if (successRate < 90) {
        recommendations.push(`🟢 LOW PRIORITY: Polish ${suite.suiteName} - Minor improvements needed (${suite.stats.successRate}%)`);
      }
    });

    // Specific recommendations based on test categories
    const authSuite = this.allResults.find(s => s.suiteName.includes('Authentication'));
    if (authSuite && authSuite.stats.successRate < 100) {
      recommendations.push('🔐 Authentication issues detected - Verify Firebase configuration and OAuth setup');
    }

    const expenseSuite = this.allResults.find(s => s.suiteName.includes('Expense'));
    if (expenseSuite && expenseSuite.stats.successRate < 80) {
      recommendations.push('💰 Expense management needs attention - Check form validation and data persistence');
    }

    const pwaSuite = this.allResults.find(s => s.suiteName.includes('PWA'));
    if (pwaSuite && pwaSuite.stats.successRate < 70) {
      recommendations.push('📱 PWA features need improvement - Check service worker and manifest configuration');
    }

    if (recommendations.length === 0) {
      this.log('🎯 All systems performing well! Consider additional optimizations.', 'success');
    } else {
      recommendations.forEach(rec => this.log(rec, 'warning'));
    }
  }

  displayTestCoverageMatrix() {
    this.log('\n📋 TEST COVERAGE MATRIX', 'info');
    this.log('─'.repeat(35), 'info');
    
    const coverageAreas = {
      'Authentication & Security': { tested: false, critical: true },
      'User Interface': { tested: false, critical: true },
      'Data Management': { tested: false, critical: true },
      'Form Validation': { tested: false, critical: true },
      'Offline Functionality': { tested: false, critical: false },
      'Performance': { tested: false, critical: false },
      'Accessibility': { tested: false, critical: true },
      'Cross-browser Compatibility': { tested: false, critical: true },
      'Mobile Responsiveness': { tested: false, critical: true },
      'PWA Features': { tested: false, critical: false },
      'Error Handling': { tested: false, critical: true },
      'Network Resilience': { tested: false, critical: false }
    };

    // Mark areas as tested based on results
    this.allResults.forEach(suite => {
      suite.results.forEach(test => {
        const testName = test.test.toLowerCase();
        
        if (testName.includes('auth') || testName.includes('login') || testName.includes('security')) {
          coverageAreas['Authentication & Security'].tested = true;
        }
        if (testName.includes('form') || testName.includes('validation')) {
          coverageAreas['Form Validation'].tested = true;
        }
        if (testName.includes('offline') || testName.includes('network')) {
          coverageAreas['Offline Functionality'].tested = true;
          coverageAreas['Network Resilience'].tested = true;
        }
        if (testName.includes('responsive') || testName.includes('design')) {
          coverageAreas['Mobile Responsiveness'].tested = true;
        }
        if (testName.includes('accessibility') || testName.includes('aria')) {
          coverageAreas['Accessibility'].tested = true;
        }
        if (testName.includes('pwa') || testName.includes('service worker') || testName.includes('manifest')) {
          coverageAreas['PWA Features'].tested = true;
        }
        if (testName.includes('performance') || testName.includes('load')) {
          coverageAreas['Performance'].tested = true;
        }
        if (testName.includes('error') || testName.includes('handling')) {
          coverageAreas['Error Handling'].tested = true;
        }
        if (testName.includes('submission') || testName.includes('data')) {
          coverageAreas['Data Management'].tested = true;
        }
      });
    });

    const coverageMatrix = Object.entries(coverageAreas).map(([area, info]) => ({
      'Coverage Area': area,
      'Tested': info.tested ? '✅ Yes' : '❌ No',
      'Critical': info.critical ? '🔴 Yes' : '🟡 No',
      'Status': info.tested ? '✅ Covered' : info.critical ? '🚨 Missing (Critical)' : '⚠️ Missing'
    }));

    console.table(coverageMatrix);

    // Calculate coverage percentage
    const totalAreas = Object.keys(coverageAreas).length;
    const testedAreas = Object.values(coverageAreas).filter(area => area.tested).length;
    const coveragePercentage = ((testedAreas / totalAreas) * 100).toFixed(1);
    
    this.log(`Test Coverage: ${coveragePercentage}% (${testedAreas}/${totalAreas} areas)`, 'info');
  }

  exportResults() {
    this.log('\n💾 EXPORTING RESULTS', 'info');
    this.log('─'.repeat(25), 'info');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      executionTime: this.endTime - this.startTime,
      overallStats: this.calculateOverallStats(),
      testSuites: this.allResults,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        online: navigator.onLine
      }
    };

    // Store in localStorage for later retrieval
    try {
      localStorage.setItem('smartspendr_test_results', JSON.stringify(exportData));
      this.log('✅ Results saved to localStorage', 'success');
    } catch (error) {
      this.log(`❌ Failed to save results: ${error.message}`, 'error');
    }

    // Display export commands
    this.log('\n📤 EXPORT COMMANDS:', 'info');
    this.log('Copy results to clipboard:', 'info');
    this.log('> copy(JSON.stringify(JSON.parse(localStorage.getItem("smartspendr_test_results")), null, 2))', 'info');
    this.log('\nDownload as JSON:', 'info');
    this.log('> downloadTestResults()', 'info');
    this.log('\nGenerate HTML report:', 'info');
    this.log('> generateHTMLReport()', 'info');

    // Add export functions to global scope
    window.downloadTestResults = () => this.downloadResults(exportData);
    window.generateHTMLReport = () => this.generateHTMLReport(exportData);
  }

  downloadResults(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartspendr-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Test results downloaded!');
  }

  generateHTMLReport(data) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartSpendr Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; }
        .success { color: #4CAF50; }
        .error { color: #F44336; }
        .warning { color: #FF9800; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SmartSpendr Test Report</h1>
        <p>Generated: ${data.timestamp}</p>
        <p>Execution Time: ${(data.executionTime / 1000).toFixed(2)} seconds</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>Total Tests</h3>
            <p style="font-size: 24px; font-weight: bold;">${data.overallStats.totalTests}</p>
        </div>
        <div class="stat-card">
            <h3>Passed</h3>
            <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${data.overallStats.totalPassed}</p>
        </div>
        <div class="stat-card">
            <h3>Failed</h3>
            <p style="font-size: 24px; font-weight: bold; color: #F44336;">${data.overallStats.totalFailed}</p>
        </div>
        <div class="stat-card">
            <h3>Success Rate</h3>
            <p style="font-size: 24px; font-weight: bold;">${data.overallStats.overallSuccessRate}%</p>
        </div>
    </div>

    <h2>Test Suite Results</h2>
    <table>
        <thead>
            <tr>
                <th>Test Suite</th>
                <th>Category</th>
                <th>Total</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Success Rate</th>
            </tr>
        </thead>
        <tbody>
            ${data.testSuites.map(suite => `
                <tr>
                    <td>${suite.suiteName}</td>
                    <td>${suite.category}</td>
                    <td>${suite.stats.total}</td>
                    <td class="success">${suite.stats.passed}</td>
                    <td class="error">${suite.stats.failed}</td>
                    <td>${suite.stats.successRate}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>Environment Information</h2>
    <ul>
        <li><strong>URL:</strong> ${data.environment.url}</li>
        <li><strong>Viewport:</strong> ${data.environment.viewport.width}x${data.environment.viewport.height}</li>
        <li><strong>Online:</strong> ${data.environment.online ? 'Yes' : 'No'}</li>
        <li><strong>User Agent:</strong> ${data.environment.userAgent}</li>
    </ul>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartspendr-test-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('HTML report generated!');
  }
}

// Comprehensive test execution instructions
const COMPREHENSIVE_TEST_INSTRUCTIONS = `
🧪 SMARTSPENDR COMPREHENSIVE TESTING GUIDE
==========================================

AUTOMATED TESTING:
> const masterRunner = new MasterTestRunner();
> await masterRunner.runAllTestSuites();

INDIVIDUAL TEST SUITES:
> new AuthTestSuite().runAllTests();         // Authentication tests
> new ExpenseTestSuite().runAllTests();      // Expense management tests  
> new PWATestSuite().runAllTests();          // PWA functionality tests

MANUAL TESTING CHECKLIST:
□ Complete Google OAuth login flow
□ Test all form validations thoroughly
□ Verify offline functionality works
□ Test PWA installation process
□ Check responsive design on multiple devices
□ Verify accessibility with screen reader
□ Test cross-browser compatibility
□ Validate data persistence and sync

EXPORT OPTIONS:
□ Download JSON results: downloadTestResults()
□ Generate HTML report: generateHTMLReport()
□ Copy to clipboard: copy(localStorage.getItem("smartspendr_test_results"))

TESTING ENVIRONMENTS:
□ Desktop browsers: Chrome, Firefox, Safari, Edge
□ Mobile browsers: iOS Safari, Android Chrome
□ Network conditions: Online, Offline, Slow 3G
□ Screen sizes: Mobile (320px), Tablet (768px), Desktop (1024px+)

Remember to test with real Firebase configuration for full functionality!
`;

// Export classes
window.MasterTestRunner = MasterTestRunner;

// Display comprehensive instructions
console.log(COMPREHENSIVE_TEST_INSTRUCTIONS);
console.log('%c🎯 Master Test Runner Ready!', 'color: #9C27B0; font-size: 20px; font-weight: bold');
console.log('%cRun: new MasterTestRunner().runAllTestSuites()', 'color: #2196F3; font-size: 16px');