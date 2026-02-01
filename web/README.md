# Zepp.ai Web

React + TypeScript frontend bootstrapped with Vite, Tailwind CSS, and TanStack Query.

## Getting started

```bash
cd web
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` (defaults to `http://localhost:8000`).

## Run frontend tests in Docker

From the repo root:

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit frontend-tests
```
