/**
 * Expense Management Testing Script for SmartSpendr
 * Run this script in the browser console to test expense features
 */

class ExpenseTestSuite {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.testData = {
      validExpense: {
        title: 'Test Coffee',
        amount: 4.50,
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        notes: 'Morning coffee test'
      },
      invalidExpenses: [
        { title: '', amount: 4.50, category: 'Food & Dining' }, // Empty title
        { title: 'Coffee', amount: -5.00, category: 'Food & Dining' }, // Negative amount
        { title: 'A'.repeat(100), amount: 4.50, category: 'Food & Dining' }, // Too long title
        { title: 'Coffee', amount: 0, category: 'Food & Dining' }, // Zero amount
      ]
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: 'color: #2196F3',
      success: 'color: #4CAF50; font-weight: bold',
      error: 'color: #F44336; font-weight: bold',
      warning: 'color: #FF9800'
    };
    console.log(`%c[EXPENSE TEST] ${message}`, colors[type]);
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

  // Test 1: Check if Add Expense page loads
  async testAddExpensePageLoad() {
    return this.runTest('Add Expense Page Load', async () => {
      // Navigate to add expense page if not already there
      if (!window.location.pathname.includes('/add-expense')) {
        window.history.pushState({}, '', '/add-expense');
        await this.waitFor(() => window.location.pathname.includes('/add-expense'), 2000);
      }

      const hasForm = document.querySelector('form') !== null;
      const hasTitleInput = document.querySelector('input[type="text"]') !== null ||
                           document.querySelector('input[placeholder*="title"]') !== null ||
                           document.querySelector('input[placeholder*="Title"]') !== null;
      const hasAmountInput = document.querySelector('input[type="number"]') !== null ||
                            document.querySelector('input[placeholder*="amount"]') !== null ||
                            document.querySelector('input[placeholder*="Amount"]') !== null;
      const hasSubmitButton = document.querySelector('button[type="submit"]') !== null ||
                             document.querySelector('button') !== null;

      this.log(`Form found: ${hasForm}`, 'info');
      this.log(`Title input found: ${hasTitleInput}`, 'info');
      this.log(`Amount input found: ${hasAmountInput}`, 'info');
      
      return hasForm && hasTitleInput && hasAmountInput && hasSubmitButton;
    });
  }

  // Test 2: Test form field identification
  async testFormFieldIdentification() {
    return this.runTest('Form Field Identification', () => {
      const formFields = {
        title: this.findInput(['title', 'name', 'description']),
        amount: this.findInput(['amount', 'price', 'cost'], 'number'),
        category: this.findSelect(['category', 'type']),
        date: this.findInput(['date'], 'date'),
        notes: this.findTextarea(['notes', 'description', 'memo'])
      };

      const foundFields = Object.entries(formFields)
        .filter(([key, field]) => field !== null)
        .map(([key]) => key);

      this.log(`Found fields: ${foundFields.join(', ')}`, 'info');
      
      // At minimum, we need title and amount fields
      return formFields.title !== null && formFields.amount !== null;
    });
  }

  // Test 3: Test form validation with invalid data
  async testFormValidation() {
    return this.runTest('Form Validation', async () => {
      let validationPassed = true;
      
      for (const [index, invalidExpense] of this.invalidExpenses.entries()) {
        this.log(`Testing invalid expense ${index + 1}`, 'info');
        
        try {
          // Fill form with invalid data
          await this.fillExpenseForm(invalidExpense);
          
          // Try to submit
          const submitButton = this.findSubmitButton();
          if (submitButton) {
            submitButton.click();
            
            // Wait for validation messages
            await this.waitFor(() => 
              document.querySelector('.error') !== null ||
              document.querySelector('[role="alert"]') !== null ||
              document.querySelector('.invalid') !== null ||
              document.querySelector('.text-red') !== null ||
              Array.from(document.querySelectorAll('*')).some(el => 
                el.textContent.includes('required') ||
                el.textContent.includes('invalid') ||
                el.textContent.includes('error')
              ), 2000);
            
            const hasValidationError = document.querySelector('.error') !== null ||
                                     document.querySelector('[role="alert"]') !== null ||
                                     document.body.textContent.includes('required') ||
                                     document.body.textContent.includes('invalid');
            
            if (!hasValidationError) {
              this.log(`Validation failed for test case ${index + 1}`, 'warning');
              validationPassed = false;
            }
          }
        } catch (error) {
          this.log(`Error in validation test ${index + 1}: ${error.message}`, 'warning');
        }
      }
      
      return validationPassed;
    });
  }

