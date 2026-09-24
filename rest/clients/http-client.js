import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { config } from '../../shared/config.js';

export const restOperationDuration = new Trend('rest_operation_duration', true);

export function request(method, path, body = null, token = null, tags = {}) {
  const { expectedStatuses, ...metricTags } = tags;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Token ${token}`;

  const params = { headers, tags: { protocol: 'rest', ...metricTags } };
  if (expectedStatuses) params.responseCallback = http.expectedStatuses(...expectedStatuses);
  const payload = body === null ? null : JSON.stringify(body);
  const started = Date.now();
  const response = http.request(method, `${config.restBaseUrl}${path}`, payload, params);
  restOperationDuration.add(Date.now() - started, params.tags);
  return response;
}

export function json(response) {
  try {
    return response.json();
  } catch {
    return null;
  }
}
