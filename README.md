# Quantum Simulator

React/Vite frontend and FastAPI quantum simulator, with Circuit Builder, Shor's
algorithm, a Bloch sphere visualizer, Quantum Missions (PathFinder), and student
accounts with simulation history.

## Local development

Use Python 3.13 and Node 22.12+ (or a compatible newer Node version).

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a random value generated with
`python3 -c "import secrets; print(secrets.token_hex(32))"`.
An ignored `.env` with a generated secret is already present in the integration
workspace. Do not replace it if you want existing sessions to remain valid.

The local database defaults to SQLite (`quantum.db`). Start the API:

```sh
.venv/bin/python -m uvicorn api:app --reload
```

In another terminal:

```sh
cd quantum-frontend
npm ci
npm run dev
```

Open http://localhost:5173. The frontend proxies `/api` to localhost:8000.
Set `API_PROXY_TARGET` when running Vite against another backend port; an explicit
`VITE_API_URL` can instead select a different browser-accessible API URL.

## Accounts and access

Register through the header's **Sign In / Register** button. Guests can simulate
1–2 qubits; registered accounts can simulate up to 15 circuit qubits. The same
restriction applies to Quantum Missions: junctions requiring more than 2 qubits
prompt for sign-in and preserve the current mission. Visual Qubit remains usable
by guests. Signed-in activity from all simulation screens appears in the account
menu's simulation history.

Shor requires sign-in above 2 counting qubits, including its automatic setting.
Its total counting and work registers cannot exceed 20 qubits. History reports
Shor's counting-register size; circuit entries report the circuit size.

Accounts are self-registered; the student label does not verify university status.
Login records and simulation history are stored in the database. Sign-out clears
the browser session; issued tokens expire after seven days.

## Docker / PostgreSQL

With Docker Compose installed and `JWT_SECRET` set in `.env`:

```sh
docker compose up --build
```

The frontend is at localhost:5173, API at localhost:8000, and PostgreSQL at
localhost:5434. Compose supplies the PostgreSQL URL to the backend and the internal
backend proxy URL to Vite. PostgreSQL data persists in a named volume. Configure
`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_PORT` as needed.
The frontend container runs the development server. This is a development setup.

Docker installs dependencies from package registries instead of using the ZIP's
platform-specific wheels. `.env`, local databases, caches, and virtual environments
are excluded from version control and the backend build context.

## Checks

```sh
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m pytest test_auth_and_access.py test_shor.py -q
cd quantum-frontend
npm run build
npm test
npm run lint
```

Authentication tests use isolated in-memory databases. To include live quantum
API checks in the game tests, supply a token from a local test account:

```sh
TEST_SIMULATOR=http://127.0.0.1:8000 TEST_TOKEN=<local-test-token> npm test
```

## Integration notes

Integrated from `QuantumProject.zip` onto the newer `e8a4eb5` project, using
`53b0081` as a comparison baseline. Preserved the current frontend dependencies,
Circuit Builder, Shor results, Bloch sphere, PathFinder, theme, and workbench styles.
Imported accounts, persistence, usage history, access controls, and Docker support.
Account CSS is scoped so it does not replace existing result-panel styling.

Validation: 9 account/access tests, 10 existing quantum tests, and all 5 PathFinder
tests (including live API checks) passed; the production frontend build passed.
Browser checks covered guest circuit simulation, registration, authenticated Shor,
usage history, and logout. Docker/PostgreSQL runtime was not tested because Docker
is not installed here. The full lint command still reports existing unused React
imports and hook-rule issues in BlochSphere and QubitVisualizer.
