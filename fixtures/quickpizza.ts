import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { UsersApi } from '../api/UsersApi';
import { LoginPage } from '../pages/LoginPage';

type QuickPizzaFixtures = {
  signedInPage: Page;
  api: APIRequestContext;
};

export const test = base.extend<QuickPizzaFixtures>({
  api: async ({ playwright, baseURL }, use) => {
    const api = await playwright.request.newContext({ baseURL });
    await use(api);
    await api.dispose();
  },

  signedInPage: async ({ page }, use, testInfo) => {
    const diagnostics: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') diagnostics.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => diagnostics.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => diagnostics.push(`requestfailed: ${request.method()} ${request.url()}`));

    await page.goto('/');
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    if (!(await logoutButton.isVisible().catch(() => false))) {
      await page.context().clearCookies();
      const username = `pw-${randomUUID().slice(0, 20)}`;
      const password = randomUUID();
      await new UsersApi(page.request).create(username, password);
      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.login(username, password);
    }
    await expect(logoutButton).toBeVisible();
    await use(page);

    if (diagnostics.length > 0) {
      await testInfo.attach('browser-diagnostics', {
        body: Buffer.from(diagnostics.join('\n')),
        contentType: 'text/plain',
      });
    }
  },
});

export { expect };
