import { check, sleep } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { getHealth } from '../clients/health-client.js';
import { listRatings } from '../clients/ratings-client.js';
export const options = {
  scenarios: { soak: { executor: 'constant-vus', vus: 2, duration: '15m', gracefulStop: '30s' } },
  thresholds: { checks: ['rate>0.99'], http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] },
};
export default function () {
  const user = buildUser();
  createUser(user);
  const auth = login(user);
  check(auth, { 'soak: token exists': (value) => Boolean(value.token) });
  check(getHealth().response, { 'soak: health is successful': (res) => res.status === 200 });
  if (auth.token)
    check(listRatings(auth.token).response, { 'soak: ratings is successful': (res) => res.status === 200 });
  sleep(1);
}
