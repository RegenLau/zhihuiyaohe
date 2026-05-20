import request from '@/utils/http'
import type { Conversation, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/conversation'

export interface ConversationListParams extends SmartPillboxListParams {
  patientId?: number
  type?: string
  status?: string
}

export default {
  list(params: ConversationListParams) {
    return request.get<Api.Common.PaginatedResponse<Conversation>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  export(params: ConversationListParams) {
    return request.post<void>({
      url: `${baseUrl}/export`,
      data: params
    })
  }
}
