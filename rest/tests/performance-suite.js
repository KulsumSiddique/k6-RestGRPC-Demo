import load from './load.js';
import stress from './stress.js';
import soak from './soak.js';
import spike from './spike.js';
import breakpoint from './breakpoint.js';
import synthetic from './synthetic.js';

export function loadScenario() {
  load();
}

export function stressScenario() {
  stress();
}
export function soakScenario() { soak(); }
export function spikeScenario() { spike(); }
export function breakpointScenario() { breakpoint(); }
export function syntheticScenario() { synthetic(); }

export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      exec: 'loadScenario',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1 },
        { duration: '10s', target: 2 },
        { duration: '15s', target: 2 },
        { duration: '5s', target: 0 },
      ],
    },
    stress: {
      executor: 'ramping-vus',
      exec: 'stressScenario',
      startTime: '35s',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 2 },
        { duration: '10s', target: 3 },
        { duration: '15s', target: 5 },
        { duration: '15s', target: 5 },
        { duration: '5s', target: 0 },
      ],
    },
    soak: { executor: 'constant-vus', exec: 'soakScenario', vus: 2, duration: '15m', startTime: '0s' },
    spike: { executor: 'ramping-vus', exec: 'spikeScenario', startVUs: 0, stages: [{ duration: '5s', target: 1 }, { duration: '5s', target: 10 }, { duration: '20s', target: 10 }, { duration: '5s', target: 1 }, { duration: '5s', target: 0 }] },
    breakpoint: { executor: 'ramping-vus', exec: 'breakpointScenario', startTime: '0s', startVUs: 0, stages: [{ duration: '10s', target: 1 }, { duration: '10s', target: 2 }, { duration: '10s', target: 4 }, { duration: '10s', target: 8 }, { duration: '10s', target: 16 }, { duration: '10s', target: 0 }] },
    synthetic: { executor: 'shared-iterations', exec: 'syntheticScenario', vus: 1, iterations: 1, startTime: '0s' },
  },
  thresholds: {
    'http_req_failed{scenario:load}': ['rate<0.01'],
    'http_req_duration{scenario:load}': ['p(95)<500'],
    'http_req_failed{scenario:stress}': ['rate<0.05'],
    'http_req_duration{scenario:stress}': ['p(95)<1000'],
    'http_req_failed{scenario:soak}': ['rate<0.01'],
    'http_req_failed{scenario:spike}': ['rate<0.05'],
    'http_req_failed{scenario:breakpoint}': ['rate<0.10'],
    'http_req_failed{scenario:synthetic}': ['rate==0'],
  },
};
