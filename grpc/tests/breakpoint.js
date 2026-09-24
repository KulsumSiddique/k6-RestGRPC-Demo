import { check, sleep } from 'k6';
import { connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';
export const options = { stages: [{ duration: '10s', target: 1 }, { duration: '10s', target: 2 }, { duration: '10s', target: 4 }, { duration: '10s', target: 8 }, { duration: '10s', target: 16 }, { duration: '10s', target: 0 }], thresholds: { checks: [{ threshold: 'rate>0.90', abortOnFail: true, delayAbortEval: '10s' }], grpc_rpc_errors: [{ threshold: 'rate<0.10', abortOnFail: true, delayAbortEval: '10s' }] } };
export default function () { connect(); check(status(), { 'breakpoint: status is OK': (res) => res.status === grpc.StatusOK }); check(ratePizza(buildPizzaPayload()), { 'breakpoint: rate pizza is OK': (res) => res.status === grpc.StatusOK }); close(); sleep(1); }
