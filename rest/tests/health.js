import { check } from 'k6';
import { getHealth } from '../clients/health-client.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate>0.99'], http_req_failed: ['rate<0.01'] },
};

export default function () {
  const { response } = getHealth();
  check(response, { 'health: returns success': (res) => res.status >= 200 && res.status < 300 });
}
