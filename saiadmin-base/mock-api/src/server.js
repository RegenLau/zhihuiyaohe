import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import {
  agreement,
  buildHealthSummary,
  consentRecords,
  conversations,
  dashboard,
  deviceEvents,
  devices,
  healthRecords,
  medicationRecords,
  messages,
  ocrRecords,
  patients,
  planDispatchRecords,
  plans,
  prescriptionAttachments,
  shortageReports,
  syncPatientDerivedData,
  tasks
} from './smartPillboxData.js'

const app = express()
const port = Number(process.env.PORT || 3010)

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

const ok = (data = {}, message = 'success') => ({ code: 200, message, data })

const formatNow = () => {
  const pad = (value) => String(value).padStart(2, '0')
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`
}

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

const shortageStatusType = (status) => {
  if (status === '已处理') return 'success'
  if (status === '处理中') return 'warning'
  return 'danger'
}

const isBoundValue = (value) => Boolean(value && !['待绑定', '未绑定'].includes(String(value)))

const matchesBindStatus = (value, bindStatus) => {
  if (!bindStatus) return true
  return bindStatus === 'bound' ? isBoundValue(value) : !isBoundValue(value)
}

const findById = (records, id) => records.find((item) => String(item.id) === String(id))

const saveRecord = (records, body) => {
  const id = records.length ? Math.max(...records.map((item) => Number(item.id) || 0)) + 1 : 1
  const record = { ...body, id: body.id ?? id }
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

const mockRecognizedDrugs = [
  {
    name: '硝苯地平控释片',
    specification: '30mg',
    quantity: '1盒',
    dose: '1片/次',
    frequency: '每日1次',
    time: '早餐前',
    durationDays: 30,
    guide: '整片吞服，关注血压变化。'
  },
  {
    name: '二甲双胍缓释片',
    specification: '500mg',
    quantity: '2盒',
    dose: '1片/次',
    frequency: '每日2次',
    time: '早餐时/晚餐时',
    durationDays: 30,
    guide: '随餐服用，关注胃肠道反应。'
  }
]

const listByQuery = (records, query, fields = []) => {
  const { patientId, keyword, status, sn, planId } = query
  return records.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const statusMatched = !status || item.status === status
    const snMatched = !sn || item.sn === sn || item.deviceNo === sn
    const planMatched = !planId || String(item.planId) === String(planId)
    const keywordMatched = includesKeyword(keyword, fields.map((field) => item[field]))
    return patientMatched && statusMatched && snMatched && planMatched && keywordMatched
  })
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
  const { keyword, deviceBindStatus, childBindStatus } = req.query
  const records = patients.filter((item) => {
    const keywordMatched = includesKeyword(keyword, [item.name, item.phone])
    const deviceMatched = matchesBindStatus(item.deviceStatus, deviceBindStatus)
    const childMatched = matchesBindStatus(item.child, childBindStatus)
    return keywordMatched && deviceMatched && childMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/patient/read', (req, res) => {
  res.json(ok(findById(patients, req.query.id) || patients[0]))
})

app.get('/app/smart-pillbox/admin/doctor/patient/medicineRecords', (req, res) => {
  const { id, date } = req.query
  const records = medicationRecords.filter((item) => {
    const patientMatched = !id || String(item.patientId) === String(id)
    const dateMatched = !date || String(item.time).startsWith(String(date))
    return patientMatched && dateMatched
  })
  res.json(ok(records))
})

app.get('/app/smart-pillbox/admin/doctor/patient/consent/list', (req, res) => {
  const records = listByQuery(consentRecords, req.query, ['patient', 'version', 'confirmTerminal'])
  res.json(ok(paginate(records, req.query)))
})

app.post('/app/smart-pillbox/admin/doctor/patient/save', (req, res) => {
  const record = saveRecord(patients, req.body)
  if (record.consent === '已同意') {
    saveRecord(consentRecords, {
      patientId: record.id,
      patient: record.name,
      version: agreement.version,
      confirmTime: formatNow(),
      confirmTerminal: '后台建档确认',
      status: '已同意',
      statusType: 'success'
    })
  }
  syncPatientDerivedData(record)
  res.json(ok(record, 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/patient/update', (req, res) => {
  const record = updateRecord(patients, req.body)
  syncPatientDerivedData(record)
  res.json(ok(record, 'updated'))
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

app.get('/app/smart-pillbox/admin/doctor/device/event/list', (req, res) => {
  const records = listByQuery(deviceEvents, req.query, ['patient', 'sn', 'eventType', 'medicine', 'note'])
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/device/dispatch/list', (req, res) => {
  const records = listByQuery(planDispatchRecords, req.query, ['patient', 'deviceNo', 'planTitle', 'failReason'])
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/message/list', (req, res) => {
  const { patient, type, status, keyword } = req.query
  const records = messages.filter((item) => {
    const patientMatched = includesKeyword(patient, [item.patient, item.receiver])
    const typeMatched = !type || item.type === type
    const statusMatched = !status || item.status === status
    const keywordMatched = includesKeyword(keyword, [item.title, item.content, item.triggerScene, item.triggerSource, item.creationMode, item.creator])
    return patientMatched && typeMatched && statusMatched && keywordMatched
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
  const record = updateRecord(plans, req.body)
  if (String(req.body.dispatchStatus || '').includes('已下发')) {
    const patient = findById(patients, req.body.patientId)
    saveRecord(planDispatchRecords, {
      planId: req.body.id,
      planTitle: req.body.title,
      patientId: req.body.patientId,
      patient: req.body.patientName || patient?.name || '-',
      deviceNo: patient?.deviceNo || '-',
      status: '成功',
      statusType: 'success',
      dispatchTime: formatNow(),
      retryStatus: '无需重试',
      failReason: ''
    })
  }
  res.json(ok(record, 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/plan/delete', (req, res) => {
  deleteRecords(plans, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/plan/attachment/list', (req, res) => {
  const records = listByQuery(prescriptionAttachments, req.query, ['patient', 'fileName', 'fileType', 'ocrStatus'])
  res.json(ok(paginate(records, req.query)))
})

app.post('/app/smart-pillbox/admin/doctor/plan/attachment/save', (req, res) => {
  res.json(ok(saveRecord(prescriptionAttachments, req.body), 'saved'))
})

app.delete('/app/smart-pillbox/admin/doctor/plan/attachment/delete', (req, res) => {
  deleteRecords(prescriptionAttachments, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/plan/ocr/list', (req, res) => {
  const records = listByQuery(ocrRecords, req.query, ['patient', 'fileName', 'fileType', 'operator'])
  res.json(ok(paginate(records, req.query)))
})

app.post('/app/smart-pillbox/admin/doctor/plan/ocr/save', (req, res) => {
  const patient = findById(patients, req.body.patientId)
  const record = saveRecord(ocrRecords, {
    patientId: req.body.patientId,
    patient: patient?.name || req.body.patient || '-',
    fileName: req.body.fileName,
    fileType: req.body.fileType || '处方照片',
    status: '待确认',
    statusType: 'warning',
    confidence: req.body.confidence || 91,
    createdAt: formatNow(),
    confirmedAt: '',
    operator: req.body.operator || '医药师',
    correctionNote: req.body.correctionNote || '请人工确认药品、剂量、频次和提醒时间',
    recognizedDrugs: req.body.recognizedDrugs?.length ? req.body.recognizedDrugs : mockRecognizedDrugs
  })
  res.json(ok(record, 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/plan/ocr/update', (req, res) => {
  res.json(ok(updateRecord(ocrRecords, req.body), 'updated'))
})

app.get('/app/smart-pillbox/admin/doctor/task/list', (req, res) => {
  const { patientId, drug, status, taskDate } = req.query
  const records = tasks.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const drugMatched = !drug || drug === '全部用药' || item.drug === drug
    const statusMatched = !status || status === '全部状态' || item.status === status
    const dateMatched = !taskDate || item.taskDate === taskDate
    return patientMatched && drugMatched && statusMatched && dateMatched
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

app.get('/app/smart-pillbox/admin/doctor/conversation/read', (req, res) => {
  res.json(ok(findById(conversations, req.query.id) || conversations[0]))
})

app.post('/app/smart-pillbox/admin/doctor/conversation/export', (req, res) => {
  res.json(ok(null, 'exported'))
})

app.put('/app/smart-pillbox/admin/doctor/conversation/update', (req, res) => {
  res.json(ok(updateRecord(conversations, req.body), 'updated'))
})

app.put('/app/smart-pillbox/admin/doctor/conversation/review', (req, res) => {
  res.json(
    ok(
      updateRecord(conversations, {
        ...req.body,
        status: '已闭环',
        statusType: 'success',
        reviewStatus: '已复核',
        reviewedAt: formatNow()
      }),
      'reviewed'
    )
  )
})

app.get('/app/smart-pillbox/admin/doctor/health/list', (req, res) => {
  const { patientId, keyword, riskLevel } = req.query
  const records = healthRecords.filter((item) => {
    const patientMatched = !patientId || String(item.patientId) === String(patientId)
    const keywordMatched = includesKeyword(keyword, [item.patient])
    const riskMatched = !riskLevel || item.riskLevel === riskLevel
    return patientMatched && keywordMatched && riskMatched
  })
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/health/summary', (req, res) => {
  res.json(ok(buildHealthSummary(req.query.patientId)))
})

app.post('/app/smart-pillbox/admin/doctor/health/save', (req, res) => {
  const patient = findById(patients, req.body.patientId)
  res.json(ok(saveRecord(healthRecords, { patient: patient?.name || req.body.patient || '-', source: '后台创建', ...req.body }), 'saved'))
})

app.put('/app/smart-pillbox/admin/doctor/health/update', (req, res) => {
  res.json(ok(updateRecord(healthRecords, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/health/delete', (req, res) => {
  deleteRecords(healthRecords, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/shortage/list', (req, res) => {
  const records = listByQuery(shortageReports, req.query, ['patient', 'medicine', 'source', 'triggerScene', 'result'])
  res.json(ok(paginate(records, req.query)))
})

app.get('/app/smart-pillbox/admin/doctor/shortage/read', (req, res) => {
  res.json(ok(findById(shortageReports, req.query.id) || shortageReports[0]))
})

app.post('/app/smart-pillbox/admin/doctor/shortage/save', (req, res) => {
  const patient = findById(patients, req.body.patientId)
  res.json(
    ok(
      saveRecord(shortageReports, {
        patient: patient?.name || req.body.patient || '-',
        source: '后台创建',
        triggerScene: '后台补录',
        status: req.body.status || '待处理',
        statusType: shortageStatusType(req.body.status || '待处理'),
        reportTime: formatNow(),
        handler: req.body.status === '待处理' ? '' : req.body.handler || '医药师',
        ...req.body
      }),
      'saved'
    )
  )
})

app.put('/app/smart-pillbox/admin/doctor/shortage/update', (req, res) => {
  res.json(ok(updateRecord(shortageReports, req.body), 'updated'))
})

app.delete('/app/smart-pillbox/admin/doctor/shortage/delete', (req, res) => {
  deleteRecords(shortageReports, req.body)
  res.json(ok(null, 'deleted'))
})

app.get('/app/smart-pillbox/admin/doctor/settings/read', (req, res) => {
  res.json(ok(agreement))
})

app.put('/app/smart-pillbox/admin/doctor/settings/update', (req, res) => {
  Object.assign(agreement, req.body)
  agreement.updatedAt = formatNow()
  res.json(ok(agreement, 'updated'))
})

app.listen(port, () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`)
})
