export const patients = [
  {
    id: 1,
    name: '王秀兰',
    gender: '女',
    age: 72,
    recordNo: 'MR-001',
    phone: '138****0921',
    diseases: ['高血压', '糖尿病'],
    deviceNo: 'PBX-202605-018',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '女儿 王敏 137****8091',
    nextReminder: '20:30',
    todayDrugs: 2,
    recentInteraction: '05/20 14:08',
    completionRate: 58,
    taskRisk: '漏服 2 次'
  },
  {
    id: 2,
    name: '张建国',
    gender: '男',
    age: 69,
    recordNo: 'MR-002',
    phone: '139****2206',
    diseases: ['冠心病', '高血压'],
    deviceNo: 'PBX-202605-006',
    deviceStatus: '离线',
    deviceStatusType: 'danger',
    consent: '已同意',
    child: '儿子 张磊 136****7760',
    nextReminder: '21:00',
    todayDrugs: 2,
    recentInteraction: '05/20 09:42',
    completionRate: 74,
    taskRisk: '设备异常'
  },
  {
    id: 3,
    name: '李桂芳',
    gender: '女',
    age: 76,
    recordNo: 'MR-003',
    phone: '136****5108',
    diseases: ['高血脂', '骨质疏松'],
    deviceNo: 'PBX-202605-011',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '待绑定',
    nextReminder: '20:30',
    todayDrugs: 1,
    recentInteraction: '05/19 20:12',
    completionRate: 91,
    taskRisk: '正常'
  },
  {
    id: 4,
    name: '陈德明',
    gender: '男',
    age: 81,
    recordNo: 'MR-004',
    phone: '135****3378',
    diseases: ['帕金森'],
    deviceNo: '未绑定',
    deviceStatus: '未绑定',
    deviceStatusType: 'warning',
    consent: '未同意',
    child: '未绑定',
    nextReminder: '-',
    todayDrugs: 0,
    recentInteraction: '05/18 08:10',
    completionRate: 0,
    taskRisk: '无计划'
  },
  {
    id: 5,
    name: '赵春梅',
    gender: '女',
    age: 74,
    recordNo: 'MR-005',
    phone: '137****5520',
    diseases: ['高血压'],
    deviceNo: 'PBX-202605-029',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '儿子 赵磊 139****8852',
    nextReminder: '07:30',
    todayDrugs: 1,
    recentInteraction: '05/17 19:30',
    completionRate: 88,
    taskRisk: '正常'
  }
]

export const plans = [
  {
    id: 1,
    patientId: 1,
    title: '高血压日常用药 A',
    code: 'PLAN-20260520-001',
    period: '2026-05-20 至 2026-06-18',
    status: '已生效',
    dispatchStatus: '已下发',
    dispatchType: 'success',
    generatedTasks: '已生成 60 条',
    source: '社区复诊处方',
    drugs: [
      {
        name: '硝苯地平控释片',
        dose: '1片/次',
        frequency: '每日一次',
        time: '早餐后',
        guide: '固定时间服用，注意血压监测。'
      },
      {
        name: '二甲双胍片',
        dose: '1片/次',
        frequency: '每日两次',
        time: '早餐后/晚餐后',
        guide: '餐后服用，关注胃肠道反应。'
      }
    ]
  },
  {
    id: 2,
    patientId: 2,
    title: '冠心病复诊调整',
    code: 'PLAN-20260520-002',
    period: '2026-05-18 至 2026-06-16',
    status: '已生效',
    dispatchStatus: '药盒离线',
    dispatchType: 'danger',
    generatedTasks: '已生成 58 条',
    source: '复诊调整',
    drugs: [
      {
        name: '阿司匹林肠溶片',
        dose: '1片/次',
        frequency: '每日一次',
        time: '早餐后',
        guide: '如出现黑便或出血倾向需及时联系医药师。'
      },
      {
        name: '瑞舒伐他汀片',
        dose: '1片/次',
        frequency: '每日一次',
        time: '睡前',
        guide: '关注肌肉酸痛等不适。'
      }
    ]
  },
  {
    id: 3,
    patientId: 3,
    title: '高血脂稳定期',
    code: 'PLAN-20260519-008',
    period: '2026-05-19 至 2026-06-02',
    status: '已生效',
    dispatchStatus: '已下发',
    dispatchType: 'success',
    generatedTasks: '已生成 30 条',
    source: '门诊处方',
    drugs: [
      {
        name: '阿托伐他汀钙片',
        dose: '1片/次',
        frequency: '每日一次',
        time: '睡前',
        guide: '避免大量饮用葡萄柚汁。'
      }
    ]
  },
  {
    id: 4,
    patientId: 4,
    title: '帕金森初始方案',
    code: '草稿',
    period: '未设置',
    status: '草稿',
    dispatchStatus: '未下发',
    dispatchType: 'info',
    generatedTasks: '未生成',
    source: '手动录入',
    drugs: []
  }
]

