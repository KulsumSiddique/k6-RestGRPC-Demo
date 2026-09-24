import { check, sleep } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { getHealth } from '../clients/health-client.js';
export const options = { stages: [{ duration: '5s', target: 1 }, { duration: '5s', target: 10 }, { duration: '20s', target: 10 }, { duration: '5s', target: 1 }, { duration: '5s', target: 0 }], thresholds: { checks: ['rate>0.95'], http_req_failed: ['rate<0.05'], http_req_duration: ['p(95)<1000'] } };
export default function () { const user = buildUser(); createUser(user); const auth = login(user); check(auth, { 'spike: token exists': (value) => Boolean(value.token) }); check(getHealth().response, { 'spike: health is successful': (res) => res.status === 200 }); sleep(1); }
