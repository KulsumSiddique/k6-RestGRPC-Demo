# QuickPizza Playwright CRUD suite

## Quick start on a new device

Install Node.js/npm, Docker Desktop, and k6 first.

Clone and enter the repository:

```bash
git clone <repository-url>
cd crud-playwright
```

Install dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

Start the local QuickPizza services:

```bash
docker compose up -d
docker compose ps
```

The local ports are REST `localhost:8080` and gRPC `localhost:5051`.

Run Playwright tests and view the HTML report:

```bash
npm test
npx playwright show-report --port 9330
```

Open `http://localhost:9330` in a browser.

Run the complete REST and gRPC workflows, including performance tests and k6 HTML report generation:

```bash
npm run test:rest:all
npm run test:grpc:all
```

The k6 reports are generated at:

```text
test-results/k6/rest-performance.html
test-results/k6/grpc-performance.html
```

Stop the local services when finished:

```bash
docker compose down
```

## Architecture

```text
Playwright tests ───────────────┐
  browser/API/health/performance │
                                 ├── QuickPizza Docker service
k6 REST tests ─── localhost:8080 ┘
k6 gRPC tests ── localhost:5051
```

The repository has two test layers:

- Playwright validates browser behavior, authentication, UI/API flows, accessibility, health, and browser timing. Its HTML report is written to `playwright-report/`.
- k6 validates REST and gRPC behavior and performance. Its JSON summaries and generated HTML reports are written to `test-results/k6/`.

The local backend is defined in `docker-compose.yml` using the QuickPizza image. REST traffic is mapped from container port `3333` to host port `8080`; gRPC traffic is mapped from container port `3334` to host port `5051`.

The k6 functional suites are `rest/tests/suite.js` and `grpc/tests/suite.js`. The combined performance suites are `rest/tests/performance-suite.js` and `grpc/tests/performance-suite.js`; each includes load, stress, soak, spike, breakpoint, and synthetic scenarios. The current gRPC contract exposes unary `Status` and `RatePizza` methods; streaming is documented as unsupported.

## Setup

```bash
npm install
npx playwright install
```

The signed-in fixture creates a unique disposable user through the public API before logging in. No shared account or manually supplied credentials are required.

The framework uses page objects in `pages/`, typed API clients and Zod schemas in `api/`, reusable data factories in `test-data/`, and a Playwright setup project that reuses `playwright/.auth/user.json` when the public demo accepts the saved session. The fixture falls back to isolated browser-context login when the public demo rejects that token.

## Run

```bash
npm test
npm run test:parallel
npm run test:smoke
npm run test:api
npm run test:ui:cases
npm run test:regression
npm run test:cross-browser
npm run typecheck
npm run lint
npm run format:check
npx playwright test --project=chromium --headed
npm run report
```

## Run the local REST and gRPC API tests

The local test environment uses the QuickPizza Docker container. The Compose file maps:

- REST API: `localhost:8080`
- gRPC API: `localhost:5051`

Run the commands in this order from the project root:

1. Start Docker Desktop.

2. Start QuickPizza:

   ```bash
   docker compose up -d
   ```

3. Confirm both services are running:

   ```bash
   docker compose ps
   lsof -nP -iTCP:8080 -sTCP:LISTEN
   lsof -nP -iTCP:5051 -sTCP:LISTEN
   ```

4. Run the REST tests:

   ```bash
   k6 run rest/tests/ratings-crud.js
   k6 run rest/tests/negative.js
   ```

5. Run the gRPC test:

   ```bash
   k6 run grpc/tests/smoke.js
   ```

   Or run the complete gRPC suite with one command:

   ```bash
   k6 run grpc/tests/suite.js
   ```

   The streaming case records that streaming is not exposed by the current
   QuickPizza proto; the available RPCs are unary `Status` and `RatePizza`.

6. Run the complete REST suite with one command:

   ```bash
   k6 run rest/tests/suite.js
   ```

7. Stop the local service when finished:

   ```bash
   docker compose down
   ```

## Run performance tests

Run the functional suites first. Then run the combined performance suites while the Docker service is running:

```bash
k6 run rest/tests/performance-suite.js
k6 run grpc/tests/performance-suite.js
```

Each command runs all k6 performance scenarios in one execution: load, stress, soak, spike, breakpoint, and synthetic monitoring. The soak scenario runs for 15 minutes, so the overall command remains active until the soak scenario completes.

For browser timing:

```bash
BASE_URL=http://localhost:8080 npx playwright test tests/browser-performance.spec.ts --project=chromium
```

The combined performance commands include all scenarios. They are intentionally long-running because the soak scenario lasts 15 minutes. The individual scenario files remain available when you need to troubleshoot or run only one profile.

## View and export test reports

View the Playwright HTML report after running Playwright tests:

```bash
npm run report
```

Run the combined REST or gRPC performance suite and save the k6 summary as JSON:

```bash
mkdir -p test-results/k6
k6 run --summary-export=test-results/k6/rest-performance.json rest/tests/performance-suite.js
k6 run --summary-export=test-results/k6/grpc-performance.json grpc/tests/performance-suite.js
```

Convert k6 JSON summaries into browser-viewable HTML reports:

```bash
npm run report:k6 -- test-results/k6/rest-performance.json
npm run report:k6 -- test-results/k6/grpc-performance.json
```

The HTML files are created next to their JSON source files.

Inspect a saved k6 summary from the terminal:

```bash
less test-results/k6/rest-performance.json
less test-results/k6/grpc-performance.json
```

k6 also prints the live summary directly in the terminal. The Playwright report is written to `playwright-report/`, and k6 summaries are written to `test-results/k6/`.

The local environment is the default. You can also select it explicitly with `TEST_ENV=local`.
If the API tests report `connection refused`, start the Docker service before rerunning them.

Use `TEST_ENV=staging` or `TEST_ENV=prod` with a matching `.env.staging` or `.env.prod` file. `.env.*.example` files show the required shape without containing credentials.

The current public demo exposes authenticated pizza ratings and a `Clear Ratings` control. The suite verifies the destructive control without clicking it. Disposable users normally have no ratings, so the collection test accepts either ratings or `No ratings yet`. The refresh test requires the disposable session to survive reload; session loss is treated as a failure because it indicates broken authentication persistence.

The suite covers rating create, read, update, and delete through the authenticated API using disposable data created by the current test. It also includes health, accessibility, negative-login, boundary, tagging, lint, formatting, and CI artifact checks. No create/update rating UI was exposed by the observed authenticated page, so those UI flows remain a discovery gap.
