import request from '@/utils/http'
import type { HealthRecord, HealthSummary, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/health'

export interface HealthListParams extends SmartPillboxListParams {
  patientId?: number | string
  dateRange?: string[]
  riskLevel?: string
}

export default {
  list(params: HealthListParams) {
    return request.get<Api.Common.PaginatedResponse<HealthRecord>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  summary(patientId: number | string) {
    return request.get<HealthSummary>({
      url: `${baseUrl}/summary`,
      params: { patientId }
    })
  }
}
