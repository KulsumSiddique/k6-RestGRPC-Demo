import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createDisposableUser } from '../test-data/userFactory';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const user = await createDisposableUser(page.request);
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(user.username, user.password);
  await page.context().storageState({ path: authFile });
});
