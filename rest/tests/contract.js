import { check } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { createRating } from '../clients/ratings-client.js';
import { buildRatingPayload } from '../data/rating-factory.js';
import { isValidRating } from '../schemas/rating-schema.js';

export const options = { vus: 1, iterations: 1 };

export default function () {
  const user = buildUser();
  createUser(user);
  const auth = login(user);
  const result = createRating(buildRatingPayload(), auth.token);
  check(result.body, { 'rating contract: valid response': isValidRating });
}
