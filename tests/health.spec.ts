import { test, expect } from '@playwright/test';

test.describe('QuickPizza environment health', () => {
  test('serves required public endpoints', { tag: ['@api', '@smoke'] }, async ({ request }) => {
    for (const path of ['/ready', '/healthz']) {
      const response = await request.get(path);
      expect(response.status(), `${path} response`).toBe(200);
    }

    const loginPage = await request.get('/login');
    expect(loginPage.status()).toBe(200);
    expect(await loginPage.text()).toContain('QuickPizza User Login');
  });
});
