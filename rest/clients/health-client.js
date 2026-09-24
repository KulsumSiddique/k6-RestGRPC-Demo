import { request, json } from './http-client.js';

export function getHealth() {
  const response = request('GET', '/healthz', null, null, { operation: 'health' });
  return { response, body: json(response) };
}
