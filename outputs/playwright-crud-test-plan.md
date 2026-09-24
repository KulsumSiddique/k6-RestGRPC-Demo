# QuickPizza Playwright CRUD Test Plan

## Goal

Validate authentication and pizza-rating CRUD behavior with isolated disposable users and without mutating shared data.

## Implemented

- Valid and invalid login coverage.
- Isolated disposable user setup through `POST /api/users`; no shared credentials.
- Authenticated ratings read and empty-state coverage.
- API rating lifecycle:
  - `POST /api/ratings`
  - `GET /api/ratings/{id}`
  - `PUT /api/ratings/{id}`
  - `DELETE /api/ratings/{id}`
- Safe refresh behavior and API contract checks.
- Destructive `Clear Ratings` control is verified but never clicked.
- Page objects, typed API clients, Zod response schemas, data factories, and reusable auth setup.
- Tagged API/UI/regression/negative/destructive coverage, health checks, and accessibility checks.
- Chromium test execution, HTML/JUnit reporting, TypeScript validation, linting, formatting, and GitHub Actions CI.
- Local QuickPizza Docker environment with REST on `localhost:8080` and gRPC on `localhost:5051`.
- k6 REST and gRPC functional suites, short combined performance suites, and dedicated load, stress, soak, spike, breakpoint, and synthetic profiles.
- k6 JSON summary export and generated dashboard-style HTML reports in `test-results/k6/`.
- Playwright browser-performance baseline measuring navigation, DOM-content-loaded, and page-load timing.

## Validation

```bash
npm install
npx playwright install
npm run typecheck
npm test
npm run test:smoke
npm run test:api
npm run test:ui:cases
npm run test:regression
npm run lint
npm run format:check
```

The current default suite passes 14 Chromium tests with disposable test data. `npm run test:cross-browser` runs the configured suite across Chromium, Firefox, and mobile WebKit.

For the local Docker and k6 workflows:

```bash
docker compose up -d
npm run test:rest:all
npm run test:grpc:all
docker compose down
```

## Known limitation

The public UI does not expose rating create or update controls, so those flows are covered at the API level only. Full UI CRUD, permissions, accessibility, visual, and multi-browser regression coverage would require a richer or self-hosted test environment. Distributed and large-scale k6 execution are not included; the current performance profiles run locally.
