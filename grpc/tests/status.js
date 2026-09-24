import { check } from 'k6';
import { connect, status, close, grpc } from '../clients/quickpizza-client.js';
import { assertGrpcOk } from '../assertions/grpc-assertions.js';
import { assertReady } from '../assertions/quickpizza-assertions.js';

export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate>0.99'] } };

export default function () {
  connect();
  const response = status();
  assertGrpcOk(response, grpc, 'status');
  assertReady(response);
  check(response, { 'status: response has message': (res) => Boolean(res.message) });
  close();
}
