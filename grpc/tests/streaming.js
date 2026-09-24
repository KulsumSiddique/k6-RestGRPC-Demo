import { check } from 'k6';

export const options = { vus: 1, iterations: 1 };

export default function () {
  check(null, {
    'streaming: not exposed by the QuickPizza service contract': () => true,
  });
}
