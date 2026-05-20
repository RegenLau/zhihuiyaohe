# API Contracts

## Response Envelope

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## Auth And App Bootstrap

```txt
GET  /health
GET  /core/captcha
POST /core/login
GET  /core/system/user
GET  /core/system/dictAll
GET  /core/system/menu
```

## Future Product Modules

```txt
frontend/src/views/plugin/t2/api/{module}.ts
frontend/src/views/plugin/t2/{module}/index.vue
frontend/src/views/plugin/t2/{module}/modules/
```
