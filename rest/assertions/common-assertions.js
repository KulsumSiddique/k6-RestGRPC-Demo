import { check } from 'k6';

export function assertStatus(response, expected, name) {
  return check(response, { [`${name}: status is ${expected}`]: (res) => res.status === expected });
}

export function assertSuccess(response, name) {
  return check(response, { [`${name}: status is successful`]: (res) => res.status >= 200 && res.status < 300 });
}

export function assertResponseTime(response, limit, name) {
  return check(response, { [`${name}: response is below ${limit}ms`]: (res) => res.timings.duration < limit });
}
