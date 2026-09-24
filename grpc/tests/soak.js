import { check, sleep } from 'k6';
import { connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';
export const options = {
  scenarios: { soak: { executor: 'constant-vus', vus: 2, duration: '15m', gracefulStop: '30s' } },
  thresholds: { checks: ['rate>0.99'], grpc_rpc_errors: ['rate<0.01'], grpc_req_duration: ['p(95)<500'] },
};
export default function () {
  connect();
  check(status(), { 'soak: status is OK': (res) => res.status === grpc.StatusOK });
  check(ratePizza(buildPizzaPayload()), { 'soak: rate pizza is OK': (res) => res.status === grpc.StatusOK });
  close();
  sleep(1);
}
