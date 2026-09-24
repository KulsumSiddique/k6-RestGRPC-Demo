import { connect, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { assertGrpcOk } from '../assertions/grpc-assertions.js';
import { assertRating } from '../assertions/quickpizza-assertions.js';
import { buildPizzaPayload } from '../data/pizza-factory.js';

export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate>0.99'] } };

export default function () {
  connect();
  const response = ratePizza(buildPizzaPayload());
  assertGrpcOk(response, grpc, 'rate pizza');
  assertRating(response);
  close();
}
