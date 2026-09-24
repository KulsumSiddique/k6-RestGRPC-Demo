import { check, sleep } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { getHealth } from '../clients/health-client.js';
import { listRatings } from '../clients/ratings-client.js';

export const options = {
  scenarios: {
    rest_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1 },
        { duration: '10s', target: 2 },
        { duration: '15s', target: 2 },
        { duration: '5s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const user = buildUser();
  createUser(user);
  const auth = login(user);
  check(auth, { 'load: token exists': (value) => Boolean(value.token) });

  const health = getHealth();
  check(health.response, { 'load: health is successful': (res) => res.status === 200 });

  if (auth.token) {
    const ratings = listRatings(auth.token);
    check(ratings.response, { 'load: ratings is successful': (res) => res.status === 200 });
  }

  sleep(1);
}
