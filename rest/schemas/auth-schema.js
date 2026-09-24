export function isValidLoginResponse(body) {
  return Boolean(body && (typeof body.token === 'string' || typeof body.access_token === 'string'));
}

export function isValidUserResponse(body) {
  return Boolean(body && typeof body === 'object');
}
