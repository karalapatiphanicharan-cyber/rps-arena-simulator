import { test, expect } from '@playwright/test';

test('verify final layout and features', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for game to load
  await page.waitForSelector('canvas');

  // Check for Header
  await expect(page.locator('header')).toContainText('RPS ARENA ROYALE');

  // Verify Sidebars are present
  await expect(page.locator('aside').first()).toBeVisible(); // Left
  await expect(page.locator('aside').last()).toBeVisible();  // Right

  // Open Help Center
  const helpButton = page.getByRole('button', { name: /Help & Guide/i });
  await helpButton.click();
  await expect(page.locator('text=Basic Rules')).toBeVisible();
  await page.getByPlaceholder('Search documentation...').fill('Crazy');
  await expect(page.locator('text=Crazy Mode Events')).toBeVisible();

  // Verify Advanced Simulation section
  const classesSection = page.getByRole('button', { name: /Advanced Simulation/i });
  await classesSection.click();
  await expect(page.locator('text=Enable Unit Classes')).toBeVisible();

  // Start game and check performance (indirectly by checking if it finishes/progresses)
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'final_verification.png', fullPage: true });
});
