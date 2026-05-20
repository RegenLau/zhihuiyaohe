import request from '@/utils/http'
import type { Patient, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/patient'

export interface PatientListParams extends SmartPillboxListParams {
  deviceStatus?: string
}

export default {
  list(params: PatientListParams) {
    return request.get<Api.Common.PaginatedResponse<Patient>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  read(id: number | string) {
    return request.get<Patient>({
      url: `${baseUrl}/read`,
      params: { id }
    })
  },
  save(params: Partial<Patient>) {
    return request.post<Patient>({
      url: `${baseUrl}/save`,
      data: params
    })
  },
  update(params: Partial<Patient>) {
    return request.put<Patient>({
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
