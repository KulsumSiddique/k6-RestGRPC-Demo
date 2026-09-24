import { uniqueValue } from '../../shared/data.js';

export function buildRatingPayload() {
  return {
    pizza_id: 1,
    stars: 4,
  };
}

export function buildUpdatedRatingPayload() {
  return {
    stars: 5,
    pizza_id: 1,
  };
}
