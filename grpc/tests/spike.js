import { check, sleep } from 'k6';
import { connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';
export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '5s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '5s', target: 1 },
    { duration: '5s', target: 0 },
  ],
  thresholds: { checks: ['rate>0.95'], grpc_rpc_errors: ['rate<0.05'], grpc_req_duration: ['p(95)<1000'] },
};
export default function () {
  connect();
  check(status(), { 'spike: status is OK': (res) => res.status === grpc.StatusOK });
  check(ratePizza(buildPizzaPayload()), { 'spike: rate pizza is OK': (res) => res.status === grpc.StatusOK });
  close();
  sleep(1);
}
