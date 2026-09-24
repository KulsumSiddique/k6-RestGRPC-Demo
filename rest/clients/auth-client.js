import { request, json } from './http-client.js';
import { uniqueValue } from '../../shared/data.js';

export function buildUser() {
  return {
    username: uniqueValue('k6-user'),
    password: `K6-${Date.now()}-Password!`,
  };
}

export function createUser(user) {
  const response = request('POST', '/api/users', user, null, { operation: 'create_user' });
  return { response, body: json(response) };
}

export function login(user) {
  const response = request('POST', '/api/users/token/login', user, null, { operation: 'login' });
  const body = json(response);
  return { response, body, token: body?.token || body?.access_token };
}

export function authHeaders(token) {
  return token ? { Authorization: `Token ${token}` } : {};
}
