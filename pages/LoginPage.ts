import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.getByRole('textbox', { name: /Username/ });
  private readonly passwordInput = this.page.getByRole('textbox', { name: /Password/ });
  private readonly signInButton = this.page.getByRole('button', { name: 'Sign in' });

  async open(): Promise<void> {
    const csrfResponse = this.page.waitForResponse(
      (response) => response.url().endsWith('/api/csrf-token') && response.request().method() === 'POST',
    );
    await this.goto('/login');
    await csrfResponse;
    await expect(this.page.locator('#csrf-token')).toHaveValue(/.+/);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    const loginResponse = this.page.waitForResponse(
      (response) => response.url().includes('/api/users/token/login') && response.request().method() === 'POST',
    );
    await this.signInButton.click();
    const response = await loginResponse;
    if (response.status() !== 200) throw new Error(`Login failed (${response.status()}): ${await response.text()}`);
  }

  async expectInvalidLogin(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
