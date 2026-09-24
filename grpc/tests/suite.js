import negative from './negative.js';
import ratePizza from './rate-pizza.js';
import smoke from './smoke.js';
import status from './status.js';
import streaming from './streaming.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate>0.99'],
    grpc_rpc_errors: ['rate<0.01'],
  },
};

export default function () {
  status();
  smoke();
  ratePizza();
  negative();
  streaming();
}
