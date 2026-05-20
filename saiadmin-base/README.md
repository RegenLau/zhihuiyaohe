# T2 SaiAdmin Prototype

This project uses SaiAdmin v6 frontend as the admin shell and a local mock API for bootstrap endpoints.

## Structure

```txt
saiadmin/
  frontend/      SaiAdmin v6 frontend, configured for local mock API
  mock-api/      Express mock API scaffold
  docs/          Architecture notes and API contract placeholders
```

## Development

Install dependencies:

```bash
pnpm install:all
```

Start the mock API:

```bash
pnpm dev:mock
```

Start the frontend in another terminal:

```bash
pnpm dev:frontend
```

Frontend URL:

```txt
http://localhost:3006
```

Mock API URL:

```txt
http://127.0.0.1:3010
```

Demo login:

```txt
username: admin
password: any value
captcha: 1234
```
