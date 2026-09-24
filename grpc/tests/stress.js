import { check, sleep } from 'k6';
import { connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';

export const options = {
  scenarios: {
    grpc_stress: {
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
    grpc_rpc_errors: ['rate<0.05'],
    grpc_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  connect();
  const ready = status();
  check(ready, { 'stress: status is OK': (res) => res.status === grpc.StatusOK });
  const rating = ratePizza(buildPizzaPayload());
  check(rating, { 'stress: rate pizza is OK': (res) => res.status === grpc.StatusOK });
  close();
  sleep(1);
}
