import { check } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { assertLogin } from '../assertions/auth-assertions.js';
import { isValidUserResponse } from '../schemas/auth-schema.js';

export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate>0.99'] } };

export default function () {
  const user = buildUser();
  const created = createUser(user);
  check(created.response, { 'user: created': (res) => res.status >= 200 && res.status < 300 });
  check(created.body, { 'user: response is valid': isValidUserResponse });

  const authenticated = login(user);
  assertLogin(authenticated.response, authenticated.body);
}
