# RugCheck AI Frontend

React + Vite frontend for the RugCheck AI crypto research terminal.

## Features
- Search by token symbol, project name, or EVM contract
- Calls the backend `/api/analyze` endpoint and renders normalized results
- Shows market structure, tokenomics, technicals, security checks, and final verdict
- Includes backend health status and quick search shortcuts

## Stack
- React 19
- Vite 8
- Plain JSX with inline styles

## Prerequisites
- Node.js 20+
- The backend running locally or deployed

## Environment Variables
Create a local `.env` file if you want to point the UI to a custom backend URL.

```env
VITE_API_BASE_URL=https://research-terminal-backend-production.up.railway.app
```

An example file is included as `.env.example`.

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Backend Connection
In production, point the frontend to the deployed Railway backend.

For local development, you can still use:

```env
VITE_API_BASE_URL=http://localhost:4000
```

For local development, make sure the backend `FRONTEND_URL` is set to `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Suggested GitHub Repo Name
`rugcheck-frontend`
