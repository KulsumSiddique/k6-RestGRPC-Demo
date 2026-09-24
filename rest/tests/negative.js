import { check } from 'k6';
import { request } from '../clients/http-client.js';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { isValidError } from '../schemas/error-schema.js';

export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate>0.99'] } };

export default function () {
  const unauthorized = request('GET', '/api/ratings', null, null, {
    operation: 'unauthorized_list',
    expectedStatuses: [401, 403],
  });

  if (!unauthorized || unauthorized.status === 0 || !unauthorized.body) {
    check(unauthorized, {
      'local REST service is reachable': (res) => Boolean(res && res.status > 0),
    });
    return;
  }

  check(unauthorized, { 'unauthorized: rejected': (res) => res.status === 401 || res.status === 403 });
  check(unauthorized, {
    'unauthorized: has error body': (res) => {
      if (!res.body) return false;
      return isValidError(res.json());
    },
  });

  const user = buildUser();
  createUser(user);
  const auth = login(user);
  const invalid = request('POST', '/api/ratings', { invalid: true }, auth.token, {
    operation: 'invalid_rating',
    expectedStatuses: [400, 401, 403, 422],
  });
  check(invalid, { 'invalid rating: rejected': (res) => res.status >= 400 && res.status < 500 });
}
