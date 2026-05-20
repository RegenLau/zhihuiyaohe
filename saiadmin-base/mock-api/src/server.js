import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

const app = express()
const port = Number(process.env.PORT || 3010)

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

const ok = (data = {}, message = 'success') => ({ code: 200, message, data })

function captchaImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="36"><rect width="96" height="36" fill="#f5f7fa"/><text x="18" y="24" font-family="Arial" font-size="18" fill="#1d4ed8">1234</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

app.get('/core/captcha', (req, res) => {
  res.json(ok({ result: 1, uuid: 'mock-captcha', image: captchaImage() }))
})

app.post('/core/login', (req, res) => {
  res.json(
    ok({
      token_type: 'Bearer',
      expires_in: 28800,
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token'
    })
  )
})

app.get('/health', (req, res) => {
  res.json(ok({ status: 'ok' }))
})

app.get('/core/system/user', (req, res) => {
  res.json(
    ok({
      id: 1,
      username: 'admin',
      realname: 'Demo Admin',
      email: 'admin@example.com',
      phone: '13800000000',
      avatar: '',
      roles: ['R_ADMIN'],
      buttons: ['*'],
      dashboard: '/dashboard/console',
      department: {
        id: 1,
        name: 'Demo Team'
      }
    })
  )
})

app.get('/core/system/dictAll', (req, res) => {
  res.json(
    ok({
      data_status: [
        { id: 1, label: 'Enabled', value: 1, color: '#22c55e' },
        { id: 2, label: 'Disabled', value: 2, color: '#94a3b8' }
      ],
      dashboard: [
        { id: 1, label: 'Console', value: '/dashboard/console', color: '#3b82f6' }
      ]
    })
  )
})

app.get('/core/system/menu', (req, res) => {
  res.json(ok([]))
})

app.listen(port, () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`)
})
