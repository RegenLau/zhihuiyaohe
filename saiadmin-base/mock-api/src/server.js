import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import {
  agreement,
  conversations,
  dashboard,
  devices,
  messages,
  patients,
  plans,
  tasks
} from './smartPillboxData.js'

const app = express()
const port = Number(process.env.PORT || 3010)

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

const ok = (data = {}, message = 'success') => ({ code: 200, message, data })

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const paginate = (records, query = {}) => {
  const current = toNumber(query.page ?? query.current, 1)
  const size = toNumber(query.limit ?? query.size, 10)
  const start = (current - 1) * size
  return {
    records: records.slice(start, start + size),
    total: records.length,
    current,
    size
  }
}

const includesKeyword = (keyword, values) => {
  if (!keyword) return true
  return values.some((value) => String(value ?? '').includes(String(keyword)))
}

const findById = (records, id) => records.find((item) => String(item.id) === String(id))

const saveRecord = (records, body) => {
  const id = records.length ? Math.max(...records.map((item) => Number(item.id) || 0)) + 1 : 1
  const record = { id, ...body }
  records.unshift(record)
  return record
}

const updateRecord = (records, body) => {
  const index = records.findIndex((item) => String(item.id) === String(body.id))
  if (index < 0) return body
  records[index] = { ...records[index], ...body }
  return records[index]
}

const deleteRecords = (records, body) => {
  const ids = new Set((body.ids || []).map((id) => String(id)))
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (ids.has(String(records[index].id))) {
      records.splice(index, 1)
    }
  }
}

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
      dashboard: '/doctor/dashboard',
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

app.get('/app/smart-pillbox/admin/doctor/dashboard/read', (req, res) => {
  res.json(ok(dashboard))
})

app.get('/app/smart-pillbox/admin/doctor/patient/list', (req, res) => {
  const { keyword, deviceStatus, consent } = req.query
  const records = patients.filter((item) => {
    const keywordMatched = includesKeyword(keyword, [item.name, item.phone, item.recordNo])
    const deviceMatched = !deviceStatus || item.deviceStatus === deviceStatus
    const consentMatched = !consent || item.consent === consent
    return keywordMatched && deviceMatched && consentMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/patient/read', (req, res) => {
  res.json(ok(findById(patients, req.query.id) || patients[0]))
})

app.post('/app/smart-pillbox/admin/doctor/patient/save', (req, res) => {
  res.json(ok(saveRecord(patients, req.body), 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/patient/update', (req, res) => {
  res.json(ok(updateRecord(patients, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/patient/delete', (req, res) => {
  deleteRecords(patients, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/device/list', (req, res) => {
  const { sn, status } = req.query
  const records = devices.filter((item) => {
    const snMatched = includesKeyword(sn, [item.sn, item.patient])
    const statusMatched = !status || item.status === status
    return snMatched && statusMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/device/read', (req, res) => {
  res.json(ok(findById(devices, req.query.id) || devices[0]))
})

app.post('/app/smart-pillbox/admin/doctor/device/save', (req, res) => {
  res.json(ok(saveRecord(devices, req.body), 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/device/update', (req, res) => {
  res.json(ok(updateRecord(devices, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/device/delete', (req, res) => {
  deleteRecords(devices, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/message/list', (req, res) => {
  const { patient, type } = req.query
  const records = messages.filter((item) => {
    const patientMatched = includesKeyword(patient, [item.patient, item.receiver])
    const typeMatched = !type || item.type === type
    return patientMatched && typeMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/message/read', (req, res) => {
  res.json(ok(findById(messages, req.query.id) || messages[0]))
})

app.post('/app/smart-pillbox/admin/doctor/message/save', (req, res) => {
  res.json(ok(saveRecord(messages, req.body), 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/message/update', (req, res) => {
  res.json(ok(updateRecord(messages, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/message/delete', (req, res) => {
  deleteRecords(messages, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/plan/list', (req, res) => {
  const { patientId, keyword } = req.query
  const records = plans.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const keywordMatched = includesKeyword(keyword, [item.title, item.code, item.source])
    return patientMatched && keywordMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/plan/read', (req, res) => {
  res.json(ok(findById(plans, req.query.id) || plans[0]))
})

app.post('/app/smart-pillbox/admin/doctor/plan/save', (req, res) => {
  res.json(ok(saveRecord(plans, req.body), 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/plan/update', (req, res) => {
  res.json(ok(updateRecord(plans, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/plan/delete', (req, res) => {
  deleteRecords(plans, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/task/list', (req, res) => {
  const { patientId, drug } = req.query
  const records = tasks.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const drugMatched = !drug || drug === '全部用药' || item.drug === drug
    return patientMatched && drugMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/task/read', (req, res) => {
  res.json(ok(findById(tasks, req.query.id) || tasks[0]))
})

app.put('/app/smart-pillbox/admin/doctor/task/update', (req, res) => {
  res.json(ok(updateRecord(tasks, req.body), 'updated'))
})

app.post('/app/smart-pillbox/admin/doctor/task/exportDaily', (req, res) => {
  res.json(ok(null, 'exported'))
})

app.get('/app/smart-pillbox/admin/doctor/conversation/list', (req, res) => {
  const { patientId, type, status } = req.query
  const records = conversations.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const typeMatched = !type || type.startsWith('全部') || item.type === type
    const statusMatched = !status || item.status === status
    return patientMatched && typeMatched && statusMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.post('/app/smart-pillbox/admin/doctor/conversation/export', (req, res) => {
  res.json(ok(null, 'exported'))
})

app.get('/app/smart-pillbox/admin/doctor/settings/read', (req, res) => {
  res.json(ok(agreement))
})

app.put('/app/smart-pillbox/admin/doctor/settings/update', (req, res) => {
  Object.assign(agreement, req.body)
  res.json(ok(agreement, 'updated'))
})

app.listen(port, () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`)
})
