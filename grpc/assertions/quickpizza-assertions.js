import { check } from 'k6';

export function assertReady(response) {
  return check(response.message, { 'status: service is ready': (message) => message?.ready === true });
}

export function assertRating(response) {
  const getRating = (message) => message?.stars_rating ?? message?.starsRating;
  return check(response.message, {
    'rate pizza: rating exists': (message) => Number.isFinite(Number(getRating(message))),
    'rate pizza: rating is valid': (message) => Number(getRating(message)) >= 1 && Number(getRating(message)) <= 5,
  });
}
