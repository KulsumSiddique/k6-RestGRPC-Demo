import { check, sleep } from 'k6';
import { buildUser, createUser, login } from '../clients/auth-client.js';
import { getHealth } from '../clients/health-client.js';
export const options = { stages: [{ duration: '10s', target: 1 }, { duration: '10s', target: 2 }, { duration: '10s', target: 4 }, { duration: '10s', target: 8 }, { duration: '10s', target: 16 }, { duration: '10s', target: 0 }], thresholds: { checks: [{ threshold: 'rate>0.90', abortOnFail: true, delayAbortEval: '10s' }], http_req_failed: [{ threshold: 'rate<0.10', abortOnFail: true, delayAbortEval: '10s' }] } };
export default function () { const user = buildUser(); createUser(user); const auth = login(user); check(auth, { 'breakpoint: token exists': (value) => Boolean(value.token) }); check(getHealth().response, { 'breakpoint: health is successful': (res) => res.status === 200 }); sleep(1); }
