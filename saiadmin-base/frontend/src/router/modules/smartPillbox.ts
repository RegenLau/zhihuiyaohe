import { AppRouteRecord } from '@/types/router'

export const smartPillboxRoutes: AppRouteRecord = {
  path: '/doctor',
  name: 'SmartPillboxDoctorAdmin',
  component: '/index/index',
  meta: {
    title: '智慧药盒后台',
    icon: 'ri:capsule-line'
  },
  children: [
    {
      path: 'dashboard',
      name: 'SmartPillboxWorkbench',
      component: '/smart-pillbox/dashboard/workbench',
      meta: { title: '医药师工作台', keepAlive: true }
    },
    {
      path: 'patients',
      name: 'SmartPillboxPatients',
      component: '/smart-pillbox/patient/list',
      meta: { title: '患者管理', keepAlive: true }
    },
    {
      path: 'patient-create',
      name: 'SmartPillboxPatientCreate',
      component: '/smart-pillbox/patient/create',
      meta: {
        title: '新增患者建档',
        keepAlive: false,
        activePath: '/doctor/patients'
      }
    },
    {
      path: 'plans',
      name: 'SmartPillboxPlans',
      component: '/smart-pillbox/medication/plan',
      meta: { title: '用药计划', keepAlive: true }
    },
    {
      path: 'tasks',
      name: 'SmartPillboxTasks',
      component: '/smart-pillbox/medication/task',
      meta: { title: '服药任务', keepAlive: true }
    },
    {
      path: 'devices',
      name: 'SmartPillboxDevices',
      component: '/smart-pillbox/device/manage',
      meta: { title: '设备管理', keepAlive: true }
    },
    {
      path: 'messages',
      name: 'SmartPillboxMessages',
      component: '/smart-pillbox/message/reminder',
      meta: { title: '提醒消息', keepAlive: true }
    },
    {
      path: 'conversations',
      name: 'SmartPillboxConversations',
      component: '/smart-pillbox/conversation/record',
      meta: { title: '对话记录', keepAlive: true }
    },
    {
      path: 'settings',
      name: 'SmartPillboxSettings',
      component: '/smart-pillbox/system/settings',
      meta: { title: '系统设置', keepAlive: true }
    }
  ]
}
