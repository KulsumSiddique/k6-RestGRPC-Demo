import { test, expect } from '@playwright/test';
test('QuickPizza browser performance baseline', { tag: ['@performance', '@smoke'] }, async ({ page }) => {
  const start = Date.now();
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  expect(Date.now() - start).toBeLessThan(3000);
  const timing = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return { domContentLoaded: entry?.domContentLoadedEventEnd ?? 0, load: entry?.loadEventEnd ?? 0 };
  });
  expect(timing.domContentLoaded).toBeLessThan(2000);
  expect(timing.load).toBeLessThan(3000);
});
