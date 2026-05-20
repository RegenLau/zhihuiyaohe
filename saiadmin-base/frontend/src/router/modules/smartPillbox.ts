import { AppRouteRecord } from '@/types/router'

type SmartPillboxRouteConfig = {
  path: string
  name: string
  title: string
  icon: string
  component: string
  keepAlive?: boolean
  isHide?: boolean
  activePath?: string
}

const createSmartPillboxRoute = ({
  path,
  name,
  title,
  icon,
  component,
  keepAlive = true,
  isHide = false,
  activePath
}: SmartPillboxRouteConfig): AppRouteRecord => ({
  path,
  name: `${name}Menu`,
  component: '/index/index',
  meta: {
    title,
    icon,
    isHide,
    activePath
  },
  children: [
    {
      path: '',
      name,
      component,
      meta: {
        title,
        isHide: true,
        keepAlive,
        activePath
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
    keepAlive: false,
    isHide: true,
    activePath: '/doctor/patients'
  }),
  {
    path: '/doctor/medication',
    name: 'SmartPillboxMedication',
    component: '/index/index',
    meta: {
      title: '用药管理',
      icon: 'ri:medicine-bottle-line'
    },
    children: [
      {
        path: '/doctor/plans',
        name: 'SmartPillboxPlans',
        component: '/smart-pillbox/medication/plan',
        meta: {
          title: '用药计划',
          icon: 'ri:calendar-check-line',
          keepAlive: true
        }
      },
      {
        path: '/doctor/tasks',
        name: 'SmartPillboxTasks',
        component: '/smart-pillbox/medication/task',
        meta: {
          title: '服药任务',
          icon: 'ri:medicine-bottle-line',
          keepAlive: true
        }
      },
      {
        path: '/doctor/messages',
        name: 'SmartPillboxMessages',
        component: '/smart-pillbox/message/reminder',
        meta: {
          title: '提醒消息',
          icon: 'ri:notification-3-line',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/doctor/device-records',
    name: 'SmartPillboxDeviceRecords',
    component: '/index/index',
    meta: {
      title: '设备记录',
      icon: 'ri:device-line'
    },
    children: [
      {
        path: '/doctor/devices',
        name: 'SmartPillboxDevices',
        component: '/smart-pillbox/device/manage',
        meta: {
          title: '设备管理',
          icon: 'ri:device-line',
          keepAlive: true
        }
      },
      {
        path: '/doctor/conversations',
        name: 'SmartPillboxConversations',
        component: '/smart-pillbox/conversation/record',
        meta: {
          title: '对话记录',
          icon: 'ri:chat-history-line',
          keepAlive: true
        }
      }
    ]
  },
  createSmartPillboxRoute({
    path: '/doctor/settings',
    name: 'SmartPillboxSettings',
    title: '系统设置',
    icon: 'ri:settings-3-line',
    component: '/smart-pillbox/system/settings'
  })
]
