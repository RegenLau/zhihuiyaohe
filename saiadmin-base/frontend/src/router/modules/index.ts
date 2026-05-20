import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { smartPillboxRoutes } from './smartPillbox'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  ...smartPillboxRoutes
]
