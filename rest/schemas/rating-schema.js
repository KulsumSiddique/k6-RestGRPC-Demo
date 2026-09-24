export function isValidRating(body) {
  return Boolean(body && typeof body === 'object' && body.id !== undefined);
}

export function isRatingValueValid(body) {
  const value = body?.stars ?? body?.rating ?? body?.stars_rating;
  return Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= 5;
}
