import { AppRouteRecord } from '@/types/router'

type SmartPillboxRouteConfig = {
  path: string
  name: string
  title: string
  icon: string
  component: string
  keepAlive?: boolean
}

const createSmartPillboxRoute = ({
  path,
  name,
  title,
  icon,
  component,
  keepAlive = true
}: SmartPillboxRouteConfig): AppRouteRecord => ({
  path,
  name: `${name}Menu`,
  component: '/index/index',
  meta: {
    title,
    icon
  },
  children: [
    {
      path: '',
      name,
      component,
      meta: {
        title,
        isHide: true,
        keepAlive
      }
    }
  ]
})

export const smartPillboxRoutes: AppRouteRecord[] = [
  createSmartPillboxRoute({
    path: '/doctor/dashboard',
    name: 'SmartPillboxWorkbench',
    title: '工作台',
    icon: 'ri:stethoscope-line',
    component: '/smart-pillbox/dashboard/workbench'
  }),
  createSmartPillboxRoute({
    path: '/doctor/patients',
    name: 'SmartPillboxPatients',
    title: '患者管理',
    icon: 'ri:user-heart-line',
    component: '/smart-pillbox/patient/list'
  }),
  createSmartPillboxRoute({
    path: '/doctor/patient-create',
    name: 'SmartPillboxPatientCreate',
    title: '新增患者建档',
    icon: 'ri:user-add-line',
    component: '/smart-pillbox/patient/create',
    keepAlive: false
  }),
  createSmartPillboxRoute({
    path: '/doctor/plans',
    name: 'SmartPillboxPlans',
    title: '用药计划',
    icon: 'ri:calendar-check-line',
    component: '/smart-pillbox/medication/plan'
  }),
  createSmartPillboxRoute({
    path: '/doctor/tasks',
    name: 'SmartPillboxTasks',
    title: '服药任务',
    icon: 'ri:medicine-bottle-line',
    component: '/smart-pillbox/medication/task'
  }),
  createSmartPillboxRoute({
    path: '/doctor/devices',
    name: 'SmartPillboxDevices',
    title: '设备管理',
    icon: 'ri:device-line',
    component: '/smart-pillbox/device/manage'
  }),
  createSmartPillboxRoute({
    path: '/doctor/messages',
    name: 'SmartPillboxMessages',
    title: '提醒消息',
    icon: 'ri:notification-3-line',
    component: '/smart-pillbox/message/reminder'
  }),
  createSmartPillboxRoute({
    path: '/doctor/conversations',
    name: 'SmartPillboxConversations',
    title: '对话记录',
    icon: 'ri:chat-history-line',
    component: '/smart-pillbox/conversation/record'
  }),
  createSmartPillboxRoute({
    path: '/doctor/settings',
    name: 'SmartPillboxSettings',
    title: '系统设置',
    icon: 'ri:settings-3-line',
    component: '/smart-pillbox/system/settings'
  })
]