export const tasks = [
  {
    id: 1,
    patientId: 1,
    time: '08:00',
    period: '早餐后',
    drug: '硝苯地平控释片',
    dose: '1片/次',
    source: '无记录',
    status: '未打卡',
    statusType: 'danger',
    suggestion: '建议通知家属确认实际服药情况。'
  },
  {
    id: 2,
    patientId: 1,
    time: '12:30',
    period: '午餐后',
    drug: '二甲双胍片',
    dose: '1片/次',
    source: '小程序打卡',
    status: '已完成',
    statusType: 'success',
    suggestion: '患者已通过小程序完成打卡。'
  },
  {
    id: 3,
    patientId: 1,
    time: '20:30',
    period: '晚餐后',
    drug: '二甲双胍片',
    dose: '1片/次',
    source: '待上报',
    status: '待执行',
    statusType: 'warning',
    suggestion: '待到点提醒，可临时调整本次剂量。'
  }
]

export const devices = [
  {
    id: 1,
    sn: 'PBX-202605-018',
    patient: '王秀兰',
    status: '在线',
    statusType: 'success',
    battery: '84%',
    wifi: '已连接',
    firmware: 'v2.1.0',
    bindDate: '2026-05-18'
  },
  {
    id: 2,
    sn: 'PBX-202605-006',
    patient: '张建国',
    status: '离线',
    statusType: 'danger',
    battery: '56%',
    wifi: '未连接',
    firmware: 'v2.1.0',
    bindDate: '今日 08:14'
  },
  {
    id: 3,
    sn: 'PBX-202605-011',
    patient: '李桂芳',
    status: '在线',
    statusType: 'success',
    battery: '72%',
    wifi: '已连接',
    firmware: 'v2.1.0',
    bindDate: '2026-05-19'
  },
  {
    id: 4,
    sn: 'PBX-202605-021',
    patient: '-',
    status: '待分配',
    statusType: 'warning',
    battery: '96%',
    wifi: '已连接',
    firmware: 'v2.1.3',
    bindDate: '-'
  },
  {
    id: 5,
    sn: 'PBX-202605-029',
    patient: '赵春梅',
    status: '在线',
    statusType: 'success',
    battery: '100%',
    wifi: '已连接',
    firmware: 'v2.1.3',
    bindDate: '2026-05-20'
  }
]

export const messages = [
  {
    id: 1,
    title: '近期服药完成情况不佳',
    content: '请关注老人近 3 天服药情况',
    patient: '王秀兰',
    receiver: '子女 王敏',
    channel: '小程序消息中心',
    type: '子女提醒',
    status: '未读',
    statusType: 'warning',
    createTime: '今日 14:18'
  },
  {
    id: 2,
    title: '预计 5 天后需要复诊',
    content: '阿托伐他汀即将服用完毕',
    patient: '李桂芳',
    receiver: '患者 / 子女',
    channel: '小程序 + 药盒语音',
    type: '复诊提醒',
    status: '已创建',
    statusType: 'success',
    createTime: '今日 10:42'
  },
  {
    id: 3,
    title: '药盒离线提醒',
    content: '请检查家庭网络或药盒电源',
    patient: '张建国',
    receiver: '医药师',
    channel: '后台消息',
    type: '系统提醒',
    status: '待处理',
    statusType: 'danger',
    createTime: '今日 09:01'
  }
]

export const conversations = [
  {
    id: 1,
    patientId: 1,
    time: '05/20 14:08',
    type: '患者聊天',
    status: '待人工跟进',
    statusType: 'warning',
    patientText: '降压药今天漏吃了，晚上能补吗？',
    deviceText: '系统建议不要自行加倍补服，按原计划继续服药；如出现头晕、胸闷等异常，应联系医药师。',
    note: '命中高血压用药问答库，建议医药师复核答复并同步一次子女关注提醒。'
  },
  {
    id: 2,
    patientId: 1,
    time: '05/20 08:00',
    type: '小智提醒',
    status: '未响应',
    statusType: 'danger',
    deviceText: '现在是早餐后服药时间，请确认是否已服用硝苯地平控释片。',
    note: '提醒周期内未收到确认或留言，建议关注设备在线状态和患者实际服药情况。'
  },
  {
    id: 3,
    patientId: 1,
    time: '05/19 20:00',
    type: '患者聊天',
    status: '已归档',
    statusType: 'success',
    patientText: '已经吃过了。',
    deviceText: '晚餐后服药提醒已播报，请确认二甲双胍片是否已服用。'
  }
]

