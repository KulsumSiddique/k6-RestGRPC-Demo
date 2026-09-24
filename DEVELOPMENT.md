# Developer Guide

This document maps the repository files to their responsibilities. Read it alongside [README.md](README.md) for setup and commands.

## System overview

```text
Playwright ── browser, API, health, accessibility, and page timing checks
     │
     └──────────────┐
                    ├── QuickPizza Docker service
k6 REST ────────────┘    REST: localhost:8080
k6 gRPC ───────────────── gRPC: localhost:5051
```

Playwright is the browser and functional test layer. k6 is the REST/gRPC functional and performance layer. `docker-compose.yml` supplies the local QuickPizza service used by both layers.

## Root configuration and infrastructure

| File | Responsibility |
|---|---|
| `package.json` | npm commands for Playwright, validation, k6 execution, and report generation. |
| `package-lock.json` | Locked npm dependency versions. Keep it synchronized with `package.json`. |
| `playwright.config.ts` | Loads the selected environment, sets `baseURL`, projects, timeouts, workers, and HTML/JUnit reporters. |
| `tsconfig.json` | TypeScript compiler settings for the Playwright code. |
| `eslint.config.mjs` | ESLint rules for TypeScript and JavaScript source. |
| `.prettierrc.json` | Prettier formatting rules. |
| `docker-compose.yml` | Starts QuickPizza and maps REST `3333 -> 8080` and gRPC `3334 -> 5051`. |
| `proto/quickpizza.proto` | gRPC service and message contract used by the k6 gRPC client. |
| `.env.*.example` | Optional environment templates for test, staging, and production-style runs. |

## Shared k6 code

| File | Functions / responsibility |
|---|---|
| `shared/config.js` | Selects the environment from `TEST_ENV`; exports REST and gRPC addresses, TLS settings, and credentials. |
| `shared/data.js` | `uniqueValue()` creates unique test data; `randomItem()` selects a random item. |

## Playwright layer

### API clients and schemas

| File | Functions / responsibility |
|---|---|
| `api/UsersApi.ts` | `UsersApi.create()` creates a user through the API. |
| `api/RatingsApi.ts` | `list()`, `get()`, `create()`, `update()`, and `delete()` wrap rating API operations and validate responses. |
| `api/schemas.ts` | Zod schemas for users and ratings; exports `User` and `Rating` TypeScript types. |

### Page objects and fixtures

| File | Functions / responsibility |
|---|---|
| `pages/BasePage.ts` | Shared page object base class; `goto()` navigates to a relative path. |
| `pages/LoginPage.ts` | Opens the login page, performs login, and verifies invalid-login behavior. |
| `pages/RatingsPage.ts` | Verifies the ratings page, reads ratings, handles empty/collection states, and logs out. |
| `fixtures/quickpizza.ts` | Provides the `api` request fixture and `signedInPage` fixture. Creates isolated users and authenticates browser tests. |
| `test-data/userFactory.ts` | `createDisposableUser()` creates a unique user for Playwright setup. |
| `test-data/ratingFactory.ts` | Exports the standard valid rating payload used by tests. |

### Playwright tests

| File | Coverage |
|---|---|
| `tests/auth.setup.ts` | Creates a disposable user, logs in, and saves `playwright/.auth/user.json`. |
| `tests/auth.spec.ts` | Valid login, invalid login, logout, and session behavior. |
| `tests/ratings.spec.ts` | Authenticated ratings UI, API CRUD, contracts, and negative cases. |
| `tests/health.spec.ts` | Public health and API endpoint checks. |
| `tests/browser-performance.spec.ts` | Browser navigation, DOM-content-loaded, and page-load timing thresholds. |

Playwright output is generated under `playwright-report/` and `test-results/`; these are ignored generated artifacts, not source files.

## REST k6 layer

### REST clients, data, schemas, and assertions

