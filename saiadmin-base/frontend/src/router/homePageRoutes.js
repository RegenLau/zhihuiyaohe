const homePageRoutes = [
  {
    id: 10,
    name: 'SmartDashboard',
    path: '/doctor/dashboard',
    meta: {
      title: '工作台',
      icon: 'ri:stethoscope-line',
      type: 'M',
      affix: true
    },
    component: () => import('@/views/smart-pillbox/dashboard/workbench/index.vue')
  },
  {
    id: 20,
    name: 'SmartPatientManagement',
    path: '/doctor/patient-management',
    redirect: '/doctor/patients',
    meta: {
      title: '患者管理',
      icon: 'ri:user-heart-line',
      type: 'M'
    },
    component: () => import('@/layout/empty.vue'),
    children: [
      {
        id: 21,
        name: 'SmartPatientFiles',
        path: '/doctor/patients',
        meta: {
          title: '患者档案',
          icon: 'ri:file-user-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/patient/list/index.vue')
      },
      {
        id: 22,
        name: 'SmartConversations',
        path: '/doctor/conversations',
        meta: {
          title: '对话记录',
          icon: 'ri:chat-history-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/conversation/record/index.vue')
      },
      {
        id: 23,
        name: 'SmartHealthData',
        path: '/doctor/health-data',
        meta: {
          title: '健康数据',
          icon: 'ri:pulse-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/health/data/index.vue')
      }
    ]
  },
  {
    id: 24,
    name: 'SmartPatientCreate',
    path: '/doctor/patient-create',
    meta: {
      title: '新增患者建档',
      icon: 'ri:user-add-line',
      type: 'M',
      activeMenu: 'SmartPatientFiles',
      hidden: true
    },
    component: () => import('@/views/smart-pillbox/patient/create/index.vue')
  },
  {
    id: 25,
    name: 'SmartPatientDetail',
    path: '/doctor/patient-detail',
    meta: {
      title: '患者详情',
      icon: 'ri:file-user-line',
      type: 'M',
      activeMenu: 'SmartPatientFiles',
      hidden: true
    },
    component: () => import('@/views/smart-pillbox/patient/detail/index.vue')
  },
  {
    id: 30,
    name: 'SmartMedication',
    path: '/doctor/medication',
    meta: {
      title: '用药管理',
      icon: 'ri:medicine-bottle-line',
      type: 'M'
    },
    component: () => import('@/layout/empty.vue'),
    children: [
      {
        id: 31,
        name: 'SmartPlans',
        path: '/doctor/plans',
        meta: {
          title: '用药计划',
          icon: 'ri:calendar-check-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/medication/plan/index.vue')
      },
      {
        id: 32,
        name: 'SmartTasks',
        path: '/doctor/tasks',
        meta: {
          title: '服药任务',
          icon: 'ri:checkbox-circle-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/medication/task/index.vue')
      },
      {
        id: 33,
        name: 'SmartMessages',
        path: '/doctor/messages',
        meta: {
          title: '提醒消息',
          icon: 'ri:notification-3-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/message/reminder/index.vue')
      }
    ]
  },
  {
    id: 40,
    name: 'SmartDeviceRecords',
    path: '/doctor/device-records',
    meta: {
      title: '设备记录',
      icon: 'ri:device-line',
      type: 'M'
    },
    component: () => import('@/layout/empty.vue'),
    children: [
      {
        id: 41,
        name: 'SmartDevices',
        path: '/doctor/devices',
        meta: {
          title: '设备管理',
          icon: 'ri:device-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/device/manage/index.vue')
      }
    ]
  },
  {
    id: 50,
    name: 'SmartSettings',
    path: '/doctor/settings',
    redirect: '/doctor/settings/consent',
    meta: {
      title: '系统设置',
      icon: 'ri:settings-3-line',
      type: 'M'
    },
    component: () => import('@/layout/empty.vue'),
    children: [
      {
        id: 51,
        name: 'SmartConsentSettings',
        path: '/doctor/settings/consent',
        meta: {
          title: '知情同意书设置',
          icon: 'ri:file-shield-2-line',
          type: 'M'
        },
        component: () => import('@/views/smart-pillbox/system/settings/index.vue')
      }
    ]
  }
]

export const homePage = {
  id: 1,
  name: 'home',
  path: '/home',
  meta: { title: '首页', icon: 'icon-home', hidden: false, type: 'M' }
}

export default homePageRoutes
