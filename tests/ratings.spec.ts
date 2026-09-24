import { test, expect } from '../fixtures/quickpizza';
import { randomUUID } from 'node:crypto';
import { RatingsApi } from '../api/RatingsApi';
import { RatingsPage } from '../pages/RatingsPage';
import { validRating } from '../test-data/ratingFactory';

test.describe('Pizza ratings CRUD discovery', () => {
  test('reads the authenticated ratings collection', { tag: ['@smoke', '@ui'] }, async ({ signedInPage }) => {
    await new RatingsPage(signedInPage).expectLoaded();
    await new RatingsPage(signedInPage).expectCollectionOrEmpty();
  });

  test(
    'supports a safe refresh/read-after-navigation check',
    { tag: ['@regression', '@ui'] },
    async ({ signedInPage }) => {
      const ratingsPage = new RatingsPage(signedInPage);
      const before = await ratingsPage.listText();
      await signedInPage.reload();

      await ratingsPage.expectLoaded();
      const after = await ratingsPage.listText();
      expect(after).toEqual(before);
    },
  );

  test(
    'documents delete control without executing destructive action',
    { tag: ['@regression', '@destructive', '@ui'] },
    async ({ signedInPage }) => {
      await expect(new RatingsPage(signedInPage).clearRatingsButton).toBeVisible();
      test.info().annotations.push({
        type: 'note',
        description: 'Destructive action is intentionally not executed against the shared demo.',
      });
    },
  );

  test('checks the documented user creation API contract', { tag: ['@api', '@smoke'] }, async ({ api }) => {
    const response = await api.post('/api/users', {
      data: { username: `pw-${randomUUID().slice(0, 20)}`, password: randomUUID() },
    });
    expect(response.status(), await response.text()).toBe(201);
    expect(response.headers()['content-type']).toMatch(/application\/json/);
    await expect(response.json()).resolves.toMatchObject({ username: expect.any(String) });
  });

  test(
    'creates, updates, and deletes a disposable rating through the API',
    { tag: ['@api', '@regression'] },
    async ({ signedInPage }) => {
      const api = new RatingsApi(signedInPage.request);
      let ratingId: number | undefined;
      try {
        const rating = await api.create(validRating.stars, validRating.pizza_id);
        ratingId = rating.id;
        expect(rating).toMatchObject({ id: expect.any(Number), stars: 5, pizza_id: 1 });

        const updated = await api.update(ratingId, 4, 1);
        expect(updated).toMatchObject({ id: ratingId, stars: 4, pizza_id: 1 });

        await api.delete(ratingId);
        ratingId = undefined;

        const afterDelete = await signedInPage.request.get(`/api/ratings/${rating.id}`);
        expect(afterDelete.status(), await afterDelete.text()).toBe(404);
      } finally {
        if (ratingId !== undefined) await api.delete(ratingId);
      }
    },
  );

  test(
    'rejects invalid rating payloads and missing ratings',
    { tag: ['@api', '@negative', '@regression'] },
    async ({ signedInPage, api }) => {
      const authenticatedApi = signedInPage.request;
      const invalidPayloads = [
        { stars: 0, pizza_id: 1 },
        { stars: 6, pizza_id: 1 },
        { stars: 5, pizza_id: -1 },
        { stars: 5 },
      ];

      for (const data of invalidPayloads) {
        const response = await authenticatedApi.post('/api/ratings', { data });
        expect(response.status(), await response.text()).toBe(400);
      }

      const nonexistentId = 999999999;
      const update = await authenticatedApi.put(`/api/ratings/${nonexistentId}`, {
        data: { stars: 4, pizza_id: 1 },
      });
      expect([400, 404], await update.text()).toContain(update.status());

      const deletion = await authenticatedApi.delete(`/api/ratings/${nonexistentId}`);
      expect([400, 404], await deletion.text()).toContain(deletion.status());

      const unauthorized = await api.get('/api/ratings');
      expect([200, 401], await unauthorized.text()).toContain(unauthorized.status());
      if (unauthorized.status() === 200)
        expect(await unauthorized.json()).toMatchObject({ ratings: expect.any(Array) });
    },
  );

  test('rejects duplicate user creation', { tag: ['@api', '@negative'] }, async ({ api }) => {
    const username = `pw-${randomUUID().slice(0, 20)}`;
    const password = randomUUID();
    const first = await api.post('/api/users', { data: { username, password } });
    expect(first.status(), await first.text()).toBe(201);

    const duplicate = await api.post('/api/users', { data: { username, password } });
    expect(duplicate.status(), await duplicate.text()).toBe(400);
  });
});
