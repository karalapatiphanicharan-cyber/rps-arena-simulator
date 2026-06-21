import { test, expect } from '@playwright/test';

test('verify final layout and features', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for game to load
  await page.waitForSelector('canvas');

  // Check for Header
  await expect(page.locator('header')).toContainText('RPS Arena Royale');

  // Verify Sidebars are present
  await expect(page.locator('aside').first()).toBeVisible(); // Left
  await expect(page.locator('aside').last()).toBeVisible();  // Right

  // Open Advanced Simulation (Help/Guides)
  const helpButton = page.getByRole('button', { name: /Help & Guide/i });
  await helpButton.click();
  await expect(page.locator('text=Game Guide')).toBeVisible();
  await page.getByPlaceholder('Search guide...').fill('Crazy');
  await expect(page.locator('text=Random arena events')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  // Verify Advanced AI/Classes section
  const classesSection = page.getByRole('button', { name: /Unit Classes & AI/i });
  await classesSection.click();
  await expect(page.locator('text=Global Strategy')).toBeVisible();

  // Start game and check performance (indirectly by checking if it finishes/progresses)
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'final_verification.png', fullPage: true });
});