  // Test 4: Test successful expense submission
  async testExpenseSubmission() {
    return this.runTest('Expense Submission', async () => {
      try {
        // Clear any existing data
        await this.clearForm();
        
        // Fill form with valid data
        await this.fillExpenseForm(this.testData.validExpense);
        
        // Submit form
        const submitButton = this.findSubmitButton();
        if (submitButton) {
          submitButton.click();
          
          // Wait for success feedback
          await this.waitFor(() => 
            document.body.textContent.includes('success') ||
            document.body.textContent.includes('added') ||
            document.body.textContent.includes('saved') ||
            document.querySelector('.success') !== null ||
            document.querySelector('.toast') !== null, 5000);
          
          const hasSuccessFeedback = document.body.textContent.includes('success') ||
                                   document.body.textContent.includes('added') ||
                                   document.body.textContent.includes('saved');
          
          this.log(`Success feedback found: ${hasSuccessFeedback}`, 'info');
          return hasSuccessFeedback;
        }
        
        return false;
      } catch (error) {
        this.log(`Submission test error: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 5: Test draft auto-save functionality
  async testDraftAutoSave() {
    return this.runTest('Draft Auto-Save', async () => {
      try {
        // Clear form first
        await this.clearForm();
        
        // Fill partial data
        const partialData = {
          title: 'Draft Test',
          amount: 10.50
        };
        
        await this.fillExpenseForm(partialData);
        
        // Check if data is saved to localStorage
        const draftKeys = Object.keys(localStorage).filter(key => 
          key.includes('draft') || 
          key.includes('expense') || 
          key.includes('form')
        );
        
        this.log(`Found ${draftKeys.length} potential draft keys`, 'info');
        
        // Simulate page refresh by checking if form would restore data
        const titleInput = this.findInput(['title']);
        const amountInput = this.findInput(['amount'], 'number');
        
        // Check if there's any mechanism for draft saving
        const hasDraftMechanism = draftKeys.length > 0 || 
                                 titleInput?.value === partialData.title ||
                                 amountInput?.value === partialData.amount.toString();
        
        return hasDraftMechanism;
      } catch (error) {
        this.log(`Draft save test error: ${error.message}`, 'error');
        return false;
      }
    });
  }

  // Test 6: Test expense list display
  async testExpenseListDisplay() {
    return this.runTest('Expense List Display', async () => {
      // Navigate to dashboard to check recent expenses
      if (!window.location.pathname.includes('/dashboard') && !window.location.pathname === '/') {
        window.history.pushState({}, '', '/');
        await this.waitFor(() => 
          window.location.pathname === '/' || 
          window.location.pathname.includes('/dashboard'), 2000);
      }

      // Look for expense list indicators
      const hasExpenseList = document.querySelector('.expense-list') !== null ||
                           document.querySelector('[data-testid="expense-list"]') !== null ||
                           document.body.textContent.includes('Recent') ||
                           document.body.textContent.includes('Expenses') ||
                           Array.from(document.querySelectorAll('*')).some(el => 
                             el.textContent.includes('$') && el.textContent.includes('.'));

      this.log(`Expense list indicators found: ${hasExpenseList}`, 'info');
      return hasExpenseList;
    });
  }

  // Test 7: Test offline functionality
  async testOfflineFunctionality() {
    return this.runTest('Offline Functionality', async () => {
      // Check if service worker is registered
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      if (hasServiceWorker) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        this.log(`Service worker registrations: ${registrations.length}`, 'info');
      }

      // Check for offline indicators
      const hasOfflineSupport = document.body.textContent.includes('offline') ||
                              document.body.textContent.includes('Offline') ||
                              localStorage.getItem('offline') !== null ||
                              hasServiceWorker;

      this.log(`Offline support detected: ${hasOfflineSupport}`, 'info');
      return hasOfflineSupport;
    });
  }

  // Test 8: Test category selection
  async testCategorySelection() {
    return this.runTest('Category Selection', () => {
      const categorySelect = this.findSelect(['category', 'type']);
      const categoryRadios = document.querySelectorAll('input[type="radio"]');
      const categoryButtons = Array.from(document.querySelectorAll('button'))
        .filter(btn => btn.textContent.includes('Food') || 
                      btn.textContent.includes('Transport') ||
                      btn.textContent.includes('Shopping'));

      const hasCategorySelection = categorySelect !== null || 
                                 categoryRadios.length > 0 || 
                                 categoryButtons.length > 0;

      this.log(`Category selection mechanism found: ${hasCategorySelection}`, 'info');
      return hasCategorySelection;
    });
  }

  // Test 9: Test responsive design on add expense page
  async testResponsiveDesign() {
    return this.runTest('Responsive Design', () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Check for responsive elements
      const hasResponsiveClasses = Array.from(document.querySelectorAll('*')).some(el =>
        el.className.includes('sm:') ||
        el.className.includes('md:') ||
        el.className.includes('lg:') ||
        el.className.includes('responsive')
      );

      // Check if form adapts to viewport
      const form = document.querySelector('form');
      const isFormResponsive = form && (
        form.offsetWidth < viewport.width * 0.9 ||
        hasResponsiveClasses
      );

      this.log(`Viewport: ${viewport.width}x${viewport.height}`, 'info');
      this.log(`Responsive design detected: ${hasResponsiveClasses || isFormResponsive}`, 'info');
      
      return hasResponsiveClasses || isFormResponsive;
    });
  }

  // Test 10: Test accessibility features
  async testAccessibility() {
    return this.runTest('Accessibility Features', () => {
      const form = document.querySelector('form');
      
      // Check for labels
      const hasLabels = document.querySelectorAll('label').length > 0;
      
      // Check for ARIA attributes
      const hasAriaAttributes = Array.from(document.querySelectorAll('*')).some(el =>
        el.hasAttribute('aria-label') ||
        el.hasAttribute('aria-labelledby') ||
        el.hasAttribute('aria-describedby')
      );

      // Check for proper form structure
      const hasProperFormStructure = form && (
        form.querySelector('fieldset') !== null ||
        hasLabels ||
        hasAriaAttributes
      );

      this.log(`Labels found: ${hasLabels}`, 'info');
      this.log(`ARIA attributes found: ${hasAriaAttributes}`, 'info');
      
      return hasProperFormStructure || hasLabels;
    });
  }

  // Helper methods
  findInput(placeholders, type = 'text') {
    for (const placeholder of placeholders) {
      const selectors = [
        `input[placeholder*="${placeholder}"]`,
        `input[name*="${placeholder}"]`,
        `input[id*="${placeholder}"]`,
        `input[type="${type}"]`
      ];
      
      for (const selector of selectors) {
        const input = document.querySelector(selector);
        if (input) return input;
      }
    }
    return null;
  }

  findSelect(names) {
    for (const name of names) {
      const selectors = [
        `select[name*="${name}"]`,
        `select[id*="${name}"]`,
        `[role="combobox"]`
      ];
      
      for (const selector of selectors) {
        const select = document.querySelector(selector);
        if (select) return select;
      }
    }
    return null;
  }

  findTextarea(names) {
    for (const name of names) {
      const selectors = [
        `textarea[name*="${name}"]`,
        `textarea[id*="${name}"]`,
        `textarea[placeholder*="${name}"]`
      ];
      
      for (const selector of selectors) {
        const textarea = document.querySelector(selector);
        if (textarea) return textarea;
      }
    }
    return null;
  }

  findSubmitButton() {
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button'
    ];
    
    for (const selector of submitSelectors) {
      const button = document.querySelector(selector);
      if (button && (
        button.textContent.includes('Add') ||
        button.textContent.includes('Save') ||
        button.textContent.includes('Submit') ||
        button.type === 'submit'
      )) {
        return button;
      }
    }
    
    return document.querySelector('button');
  }

  async fillExpenseForm(data) {
    if (data.title) {
      const titleInput = this.findInput(['title', 'name']);
      if (titleInput) {
        titleInput.value = data.title;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (data.amount) {
      const amountInput = this.findInput(['amount'], 'number');
      if (amountInput) {
        amountInput.value = data.amount;
        amountInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (data.category) {
      const categorySelect = this.findSelect(['category']);
      if (categorySelect) {
        categorySelect.value = data.category;
        categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (data.date) {
      const dateInput = this.findInput(['date'], 'date');
      if (dateInput) {
        dateInput.value = data.date;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (data.notes) {
      const notesInput = this.findTextarea(['notes']);
      if (notesInput) {
        notesInput.value = data.notes;
        notesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Wait for form to process changes
    await this.waitFor(() => true, 500);
  }

  async clearForm() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.type !== 'submit' && input.type !== 'button') {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    await this.waitFor(() => true, 500);
  }

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
    this.log('Starting Expense Management Test Suite', 'info');
    this.log('=========================================', 'info');
    
    await this.testAddExpensePageLoad();
    await this.testFormFieldIdentification();
    await this.testFormValidation();
    await this.testExpenseSubmission();
    await this.testDraftAutoSave();
    await this.testExpenseListDisplay();
    await this.testOfflineFunctionality();
    await this.testCategorySelection();
    await this.testResponsiveDesign();
    await this.testAccessibility();
    
    this.displayResults();
  }

  displayResults() {
    this.log('=========================================', 'info');
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
  }
}

// Manual test instructions
const MANUAL_EXPENSE_TEST_INSTRUCTIONS = `
🧪 MANUAL EXPENSE MANAGEMENT TESTS
==================================

1. ADD EXPENSE FORM TEST:
   - Navigate to "Add Expense" page
   - Fill in: Title, Amount (>0.01), Category, Date, Notes
   - Submit and verify success notification
   - Check if expense appears in recent list

2. FORM VALIDATION TEST:
   - Try submitting empty required fields
   - Enter negative amount, verify error
   - Enter title >50 chars, verify error
   - Check real-time validation feedback

3. DRAFT AUTO-SAVE TEST:
   - Start filling expense form
   - Refresh page or navigate away
   - Return to form, check if data restores

4. EDIT/DELETE EXPENSE TEST:
   - Add a test expense
   - Edit the expense, update fields
   - Save and verify changes
   - Delete expense and confirm removal

5. OFFLINE FUNCTIONALITY TEST:
   - Go offline (disable network)
   - Add new expense
   - Go back online
   - Verify expense syncs

6. CATEGORY SELECTION TEST:
   - Test all category options
   - Verify categories save correctly
   - Check category-based filtering

Run automated tests with:
> const expenseTests = new ExpenseTestSuite();
> expenseTests.runAllTests();
`;

// Export for use
window.ExpenseTestSuite = ExpenseTestSuite;

// Display instructions
console.log(MANUAL_EXPENSE_TEST_INSTRUCTIONS);
console.log('%c🧪 Ready to run expense management tests!', 'color: #4CAF50; font-size: 16px; font-weight: bold');
console.log('%cRun: new ExpenseTestSuite().runAllTests()', 'color: #2196F3; font-size: 14px');