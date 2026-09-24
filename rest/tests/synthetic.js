import { check } from 'k6';
import { getHealth } from '../clients/health-client.js';
export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate==1'], http_req_failed: ['rate==0'], http_req_duration: ['p(95)<300'] },
};
export default function () {
  check(getHealth().response, { 'synthetic: REST health is 200': (res) => res.status === 200 });
}
