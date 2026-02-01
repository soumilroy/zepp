# Zepp.ai Monorepo

This repository contains the FastAPI backend (`app/`) and the Vite/React frontend (`web/`).

## Local development with Docker

Both apps can be run without installing Python or Node locally.

```bash
docker compose up --build
```

This spins up:

- **backend** – FastAPI + Uvicorn with autoreload on port `8000`.
- **frontend** – Vite dev server with React Query + Tailwind on port `5173`.

### Volumes & hot reload

- `./app` and `./web` are bind-mounted into their containers, so edits on your host trigger reloads.
- A named Docker volume (`frontend_node_modules`) stores frontend dependencies so they don’t clutter the host machine.

### Environment variables

- `VITE_API_URL` defaults to `http://localhost:8000`. Override it by creating `web/.env` or editing `docker-compose.yml`.
- The backend continues to use `sqlite:///./app.db`; because the repo folder is mounted, the database file stays on the host.

### Useful commands

```bash
# Rebuild after dependency changes
docker compose build

# Run backend + frontend tests in Docker
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Stop services
docker compose down
```

Logs stream to your terminal; press `Ctrl+C` to stop everything.
