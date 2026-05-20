# Architecture

## Goal

Set up the SaiAdmin v6 frontend and local mock API foundation before product modules are defined.

## Decisions

- SaiAdmin v6 is used as the frontend base.
- `VITE_ACCESS_MODE` is set to `frontend`.
- Future product pages should live under `frontend/src/views/plugin/t2`.
- Future pages should call API modules only.
- Mock API uses SaiAdmin-style response envelopes.
- System management modules are hidden from the frontend route registry.

## Frontend Modules

```txt
frontend/src/views/plugin/t2/
  api/
  modules/
```

## Mock API

```txt
mock-api/
  src/server.js
  data/db.json
```

The mock server currently contains only bootstrap endpoints. Product endpoints can be added after page and field scope is confirmed.

## Handoff Rule

When backend development starts, keep the frontend API module names and response shape stable. Backend work should replace mock endpoints with real controllers, services, models, and database tables.
