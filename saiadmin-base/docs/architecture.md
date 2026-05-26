# Architecture

## Goal

Set up the SaiAdmin 5.x frontend and local mock API foundation before product modules are defined.

## Decisions

- SaiAdmin 5.x is used as the frontend base.
- `VITE_ACCESS_MODE` is set to `frontend`.
- Product pages should live under `frontend/src/views/smart-pillbox`.
- Future pages should call API modules only.
- Mock API uses SaiAdmin-style response envelopes.
- System management modules are hidden from the frontend route registry.

## Frontend Modules

```txt
frontend/src/views/smart-pillbox/
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
