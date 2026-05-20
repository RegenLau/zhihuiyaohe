import request from '@/utils/http'
import type { DashboardData } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/dashboard'

export default {
  read() {
    return request.get<DashboardData>({
      url: `${baseUrl}/read`
    })
  }
}
