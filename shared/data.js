export function uniqueValue(prefix = 'k6') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
