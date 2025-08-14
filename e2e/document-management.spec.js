import { test, expect } from '@playwright/test';

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Mock authentication if needed
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    await page.reload();
  });

  test('should navigate to documents page', async ({ page }) => {
    // Click on Documents in navigation
    await page.click('[data-testid="nav-documents"]');
    
    // Verify we're on the documents page
    await expect(page).toHaveURL(/.*\/documents/);
    await expect(page.locator('h1')).toContainText('Documents');
  });

  test('should display document list', async ({ page }) => {
    await page.goto('/documents');
    
    // Wait for documents to load
    await page.waitForSelector('[data-testid="document-list"]');
    
    // Check if document cards are visible
    const documentCards = page.locator('[data-testid="document-card"]');
    await expect(documentCards).toHaveCount.greaterThan(0);
  });

  test('should create new document', async ({ page }) => {
    await page.goto('/documents');
    
    // Click create new document button
    await page.click('[data-testid="create-document-btn"]');
    
    // Fill in document details
    await page.fill('[data-testid="document-title"]', 'Test Document');
    await page.selectOption('[data-testid="document-type"]', 'report');
    await page.fill('[data-testid="document-description"]', 'This is a test document');
    
    // Save document
    await page.click('[data-testid="save-document-btn"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Document created successfully');
  });

  test('should edit existing document', async ({ page }) => {
    await page.goto('/documents');
    
    // Click on first document
    await page.click('[data-testid="document-card"]:first-child [data-testid="edit-btn"]');
    
    // Wait for edit form to load
    await page.waitForSelector('[data-testid="document-title"]');
    
    // Update document title
    await page.fill('[data-testid="document-title"]', 'Updated Test Document');
    
    // Save changes
    await page.click('[data-testid="save-document-btn"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should delete document', async ({ page }) => {
    await page.goto('/documents');
    
    // Click delete button on first document
    await page.click('[data-testid="document-card"]:first-child [data-testid="delete-btn"]');
    
    // Confirm deletion in modal
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Document deleted successfully');
  });

  test('should search documents', async ({ page }) => {
    await page.goto('/documents');
    
    // Enter search query
    await page.fill('[data-testid="search-input"]', 'test');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results are filtered
    const documentCards = page.locator('[data-testid="document-card"]');
    const firstCard = documentCards.first();
    await expect(firstCard).toContainText('test', { ignoreCase: true });
  });

  test('should filter documents by type', async ({ page }) => {
    await page.goto('/documents');
    
    // Select filter
    await page.selectOption('[data-testid="type-filter"]', 'report');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Verify all visible documents are reports
    const documentCards = page.locator('[data-testid="document-card"]');
    const count = await documentCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = documentCards.nth(i);
      await expect(card.locator('[data-testid="document-type"]')).toContainText('Report');
    }
  });

  test('should generate document from template', async ({ page }) => {
    await page.goto('/documents');
    
    // Click generate from template
    await page.click('[data-testid="generate-document-btn"]');
    
    // Select template
    await page.selectOption('[data-testid="template-select"]', 'safety-report');
    
    // Fill template data
    await page.fill('[data-testid="field-inspector-name"]', 'John Doe');
    await page.fill('[data-testid="field-inspection-date"]', '2024-01-15');
    await page.fill('[data-testid="field-location"]', 'Factory Floor A');
    
    // Generate document
    await page.click('[data-testid="generate-btn"]');
    
    // Verify document was generated
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Document generated successfully');
  });

  test('should export document', async ({ page }) => {
    await page.goto('/documents');
    
    // Click on first document
    await page.click('[data-testid="document-card"]:first-child');
    
    // Wait for document details to load
    await page.waitForSelector('[data-testid="document-content"]');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-pdf-btn"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);
  });

  test('should handle document permissions', async ({ page }) => {
    // Set user with limited permissions
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 2,
        name: 'Limited User',
        email: 'limited@example.com',
        role: 'viewer'
      }));
    });
    
    await page.goto('/documents');
    
    // Verify create button is not visible for viewers
    await expect(page.locator('[data-testid="create-document-btn"]')).not.toBeVisible();
    
    // Verify edit buttons are not visible
    await expect(page.locator('[data-testid="edit-btn"]')).not.toBeVisible();
    
    // Verify delete buttons are not visible
    await expect(page.locator('[data-testid="delete-btn"]')).not.toBeVisible();
  });
});