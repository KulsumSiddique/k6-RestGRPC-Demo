import { check, sleep } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { getHealth } from '../clients/health-client.js';

export const options = {
  scenarios: {
    rest_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 2 },
        { duration: '10s', target: 3 },
        { duration: '15s', target: 5 },
        { duration: '15s', target: 5 },
        { duration: '5s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    checks: ['rate>0.95'],
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const user = buildUser();
  createUser(user);
  const auth = login(user);
  check(auth, { 'stress: token exists': (value) => Boolean(value.token) });

  const health = getHealth();
  check(health.response, { 'stress: health is successful': (res) => res.status === 200 });
  sleep(1);
}
