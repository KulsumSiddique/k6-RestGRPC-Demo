import { request, json } from './http-client.js';

export function createRating(payload, token) {
  const response = request('POST', '/api/ratings', payload, token, { operation: 'create_rating' });
  return { response, body: json(response) };
}

export function listRatings(token) {
  const response = request('GET', '/api/ratings', null, token, { operation: 'list_ratings' });
  return { response, body: json(response) };
}

export function getRating(id, token, options = {}) {
  const response = request('GET', `/api/ratings/${id}`, null, token, {
    operation: 'get_rating',
    ...options,
  });
  return { response, body: json(response) };
}

export function updateRating(id, payload, token) {
  const response = request('PUT', `/api/ratings/${id}`, payload, token, { operation: 'update_rating' });
  return { response, body: json(response) };
}

export function deleteRating(id, token) {
  const response = request('DELETE', `/api/ratings/${id}`, null, token, { operation: 'delete_rating' });
  return { response, body: json(response) };
}
