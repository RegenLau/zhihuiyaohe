import { request } from '@/utils/request.js'

const doctorBase = '/app/smart-pillbox/admin/doctor'

const normalizePage = (response) => {
  const page = response?.data || {}
  const records = Array.isArray(page.records) ? page.records : Array.isArray(page) ? page : []
  return {
    ...response,
    data: {
      data: records.map(normalizeRecord),
      total: Number(page.total ?? records.length)
    }
  }
}

const normalizeRecord = (record) => {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      Array.isArray(value) && value.every((item) => typeof item === 'string') ? value.join('、') : value
    ])
  )
}

const crud = (name) => {
  const baseUrl = `${doctorBase}/${name}`
  return {
    async list(params = {}) {
      return normalizePage(
        await request({
          url: `${baseUrl}/list`,
          method: 'get',
          params
        })
      )
    },
    read(id) {
      return request({
        url: `${baseUrl}/read`,
        method: 'get',
        params: { id }
      })
    },
    save(data = {}) {
      return request({
        url: `${baseUrl}/save`,
        method: 'post',
        data
      })
    },
    update(data = {}) {
      return request({
        url: `${baseUrl}/update`,
        method: 'put',
        data
      })
    },
    delete(data = {}) {
      return request({
        url: `${baseUrl}/delete`,
        method: 'delete',
        data
      })
    }
  }
}

export const dashboardApi = {
  read() {
    return request({
      url: `${doctorBase}/dashboard/read`,
      method: 'get'
    })
  }
}

export const patientApi = {
  ...crud('patient'),
  medicineRecords(id, date) {
    return request({
      url: `${doctorBase}/patient/medicineRecords`,
      method: 'get',
      params: { id, date }
    })
  }
}

export const deviceApi = crud('device')
export const messageApi = crud('message')
export const planApi = crud('plan')
export const shortageApi = crud('shortage')
export const ocrApi = {
  ...crud('plan/ocr')
}

export const taskApi = crud('task')

export const conversationApi = {
  ...crud('conversation'),
  review(data = {}) {
    return request({
      url: `${doctorBase}/conversation/review`,
      method: 'put',
      data
    })
  }
}

export const healthApi = crud('health')

export const settingsApi = {
  read() {
    return request({
      url: `${doctorBase}/settings/read`,
      method: 'get'
    })
  },
  update(data = {}) {
    return request({
      url: `${doctorBase}/settings/update`,
      method: 'put',
      data
    })
  }
}
