import auth from './auth.js';
import contract from './contract.js';
import health from './health.js';
import negative from './negative.js';
import ratingsCrud from './ratings-crud.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  auth();
  contract();
  health();
  negative();
  ratingsCrud();
}
