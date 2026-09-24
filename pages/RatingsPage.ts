import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RatingsPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: 'Your Pizza Ratings:' });
  readonly logoutButton = this.page.getByRole('button', { name: 'Logout' });
  readonly clearRatingsButton = this.page.getByRole('button', { name: 'Clear Ratings' });
  private readonly ratings = this.page.getByRole('listitem');

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async listText(): Promise<string[]> {
    return this.ratings.allTextContents();
  }

  async expectCollectionOrEmpty(): Promise<void> {
    await expect(this.ratings.first()).toContainText(/Rating ID: \d+ \(stars=\d, pizza_id=\d+\)|No ratings yet/);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
