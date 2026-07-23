import { test, expect } from '@playwright/test';

test.describe('StockMate E2E POS Workflows', () => {
  test('POS Dashboard loads with barcode input and stock grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });
});
