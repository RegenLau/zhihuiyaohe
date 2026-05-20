import request from '@/utils/http'
import type { AgreementSettings } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/settings'

export default {
  read() {
    return request.get<AgreementSettings>({
      url: `${baseUrl}/read`
    })
  },
  update(params: AgreementSettings) {
    return request.put<AgreementSettings>({
      url: `${baseUrl}/update`,
      data: params
    })
  }
}
