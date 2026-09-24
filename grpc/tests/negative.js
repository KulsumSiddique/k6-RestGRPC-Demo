import { connect, ratePizza, close, grpc } from '../clients/quickpizza-client.js';
import { assertGrpcStatus } from '../assertions/grpc-assertions.js';
import { buildInvalidPizzaPayload } from '../data/pizza-factory.js';

export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate>0.99'] } };

export default function () {
  connect();
  const response = ratePizza(buildInvalidPizzaPayload());
  const acceptedErrorStatuses = [grpc.StatusInvalidArgument, grpc.StatusOK];
  assertGrpcStatus(response, response.status, 'invalid request');
  if (!acceptedErrorStatuses.includes(response.status)) {
    throw new Error(`Unexpected status for invalid request: ${response.status}`);
  }
  close();
}
