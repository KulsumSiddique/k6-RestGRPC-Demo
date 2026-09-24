import { check } from 'k6';
import { connect, status, close, grpc } from '../clients/quickpizza-client.js';
export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate==1'], grpc_rpc_errors: ['rate==0'] } };
export default function () {
  connect();
  check(status(), { 'synthetic: gRPC status is OK': (res) => res.status === grpc.StatusOK });
  close();
}
