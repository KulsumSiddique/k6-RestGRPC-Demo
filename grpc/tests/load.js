import { check, sleep } from 'k6';
import { connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';

export const options = {
  scenarios: {
    grpc_load: {
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
    grpc_rpc_errors: ['rate<0.01'],
    grpc_req_duration: ['p(95)<500'],
  },
};

export default function () {
  connect();
  const ready = status();
  check(ready, { 'load: status is OK': (res) => res.status === grpc.StatusOK });
  const rating = ratePizza(buildPizzaPayload());
  check(rating, { 'load: rate pizza is OK': (res) => res.status === grpc.StatusOK });
  close();
  sleep(1);
}
