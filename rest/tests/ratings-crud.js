import { check } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { createRating, getRating, updateRating, deleteRating } from '../clients/ratings-client.js';
import { buildRatingPayload, buildUpdatedRatingPayload } from '../data/rating-factory.js';
import { assertRating } from '../assertions/rating-assertions.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate>0.99'], http_req_failed: ['rate<0.01'] },
};

export default function () {
  const user = buildUser();
  createUser(user);
  const auth = login(user);
  check(auth, { 'auth: token exists': (value) => Boolean(value.token) });

  const created = createRating(buildRatingPayload(), auth.token);
  check(created.response, { 'rating: created': (res) => res.status >= 200 && res.status < 300 });
  assertRating(created.body, 'rating create');

  const id = created.body?.id;
  check(id, { 'rating: id exists': (value) => value !== undefined && value !== null });
  if (id === undefined || id === null) return;

  const fetched = getRating(id, auth.token);
  assertRating(fetched.body, 'rating get');

  const updated = updateRating(id, buildUpdatedRatingPayload(), auth.token);
  check(updated.response, { 'rating: updated': (res) => res.status >= 200 && res.status < 300 });
  assertRating(updated.body, 'rating update');

  const removed = deleteRating(id, auth.token);
  check(removed.response, { 'rating: deleted': (res) => res.status >= 200 && res.status < 300 });

  const afterDelete = getRating(id, auth.token, { expectedStatuses: [404] });
  check(afterDelete.response, { 'rating: no longer exists': (res) => res.status === 404 });
}
