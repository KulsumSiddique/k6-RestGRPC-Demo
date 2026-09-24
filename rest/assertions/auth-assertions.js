import { check } from 'k6';
import { isValidLoginResponse } from '../schemas/auth-schema.js';

export function assertLogin(response, body) {
  return check(response, {
    'login: returns success': (res) => res.status >= 200 && res.status < 300,
    'login: response contains token': () => isValidLoginResponse(body),
  });
}
