import { check } from 'k6';

export function assertGrpcOk(response, grpc, name) {
  return check(response, { [`${name}: status is OK`]: (res) => res?.status === grpc.StatusOK });
}

export function assertGrpcStatus(response, expected, name) {
  return check(response, { [`${name}: status matches expected`]: (res) => res?.status === expected });
}
