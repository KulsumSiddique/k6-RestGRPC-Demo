export function isValidError(body) {
  return Boolean(body && typeof body === 'object');
}
