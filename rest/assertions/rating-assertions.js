import { check } from 'k6';
import { isValidRating, isRatingValueValid } from '../schemas/rating-schema.js';

export function assertRating(body, name) {
  return check(body, {
    [`${name}: response has rating structure`]: isValidRating,
    [`${name}: rating value is valid`]: isRatingValueValid,
  });
}
