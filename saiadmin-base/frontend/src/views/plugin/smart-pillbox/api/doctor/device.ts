import request from '@/utils/http'
import type { Device, SmartPillboxListParams } from './types'

const baseUrl = '/app/smart-pillbox/admin/doctor/device'

export interface DeviceListParams extends SmartPillboxListParams {
  status?: string
  sn?: string
}

export default {
  list(params: DeviceListParams) {
    return request.get<Api.Common.PaginatedResponse<Device>>({
      url: `${baseUrl}/list`,
      params
    })
  },
  read(id: number | string) {
    return request.get<Device>({
      url: `${baseUrl}/read`,
      params: { id }
    })
  },
  save(params: Partial<Device>) {
    return request.post<Device>({
      url: `${baseUrl}/save`,
      data: params
    })
  },
  update(params: Partial<Device>) {
    return request.put<Device>({
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
