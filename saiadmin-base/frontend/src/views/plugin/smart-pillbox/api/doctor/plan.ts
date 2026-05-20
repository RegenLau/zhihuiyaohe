import request from '@/utils/http'
import type { Plan, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/plan'

export interface PlanListParams extends SmartPillboxListParams {
  patientId?: number
}

export default {
  list(params: PlanListParams) {
    return request.get<Api.Common.PaginatedResponse<Plan>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  read(id: number | string) {
    return request.get<Plan>({
      url: `${baseUrl}/read`,
      params: { id }
    })
  },
  save(params: Partial<Plan>) {
    return request.post<Plan>({
      url: `${baseUrl}/save`,
      data: params
    })
  },
  update(params: Partial<Plan>) {
    return request.put<Plan>({
      url: `${baseUrl}/update`,
      data: params
    })
  },
  delete(params: Record<string, any>) {
    return request.del<void>({
      url: `${baseUrl}/delete`,
      data: params
    })
  }
}
