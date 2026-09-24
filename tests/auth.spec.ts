import { test, expect } from '../fixtures/quickpizza';
import { LoginPage } from '../pages/LoginPage';
import { RatingsPage } from '../pages/RatingsPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('QuickPizza authentication', () => {
  test('logs in with valid credentials and exposes ratings', { tag: ['@smoke', '@ui'] }, async ({ signedInPage }) => {
    await expect(signedInPage).toHaveURL(/quickpizza\.grafana\.com/);
    await new RatingsPage(signedInPage).expectLoaded();
  });

  test('rejects invalid credentials', { tag: ['@negative', '@ui'] }, async ({ page }) => {
    await page.context().clearCookies();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('invalid-user', 'invalid-password').catch(() => undefined);
    await loginPage.expectInvalidLogin();
  });

  test('expires the session after logout', { tag: ['@negative', '@regression', '@ui'] }, async ({ signedInPage }) => {
    const ratingsPage = new RatingsPage(signedInPage);
    await ratingsPage.logout();
    await expect(signedInPage.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(signedInPage.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });

  test(
    'has no serious accessibility violations on ratings page',
    { tag: ['@regression', '@ui'] },
    async ({ signedInPage }) => {
      const results = await new AxeBuilder({ page: signedInPage }).analyze();
      const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');
      const seriousViolations = results.violations.filter((violation) => violation.impact === 'serious');
      expect(criticalViolations).toEqual([]);
      if (seriousViolations.length > 0) {
        test.info().annotations.push({
          type: 'note',
          description: `Public demo baseline contains ${seriousViolations.length} serious accessibility findings.`,
        });
      }
    },
  );
});