| File | Functions / responsibility |
|---|---|
| `rest/clients/http-client.js` | `request()` sends tagged HTTP requests and records `rest_operation_duration`; `json()` parses response bodies. |
| `rest/clients/auth-client.js` | `buildUser()`, `createUser()`, `login()`, and `authHeaders()` implement user setup and authentication. |
| `rest/clients/ratings-client.js` | `createRating()`, `listRatings()`, `getRating()`, `updateRating()`, and `deleteRating()` implement rating operations. |
| `rest/clients/health-client.js` | `getHealth()` calls `/healthz`. |
| `rest/data/rating-factory.js` | `buildRatingPayload()` and `buildUpdatedRatingPayload()` create valid rating requests. |
| `rest/schemas/*.js` | Lightweight response validators for users, login responses, ratings, and errors. |
| `rest/assertions/*.js` | Reusable checks for status codes, response time, authentication, and rating responses. |

### REST tests

| File | Coverage |
|---|---|
| `rest/tests/suite.js` | Combined REST functional suite: authentication, contract, health, negative, and CRUD. |
| `rest/tests/auth.js` | User creation and login. |
| `rest/tests/contract.js` | Rating response contract validation. |
| `rest/tests/health.js` | Health endpoint validation. |
| `rest/tests/negative.js` | Unauthorized and invalid-request behavior. |
| `rest/tests/ratings-crud.js` | Create, read, update, delete, and post-delete verification. |
| `rest/tests/performance-suite.js` | Combines all REST performance scenarios into one run. |
| `rest/tests/load.js` | Normal ramp-up/load behavior. |
| `rest/tests/stress.js` | Higher sustained load. |
| `rest/tests/soak.js` | Moderate sustained load for 15 minutes. |
| `rest/tests/spike.js` | Rapid increase and decrease in virtual users. |
| `rest/tests/breakpoint.js` | Progressive load increase with abort thresholds. |
| `rest/tests/synthetic.js` | Lightweight health/API monitoring check. |

## gRPC k6 layer

| File | Functions / responsibility |
|---|---|
| `grpc/clients/quickpizza-client.js` | Creates the k6 gRPC client; `connect()`, `invoke()`, `status()`, `ratePizza()`, and `close()` manage RPC calls and metrics. |
| `grpc/data/pizza-factory.js` | `buildPizzaPayload()` creates valid pizza ratings; `buildInvalidPizzaPayload()` creates negative-test input. |
| `grpc/assertions/grpc-assertions.js` | Checks successful and expected gRPC status codes. |
| `grpc/assertions/quickpizza-assertions.js` | Validates service readiness and rating response contents. |
| `grpc/tests/suite.js` | Combined gRPC functional suite: status, smoke, rate pizza, negative, and streaming-contract check. |
| `grpc/tests/status.js` | Status RPC validation. |
| `grpc/tests/rate-pizza.js` | RatePizza RPC validation. |
| `grpc/tests/smoke.js` | End-to-end status and rating smoke path. |
| `grpc/tests/negative.js` | Invalid RPC payload behavior. |
| `grpc/tests/streaming.js` | Documents the current contract limitation: streaming is not exposed; it records that expected limitation as a check. |
| `grpc/tests/performance-suite.js` | Combines all gRPC performance scenarios into one run. |
| `grpc/tests/load.js`, `stress.js`, `soak.js`, `spike.js`, `breakpoint.js`, `synthetic.js` | Implement the corresponding gRPC performance profiles. |

## Reporting

| File / directory | Responsibility |
|---|---|
| `scripts/k6-report.mjs` | Reads a k6 summary JSON file and writes a dashboard-style HTML report with request metrics, checks, failed requests, and threshold status. |
| `test-results/k6/*.json` | Generated k6 summary data. |
| `test-results/k6/*.html` | Generated k6 HTML reports. |
| `playwright-report/` | Generated Playwright HTML report. |
| `outputs/playwright-crud-test-plan.md` | High-level test plan and implemented coverage summary. |

## Main execution paths

```text
npm run test:rest:all
  └─ Docker up → REST functional suite → REST performance suite → REST k6 HTML report

npm run test:grpc:all
  └─ Docker up → gRPC functional suite → gRPC performance suite → gRPC k6 HTML report

npm test
  └─ Playwright Chromium tests → playwright-report/
```

Useful commands:

```bash
docker compose up -d
npm run test:rest:all
npm run test:grpc:all
npx playwright show-report --port 9330
docker compose down
```

The k6 performance suites include a 15-minute soak scenario. Run them when that duration is acceptable; use the functional suites for a quick validation.