export const agreement = {
  name: '智慧药盒服务知情同意书',
  version: 'V2026.05',
  status: 1,
  summary:
    '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
  content:
    '<p>一、服务目的：智慧药盒用于辅助用药提醒和用药管理，不替代医生诊疗意见。</p><p>二、信息采集：系统将采集患者基础信息、用药计划、药盒设备状态、服药任务记录和语音问答记录。</p><p>三、风险提示：如出现胸闷、严重不适、疑似不良反应等情况，请及时联系医药师或前往医疗机构。</p><p>四、授权确认：患者或家属点击同意后，表示已阅读并理解上述内容。</p>'
}

export const dashboard = {
  statCards: [
    { label: '管理患者', value: '24', note: '本周新增 3 人', icon: 'ri:user-heart-line' },
    { label: '今日任务', value: '86', note: '已完成 71 次', icon: 'ri:checkbox-circle-line' },
    { label: '今日漏服', value: '8', note: '连续漏服 2 人', icon: 'ri:alarm-warning-line' },
    { label: '待复诊', value: '5', note: '7 天内到期', icon: 'ri:calendar-check-line' }
  ],
  trendBars: [
    { label: '周四', done: 72, miss: 16 },
    { label: '周五', done: 80, miss: 10 },
    { label: '周六', done: 68, miss: 20 },
    { label: '周日', done: 76, miss: 14 },
    { label: '周一', done: 82, miss: 11 },
    { label: '周二', done: 78, miss: 12 },
    { label: '今日', done: 86, miss: 16 }
  ],
  risks: [
    {
      type: 'danger',
      timestamp: '今日 14:18',
      title: '王秀兰连续 2 次漏服降压药',
      note: '建议通知子女，并在下次复诊核对用药依从性',
      patient: '王秀兰 女 72 岁',
      source: '连续漏服',
      level: '高风险',
      action: '联系家属',
      route: '/doctor/messages',
      icon: 'ri:alarm-warning-line'
    },
    {
      type: 'warning',
      timestamp: '今日 09:01',
      title: '张建国药盒离线 6 小时',
      note: '最近一次上报：今日 08:14',
      patient: '张建国 男 69 岁',
      source: '设备离线',
      level: '中风险',
      action: '查看设备',
      route: '/doctor/devices',
      icon: 'ri:wifi-off-line'
    },
    {
      type: 'primary',
      timestamp: '今日 10:42',
      title: '李桂芳 5 天后预计用完阿托伐他汀',
      note: '可创建复诊提醒并下发至药盒',
      patient: '李桂芳 女 76 岁',
      source: '复诊补药',
      level: '待确认',
      action: '创建提醒',
      route: '/doctor/messages',
      icon: 'ri:calendar-check-line'
    }
  ],
  sidePanel: {
    metrics: [
      {
        label: '任务完成',
        value: '71/86',
        percent: 83,
        note: '今日服药任务',
        route: '/doctor/tasks'
      },
      {
        label: '风险跟进',
        value: '5/8',
        percent: 62,
        note: '已处理高风险项',
        route: '/doctor/messages'
      },
      {
        label: '药盒在线',
        value: '15/18',
        percent: 83,
        note: '绑定设备在线率',
        route: '/doctor/devices'
      }
    ],
    actions: [
      {
        label: '新增建档',
        icon: 'ri:user-add-line',
        route: '/doctor/patient-create',
        tone: 'primary'
      },
      {
        label: '创建计划',
        icon: 'ri:calendar-check-line',
        route: '/doctor/plans',
        tone: 'success'
      },
      {
        label: '设备管理',
        icon: 'ri:medicine-bottle-line',
        route: '/doctor/devices',
        tone: 'warning'
      },
      {
        label: '提醒消息',
        icon: 'ri:notification-3-line',
        route: '/doctor/messages',
        tone: 'info'
      }
    ],
    weeklyBars: [
      { label: '周四', value: 72, count: '68 次' },
      { label: '周五', value: 80, count: '74 次' },
      { label: '周六', value: 68, count: '61 次' },
      { label: '周日', value: 76, count: '70 次' },
      { label: '周一', value: 82, count: '77 次' },
      { label: '周二', value: 78, count: '73 次' },
      { label: '今日', value: 86, count: '71 次', active: true }
    ],
    weeklySummary: {
      value: '86%',
      note: '今日完成率，已完成 71 次'
    }
  }
}
