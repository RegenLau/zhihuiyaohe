import request from '@/utils/http'
import type { ReminderMessage, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/message'

export interface MessageListParams extends SmartPillboxListParams {
  patient?: string
  type?: string
}

export default {
  list(params: MessageListParams) {
    return request.get<Api.Common.PaginatedResponse<ReminderMessage>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  read(id: number | string) {
    return request.get<ReminderMessage>({
      url: `${baseUrl}/read`,
      params: { id }
    })
  },
  save(params: Partial<ReminderMessage>) {
    return request.post<ReminderMessage>({
      url: `${baseUrl}/save`,
      data: params
    })
  },
  update(params: Partial<ReminderMessage>) {
    return request.put<ReminderMessage>({
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
