import { check } from 'k6';
import { client, connect, status, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { assertGrpcOk } from '../assertions/grpc-assertions.js';
import { assertReady, assertRating } from '../assertions/quickpizza-assertions.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate>0.99'], grpc_rpc_errors: ['rate<0.01'] },
};

export default function () {
  connect();
  const health = status();
  assertGrpcOk(health, grpc, 'status');
  assertReady(health);

  const rating = ratePizza(buildPizzaPayload());
  assertGrpcOk(rating, grpc, 'rate pizza');
  assertRating(rating);

  check(client, { 'grpc: client initialized': (value) => Boolean(value) });
  close();
}
