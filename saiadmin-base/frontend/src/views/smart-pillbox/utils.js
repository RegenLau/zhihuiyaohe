export const getRecords = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.data?.records)) return response.data.records
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.records)) return response.records
  return []
}

export const getPayload = (response) => response?.data || response || {}

export const pickQueryValue = (...values) => {
  for (const value of values.flat()) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return ''
}

export const formatDateTime = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}`
}

export const generatePatientNo = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `PAT-${date}-${time}`
}

export const calculateAge = (birthDate) => {
  const birthday = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(birthday.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age -= 1
  }
  return Math.max(age, 0)
}

export const statusColor = (status, fallback = 'gray') => {
  const colorMap = {
    success: 'green',
    danger: 'red',
    warning: 'orange',
    primary: 'arcoblue',
    info: 'gray',
    在线: 'green',
    离线: 'red',
    待分配: 'orange',
    未绑定: 'orange',
    已完成: 'green',
    待执行: 'orange',
    未打卡: 'red',
    漏服: 'red',
    待处理: 'orange',
    处理中: 'orange',
    已处理: 'green',
    已创建: 'green',
    待确认: 'orange',
    已生效: 'green',
    已停用: 'gray',
    未同意: 'red',
    已同意: 'green',
    成功: 'green',
    失败: 'red',
    正常: 'green',
    关注: 'orange',
    高风险: 'red',
    待人工跟进: 'orange',
    未响应: 'red',
    已归档: 'green',
    已确认: 'green'
  }
  return colorMap[status] || fallback
}

export const isBoundValue = (value) => Boolean(value && !['-', '待绑定', '未绑定'].includes(String(value)))

export const splitTags = (value) => {
  return String(value || '')
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export const unwrapAllergyNames = (allergies = []) => {
  return allergies
    .map((item) => (typeof item === 'string' ? item : item?.allergen))
    .filter(Boolean)
}
