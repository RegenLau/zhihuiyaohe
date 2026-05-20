import request from '@/utils/http'
import type { MedicationTask, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/task'

export interface TaskListParams extends SmartPillboxListParams {
  patientId?: number
  taskDate?: string
  drug?: string
}

export default {
  list(params: TaskListParams) {
    return request.get<Api.Common.PaginatedResponse<MedicationTask>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  read(id: number | string) {
    return request.get<MedicationTask>({
      url: `${baseUrl}/read`,
      params: { id }
    })
  },
  update(params: Partial<MedicationTask>) {
    return request.put<MedicationTask>({
      url: `${baseUrl}/update`,
      data: params
    })
  },
  exportDaily(params: TaskListParams) {
    return request.post<void>({
      url: `${baseUrl}/exportDaily`,
      data: params
    })
  }
}
