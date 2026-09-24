import grpc from 'k6/net/grpc';
import { Trend, Rate, Counter } from 'k6/metrics';
import { config } from '../../shared/config.js';

export const grpcRpcDuration = new Trend('grpc_rpc_duration', true);
export const grpcRpcErrors = new Rate('grpc_rpc_errors');
export const grpcStatusCodes = new Counter('grpc_status_codes');

export const client = new grpc.Client();
client.load(['../../proto'], 'quickpizza.proto');

export function connect() {
  client.connect(config.grpcAddress, { plaintext: !config.grpcTls });
  return client;
}

export function invoke(method, payload, operation) {
  const started = Date.now();
  const response = client.invoke(method, payload, { tags: { protocol: 'grpc', operation } });
  const tags = { protocol: 'grpc', operation, status: String(response.status) };
  grpcRpcDuration.add(Date.now() - started, tags);
  grpcRpcErrors.add(response.status !== grpc.StatusOK, tags);
  grpcStatusCodes.add(1, tags);
  return response;
}

export function status() {
  return invoke('quickpizza.GRPC/Status', {}, 'status');
}

export function ratePizza(payload) {
  return invoke('quickpizza.GRPC/RatePizza', payload, 'rate_pizza');
}

export function close() {
  client.close();
}

export { grpc };
