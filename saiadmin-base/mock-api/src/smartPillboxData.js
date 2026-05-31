const today = '2026-05-21'

const statusTypeMap = {
  在线: 'success',
  离线: 'danger',
  未绑定: 'warning',
  待分配: 'warning',
  已完成: 'success',
  待执行: 'warning',
  未打卡: 'danger',
  漏服: 'danger',
  已发送: 'success',
  待发送: 'warning',
  待处理: 'danger',
  已处理: 'success',
  已创建: 'success',
  已生效: 'success',
  草稿: 'info'
}

export const patients = [
  {
    id: 1,
    name: '王秀兰',
    gender: '女',
    age: 72,
    birthDate: '1954-03-12',
    address: '春和社区 8 栋 1202',
    recordNo: 'MR-202605-001',
    phone: '138****0921',
    diseases: ['高血压', '糖尿病'],
    historyDiseases: ['胃炎'],
    allergies: [
      {
        id: 'ALG-001',
        allergenType: 'drug',
        allergen: '青霉素',
        severity: 'severe',
        reaction: '皮疹、胸闷'
      }
    ],
    contacts: [
      { id: 'CT-001', relation: '女儿', name: '王敏', phone: '137****8091', isPrimary: true },
      { id: 'CT-002', relation: '儿子', name: '王磊', phone: '139****2108', isPrimary: false }
    ],
    managementPharmacist: '刘药师',
    firstConsultPharmacist: '张药师',
    status: '重点关注',
    deviceNo: 'PBX-202605-018',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '女儿 王敏 137****8091',
    nextReminder: '20:30',
    todayDrugs: 3,
    recentInteraction: '05/21 14:08',
    completionRate: 58,
    taskRisk: '漏服 2 次',
    breakfastTime: '07:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    sleepTime: '21:30',
    createdAt: '2026-05-18 09:30',
    updatedAt: '2026-05-21 14:08',
    lastActiveAt: '2026-05-21 14:08'
  },
  {
    id: 2,
    name: '张建国',
    gender: '男',
    age: 69,
    birthDate: '1957-08-06',
    address: '星河湾小区 3 栋 801',
    recordNo: 'MR-202605-002',
    phone: '139****2206',
    diseases: ['冠心病', '高血压'],
    historyDiseases: ['脑梗恢复期'],
    allergies: [],
    contacts: [
      { id: 'CT-003', relation: '儿子', name: '张磊', phone: '136****7760', isPrimary: true }
    ],
    managementPharmacist: '张药师',
    firstConsultPharmacist: '刘药师',
    status: '重点关注',
    deviceNo: 'PBX-202605-006',
    deviceStatus: '离线',
    deviceStatusType: 'danger',
    consent: '已同意',
    child: '儿子 张磊 136****7760',
    nextReminder: '21:00',
    todayDrugs: 2,
    recentInteraction: '05/21 09:42',
    completionRate: 74,
    taskRisk: '设备异常',
    breakfastTime: '07:30',
    lunchTime: '12:00',
    dinnerTime: '18:30',
    sleepTime: '22:00',
    createdAt: '2026-05-16 10:00',
    updatedAt: '2026-05-21 09:42',
    lastActiveAt: '2026-05-21 08:14'
  },
  {
    id: 3,
    name: '李桂芳',
    gender: '女',
    age: 76,
    birthDate: '1950-11-20',
    address: '康宁花园 6 栋 502',
    recordNo: 'MR-202605-003',
    phone: '136****5108',
    diseases: ['高血脂', '骨质疏松'],
    historyDiseases: [],
    allergies: [],
    contacts: [{ id: 'CT-004', relation: '女儿', name: '李娜', phone: '138****3309', isPrimary: true }],
    managementPharmacist: '王药师',
    firstConsultPharmacist: '刘药师',
    status: '正常管理',
    deviceNo: 'PBX-202605-011',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '女儿 李娜 138****3309',
    nextReminder: '20:30',
    todayDrugs: 1,
    recentInteraction: '05/20 20:12',
    completionRate: 91,
    taskRisk: '正常',
    breakfastTime: '07:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    sleepTime: '21:30',
    createdAt: '2026-05-19 11:00',
    updatedAt: '2026-05-20 20:12',
    lastActiveAt: '2026-05-20 20:12'
  },
  {
    id: 4,
    name: '陈德明',
    gender: '男',
    age: 81,
    birthDate: '1945-02-08',
    address: '柏悦养老社区 2 号楼',
    recordNo: 'MR-202605-004',
    phone: '135****3378',
    diseases: ['帕金森'],
    historyDiseases: ['前列腺增生'],
    allergies: [],
    contacts: [],
    managementPharmacist: '刘药师',
    firstConsultPharmacist: '王药师',
    status: '正常管理',
    deviceNo: '未绑定',
    deviceStatus: '未绑定',
    deviceStatusType: 'warning',
    consent: '未同意',
    child: '未绑定',
    nextReminder: '-',
    todayDrugs: 0,
    recentInteraction: '05/18 08:10',
    completionRate: 0,
    taskRisk: '无计划',
    breakfastTime: '07:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    sleepTime: '22:00',
    createdAt: '2026-05-18 08:10',
    updatedAt: '2026-05-18 08:10',
    lastActiveAt: null
  },
  {
    id: 5,
    name: '赵春梅',
    gender: '女',
    age: 74,
    birthDate: '1952-06-02',
    address: '幸福里 11 栋 403',
    recordNo: 'MR-202605-005',
    phone: '137****5520',
    diseases: ['高血压'],
    historyDiseases: ['白内障术后'],
    allergies: [
      {
        id: 'ALG-005',
        allergenType: 'food',
        allergen: '海鲜',
        severity: 'moderate',
        reaction: '荨麻疹'
      }
    ],
    contacts: [{ id: 'CT-005', relation: '儿子', name: '赵磊', phone: '139****8852', isPrimary: true }],
    managementPharmacist: '张药师',
    firstConsultPharmacist: '张药师',
    status: '正常管理',
    deviceNo: 'PBX-202605-029',
    deviceStatus: '在线',
    deviceStatusType: 'success',
    consent: '已同意',
    child: '儿子 赵磊 139****8852',
    nextReminder: '07:30',
    todayDrugs: 1,
    recentInteraction: '05/21 07:30',
    completionRate: 88,
    taskRisk: '正常',
    breakfastTime: '07:30',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    sleepTime: '22:00',
    createdAt: '2026-05-17 15:20',
    updatedAt: '2026-05-21 07:30',
    lastActiveAt: '2026-05-21 07:30'
  }
]

export const plans = [
  {
    id: 1,
    patientId: 1,
    patientName: '王秀兰',
    title: '高血压与血糖日常用药',
    code: 'PLAN-20260520-001',
    period: '2026-05-20 至 2026-06-18',
    startDate: '2026-05-20',
    endDate: '2026-06-18',
    status: '已生效',
    dispatchStatus: '已下发',
    dispatchType: 'success',
    generatedTasks: '已生成 90 条',
    source: '社区复诊处方',
    attachments: [
      {
        id: 1,
        fileName: '王秀兰-社区复诊处方.jpg',
        fileType: '处方照片',
        uploadTime: '2026-05-20 09:18',
        ocrStatus: '已确认',
        operator: '刘药师'
      }
    ],
    reminderCount: 4,
    auditSummary: '控释片整片吞服，二甲双胍随餐服用',
    drugs: [
      {
        name: '硝苯地平控释片',
        dose: '1片/次',
        frequency: '每日1次',
        time: '早餐前',
        guide: '固定时间服用，整片吞服，关注血压变化。',
        specification: '30mg',
        quantity: '1盒',
        startDate: '2026-05-20',
        endDate: '2026-06-18',
        durationDays: 30
      },
      {
        name: '二甲双胍缓释片',
        dose: '1片/次',
        frequency: '每日2次',
        time: '早餐时/晚餐时',
        guide: '随餐服用，关注胃肠道反应。',
        specification: '500mg',
        quantity: '2盒',
        startDate: '2026-05-20',
        endDate: '2026-06-18',
        durationDays: 30
      },
      {
        name: '阿司匹林肠溶片',
        dose: '1片/次',
        frequency: '每日1次',
        time: '早餐后',
        guide: '饭后服用，如黑便或出血倾向需联系医药师。',
        specification: '100mg',
        quantity: '1盒',
        startDate: '2026-05-20',
        endDate: '2026-06-18',
        durationDays: 30
      }
    ]
  },
  {
    id: 2,
    patientId: 2,
    patientName: '张建国',
    title: '冠心病复诊调整',
    code: 'PLAN-20260520-002',
    period: '2026-05-18 至 2026-06-16',
    startDate: '2026-05-18',
    endDate: '2026-06-16',
    status: '已生效',
    dispatchStatus: '药盒离线',
    dispatchType: 'danger',
    generatedTasks: '已生成 60 条',
    source: '复诊调整',
    attachments: [
      {
        id: 2,
        fileName: '张建国-HIS处方截图.png',
        fileType: 'HIS截图',
        uploadTime: '2026-05-20 10:32',
        ocrStatus: '待确认',
        operator: '张药师'
      }
    ],
    reminderCount: 2,
    auditSummary: '离线后需重新下发',
    drugs: [
      {
        name: '阿司匹林肠溶片',
        dose: '1片/次',
        frequency: '每日1次',
        time: '早餐后',
        guide: '如出现黑便或出血倾向需及时联系医药师。'
      },
      {
        name: '瑞舒伐他汀片',
        dose: '1片/次',
        frequency: '每日1次',
        time: '睡前',
        guide: '关注肌肉酸痛等不适。'
      }
    ]
  },
  {
    id: 3,
    patientId: 3,
    patientName: '李桂芳',
    title: '高血脂稳定期',
    code: 'PLAN-20260519-008',
    period: '2026-05-19 至 2026-06-02',
    startDate: '2026-05-19',
    endDate: '2026-06-02',
    status: '已生效',
    dispatchStatus: '已下发',
    dispatchType: 'success',
    generatedTasks: '已生成 15 条',
    source: '门诊处方',
    reminderCount: 1,
    auditSummary: '睡前服用',
    drugs: [
      {
        name: '阿托伐他汀钙片',
        dose: '1片/次',
        frequency: '每日1次',
        time: '睡前',
        guide: '避免大量饮用葡萄柚汁。'
      }
    ]
  },
  {
    id: 4,
    patientId: 4,
    patientName: '陈德明',
    title: '帕金森初始方案',
    code: '草稿',
    period: '未设置',
    startDate: '',
    endDate: null,
    status: '草稿',
    dispatchStatus: '未下发',
    dispatchType: 'info',
    generatedTasks: '未生成',
    source: '手动录入',
    reminderCount: 0,
    auditSummary: '待补齐处方',
    drugs: []
  }
]

export const tasks = [
  {
    id: 1,
    patientId: 1,
    patient: '王秀兰',
    taskDate: today,
    time: '06:30',
    period: '早餐前',
    drug: '硝苯地平控释片',
    dose: '1片/次',
    frequency: '每日1次',
    source: '无记录',
    status: '未打卡',
    statusType: 'danger',
    suggestion: '建议通知家属确认实际服药情况。',
    planCode: 'PLAN-20260520-001',
    reminderType: '药盒语音',
    abnormalLevel: '高风险',
    completedAt: null
  },
  {
    id: 2,
    patientId: 1,
    patient: '王秀兰',
    taskDate: today,
    time: '07:00',
    period: '早餐时',
    drug: '二甲双胍缓释片',
    dose: '1片/次',
    frequency: '每日2次',
    source: '小程序打卡',
    status: '已完成',
    statusType: 'success',
    suggestion: '患者已通过小程序完成打卡。',
    planCode: 'PLAN-20260520-001',
    reminderType: '小程序',
    abnormalLevel: '正常',
    completedAt: '2026-05-21 07:08'
  },
  {
    id: 3,
    patientId: 1,
    patient: '王秀兰',
    taskDate: today,
    time: '20:30',
    period: '晚餐时',
    drug: '二甲双胍缓释片',
    dose: '1片/次',
    frequency: '每日2次',
    source: '待上报',
    status: '待执行',
    statusType: 'warning',
    suggestion: '待到点提醒，可临时调整本次剂量。',
    planCode: 'PLAN-20260520-001',
    reminderType: '药盒语音',
    abnormalLevel: '待观察',
    completedAt: null
  },
  {
    id: 4,
    patientId: 2,
    patient: '张建国',
    taskDate: today,
    time: '08:00',
    period: '早餐后',
    drug: '阿司匹林肠溶片',
    dose: '1片/次',
    frequency: '每日1次',
    source: '药盒离线',
    status: '漏服',
    statusType: 'danger',
    suggestion: '药盒离线期间未收到记录，建议电话确认。',
    planCode: 'PLAN-20260520-002',
    reminderType: '药盒语音',
    abnormalLevel: '高风险',
    completedAt: null
  },
  {
    id: 5,
    patientId: 3,
    patient: '李桂芳',
    taskDate: today,
    time: '21:00',
    period: '睡前',
    drug: '阿托伐他汀钙片',
    dose: '1片/次',
    frequency: '每日1次',
    source: '待上报',
    status: '待执行',
    statusType: 'warning',
    suggestion: '睡前提醒待执行。',
    planCode: 'PLAN-20260519-008',
    reminderType: '药盒语音',
    abnormalLevel: '正常',
    completedAt: null
  }
]

export const medicationRecords = [
  {
    id: 1,
    patientId: 1,
    planCode: 'PLAN-20260520-001',
    commonName: '二甲双胍缓释片',
    dosage: '1片/次',
    time: '2026-05-21 07:08',
    status: '已完成',
    statusType: 'success',
    source: '小程序打卡',
    createdAt: '2026-05-21 07:08'
  },
  {
    id: 2,
    patientId: 1,
    planCode: 'PLAN-20260520-001',
    commonName: '硝苯地平控释片',
    dosage: '1片/次',
    time: '2026-05-21 06:30',
    status: '未打卡',
    statusType: 'danger',
    source: '无记录',
    createdAt: '2026-05-21 06:30'
  },
  {
    id: 3,
    patientId: 2,
    planCode: 'PLAN-20260520-002',
    commonName: '阿司匹林肠溶片',
    dosage: '1片/次',
    time: '2026-05-21 08:00',
    status: '漏服',
    statusType: 'danger',
    source: '药盒离线',
    createdAt: '2026-05-21 08:00'
  }
]

export const shortageReports = [
  {
    id: 1,
    patientId: 3,
    patient: '李桂芳',
    medicine: '阿托伐他汀钙片',
    remainingAmount: '5片',
    expectedDays: 5,
    source: '药盒余量上报',
    status: '待处理',
    statusType: 'danger',
    reportTime: '2026-05-21 10:42',
    handler: '',
    result: '建议创建复诊提醒并确认是否需要补药'
  },
  {
    id: 2,
    patientId: 1,
    patient: '王秀兰',
    medicine: '二甲双胍缓释片',
    remainingAmount: '12片',
    expectedDays: 6,
    source: '子女小程序',
    status: '处理中',
    statusType: 'warning',
    reportTime: '2026-05-21 13:10',
    handler: '刘药师',
    result: '已提醒家属复诊补药'
  },
  {
    id: 3,
    patientId: 5,
    patient: '赵春梅',
    medicine: '苯磺酸氨氯地平片',
    remainingAmount: '18片',
    expectedDays: 18,
    source: '患者小程序',
    status: '已处理',
    statusType: 'success',
    reportTime: '2026-05-20 16:28',
    handler: '张药师',
    result: '暂不需要补药，继续观察余量'
  }
]

export const devices = [
  {
    id: 1,
    sn: 'PBX-202605-018',
    bindPatientId: 1,
    patient: '王秀兰',
    status: '在线',
    statusType: 'success',
    battery: '84%',
    batteryLevel: 84,
    wifi: '已连接',
    wifiConnected: true,
    firmware: 'v2.1.0',
    bindDate: '2026-05-18',
    lastHeartbeat: '2026-05-21 14:08',
    offlineHours: 0,
    dispatchStatus: '计划已同步'
  },
  {
    id: 2,
    sn: 'PBX-202605-006',
    bindPatientId: 2,
    patient: '张建国',
    status: '离线',
    statusType: 'danger',
    battery: '56%',
    batteryLevel: 56,
    wifi: '未连接',
    wifiConnected: false,
    firmware: 'v2.1.0',
    bindDate: '2026-05-18',
    lastHeartbeat: '2026-05-21 08:14',
    offlineHours: 6,
    dispatchStatus: '计划待重发'
  },
  {
    id: 3,
    sn: 'PBX-202605-011',
    bindPatientId: 3,
    patient: '李桂芳',
    status: '在线',
    statusType: 'success',
    battery: '72%',
    batteryLevel: 72,
    wifi: '已连接',
    wifiConnected: true,
    firmware: 'v2.1.0',
    bindDate: '2026-05-19',
    lastHeartbeat: '2026-05-21 09:58',
    offlineHours: 0,
    dispatchStatus: '计划已同步'
  },
  {
    id: 4,
    sn: 'PBX-202605-021',
    bindPatientId: null,
    patient: '-',
    status: '待分配',
    statusType: 'warning',
    battery: '96%',
    batteryLevel: 96,
    wifi: '已连接',
    wifiConnected: true,
    firmware: 'v2.1.3',
    bindDate: '-',
    lastHeartbeat: '2026-05-21 09:12',
    offlineHours: 0,
    dispatchStatus: '未绑定'
  },
  {
    id: 5,
    sn: 'PBX-202605-029',
    bindPatientId: 5,
    patient: '赵春梅',
    status: '在线',
    statusType: 'success',
    battery: '100%',
    batteryLevel: 100,
    wifi: '已连接',
    wifiConnected: true,
    firmware: 'v2.1.3',
    bindDate: '2026-05-20',
    lastHeartbeat: '2026-05-21 07:30',
    offlineHours: 0,
    dispatchStatus: '计划已同步'
  }
]

export const deviceEvents = [
  {
    id: 1,
    sn: 'PBX-202605-018',
    patientId: 1,
    patient: '王秀兰',
    eventType: '开盖',
    grid: '1号格',
    medicine: '硝苯地平控释片',
    taskTime: '06:30',
    matchedPlan: false,
    level: '关注',
    eventTime: '2026-05-21 06:52',
    note: '开盖时间晚于计划 22 分钟'
  },
  {
    id: 2,
    sn: 'PBX-202605-018',
    patientId: 1,
    patient: '王秀兰',
    eventType: '关盖',
    grid: '2号格',
    medicine: '二甲双胍缓释片',
    taskTime: '07:00',
    matchedPlan: true,
    level: '正常',
    eventTime: '2026-05-21 07:08',
    note: '与小程序打卡时间一致'
  },
  {
    id: 3,
    sn: 'PBX-202605-006',
    patientId: 2,
    patient: '张建国',
    eventType: '离线',
    grid: '-',
    medicine: '-',
    taskTime: '08:00',
    matchedPlan: false,
    level: '高风险',
    eventTime: '2026-05-21 08:14',
    note: '离线后未收到早餐后服药记录'
  },
  {
    id: 4,
    sn: 'PBX-202605-029',
    patientId: 5,
    patient: '赵春梅',
    eventType: '低电量',
    grid: '-',
    medicine: '-',
    taskTime: '-',
    matchedPlan: true,
    level: '关注',
    eventTime: '2026-05-21 07:30',
    note: '电量低于 30% 时已发充电提醒'
  }
]

export const planDispatchRecords = [
  {
    id: 1,
    planId: 1,
    planTitle: '高血压与血糖日常用药',
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    status: '成功',
    statusType: 'success',
    dispatchTime: '2026-05-20 09:26',
    retryStatus: '无需重试',
    failReason: ''
  },
  {
    id: 2,
    planId: 2,
    planTitle: '冠心病复诊调整',
    patientId: 2,
    patient: '张建国',
    deviceNo: 'PBX-202605-006',
    status: '失败',
    statusType: 'danger',
    dispatchTime: '2026-05-20 11:04',
    retryStatus: '待重试',
    failReason: '药盒离线'
  },
  {
    id: 3,
    planId: 3,
    planTitle: '高血脂稳定期',
    patientId: 3,
    patient: '李桂芳',
    deviceNo: 'PBX-202605-011',
    status: '成功',
    statusType: 'success',
    dispatchTime: '2026-05-19 15:12',
    retryStatus: '无需重试',
    failReason: ''
  }
]

export const prescriptionAttachments = [
  {
    id: 1,
    planId: 1,
    patientId: 1,
    patient: '王秀兰',
    fileName: '王秀兰-社区复诊处方.jpg',
    fileType: '处方照片',
    uploadTime: '2026-05-20 09:18',
    ocrStatus: '已确认',
    operator: '刘药师'
  },
  {
    id: 2,
    planId: 2,
    patientId: 2,
    patient: '张建国',
    fileName: '张建国-HIS处方截图.png',
    fileType: 'HIS截图',
    uploadTime: '2026-05-20 10:32',
    ocrStatus: '待确认',
    operator: '张药师'
  }
]

export const ocrRecords = [
  {
    id: 1,
    patientId: 2,
    patient: '张建国',
    fileName: '张建国-HIS处方截图.png',
    fileType: 'HIS截图',
    status: '待确认',
    statusType: 'warning',
    confidence: 88,
    createdAt: '2026-05-20 10:32',
    confirmedAt: '',
    operator: '张药师',
    correctionNote: '需确认瑞舒伐他汀规格',
    recognizedDrugs: [
      {
        name: '阿司匹林肠溶片',
        specification: '100mg',
        quantity: '1盒',
        dose: '1片/次',
        frequency: '每日1次',
        time: '早餐后',
        durationDays: 30,
        guide: '饭后服用，如黑便或出血倾向需联系医药师。'
      },
      {
        name: '瑞舒伐他汀片',
        specification: '10mg',
        quantity: '1盒',
        dose: '1片/次',
        frequency: '每日1次',
        time: '睡前',
        durationDays: 30,
        guide: '关注肌肉酸痛等不适。'
      }
    ]
  }
]

export const messages = [
  {
    id: 1,
    patientId: 1,
    title: '服药任务漏服提醒',
    content: '请关注本次漏服任务并联系患者确认。',
    patient: '王秀兰',
    receiver: '王秀兰 家属',
    channel: '家属端',
    type: '漏服提醒',
    status: '已推送',
    statusType: 'success',
    creationMode: '系统推送',
    creator: '系统',
    createTime: '2026-05-29 14:18',
    sendTime: '2026-05-29 14:20',
    triggerScene: '漏服',
    triggerSource: '漏服规则'
  },
  {
    id: 2,
    patientId: 3,
    title: '预计 5 天后需要复诊',
    content: '阿托伐他汀即将服用完毕',
    patient: '李桂芳',
    receiver: '患者本人、李桂芳 家属',
    channel: '患者端、家属端',
    type: '复诊提醒',
    status: '已推送',
    statusType: 'success',
    creationMode: '系统推送',
    creator: '系统',
    createTime: '2026-05-28 10:42',
    sendTime: '2026-05-28 21:00',
    triggerScene: '复诊提醒',
    triggerSource: '余药量规则'
  },
  {
    id: 3,
    patientId: 2,
    title: '药盒离线',
    content: '请检查家庭网络或药盒电源',
    patient: '张建国',
    receiver: '患者本人、张建国 家属',
    channel: '患者端、家属端',
    type: '药盒离线',
    status: '已推送',
    statusType: 'success',
    creationMode: '系统推送',
    creator: '系统',
    createTime: '今日 09:01',
    sendTime: '今日 09:01',
    triggerScene: '药盒离线',
    triggerSource: '设备离线规则'
  },
  {
    id: 4,
    patientId: 3,
    title: '阿托伐他汀缺药提醒',
    content: '剩余约 5 天，请确认复诊或补药安排',
    patient: '李桂芳',
    receiver: '患者本人、李桂芳 家属',
    channel: '患者端、家属端',
    type: '缺药提醒',
    status: '已推送',
    statusType: 'success',
    creationMode: '系统推送',
    creator: '系统',
    createTime: '今日 10:42',
    sendTime: '今日 21:00',
    triggerScene: '缺药提醒',
    triggerSource: '缺药上报'
  },
  {
    id: 5,
    patientId: 1,
    title: '周末用药提醒',
    content: '请按计划完成周末用药并关注药盒提醒。',
    patient: '王秀兰',
    receiver: '患者本人、王秀兰 家属',
    channel: '患者端、家属端',
    type: '系统提醒',
    status: '待推送',
    statusType: 'warning',
    creationMode: '后台创建',
    creator: '医药师',
    createTime: '今日 09:30',
    sendTime: '',
    cancelTime: '',
    triggerScene: '手动创建',
    triggerSource: '手动创建'
  }
]

export const conversations = [
  {
    id: 1,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 14:08',
    type: '患者聊天',
    status: '待人工跟进',
    statusType: 'warning',
    riskLevel: '高风险',
    reviewStatus: '待复核',
    knowledgeHit: {
      title: '高血压漏服处理建议',
      summary: '降压药漏服后应避免自行加倍补服，需结合当前血压和症状判断。',
      confidence: 92,
      source: '慢病用药问答库'
    },
    patientText: '降压药今天漏吃了，晚上能补吗？',
    deviceText: '系统建议不要自行加倍补服，按原计划继续服药；如出现头晕、胸闷等异常，应联系医药师。',
    note: '命中高血压用药问答库，建议医药师复核答复并同步一次子女关注提醒。'
  },
  {
    id: 2,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 13:40',
    type: '设备事件',
    status: '已恢复',
    statusType: 'success',
    riskLevel: '正常',
    reviewStatus: '无需复核',
    knowledgeHit: null,
    deviceText: '药盒网络已恢复，最近一次计划同步完成。'
  },
  {
    id: 3,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 12:30',
    type: '小智提醒',
    status: '已确认',
    statusType: 'success',
    riskLevel: '正常',
    reviewStatus: '无需复核',
    knowledgeHit: null,
    patientText: '午饭后已经服药。',
    deviceText: '午餐后服药提醒已播报，请确认是否已服用二甲双胍片。'
  },
  {
    id: 4,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 11:15',
    type: '患者聊天',
    status: '待人工跟进',
    statusType: 'warning',
    riskLevel: '高风险',
    reviewStatus: '待复核',
    knowledgeHit: {
      title: '血压偏高与用药调整',
      summary: '血压偏高时不建议自行调整剂量，应记录数值与症状并由医药师复核。',
      confidence: 89,
      source: '高血压随访知识库'
    },
    patientText: '今天上午有点头晕，血压 148/92，要不要调整药量？',
    deviceText: '请先保持原服药计划，记录当前血压和不适症状，建议等待医药师复核后再调整。'
  },
  {
    id: 5,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 10:40',
    type: '设备事件',
    status: '待处理',
    statusType: 'warning',
    deviceText: '药盒开盖后 20 分钟未检测到关盖，请确认药盒是否已正确关闭。'
  },
  {
    id: 6,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 10:05',
    type: '患者聊天',
    status: '已归档',
    statusType: 'success',
    patientText: '刚刚量了血压，132/84。',
    deviceText: '已记录本次血压结果，继续按当前计划服药。'
  },
  {
    id: 7,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 09:30',
    type: '小智提醒',
    status: '已确认',
    statusType: 'success',
    patientText: '已经吃了。',
    deviceText: '请确认晨间降压药是否已服用。'
  },
  {
    id: 8,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 08:00',
    type: '小智提醒',
    status: '未响应',
    statusType: 'danger',
    deviceText: '现在是早餐前服药时间，请确认是否已服用硝苯地平控释片。',
    note: '提醒周期内未收到确认或留言，建议关注设备在线状态和患者实际服药情况。'
  },
  {
    id: 9,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/21 07:42',
    type: '设备事件',
    status: '已处理',
    statusType: 'success',
    deviceText: '药盒电量低于 30%，已发送充电提醒给患者和子女。'
  },
  {
    id: 10,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 21:10',
    type: '患者聊天',
    status: '已归档',
    statusType: 'success',
    patientText: '晚上吃药以后有点口干，这个正常吗？',
    deviceText: '部分降压药可能出现口干感，请适量饮水；如持续加重或伴随其他不适，建议联系医药师。'
  },
  {
    id: 11,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 20:30',
    type: '小智提醒',
    status: '未响应',
    statusType: 'danger',
    deviceText: '晚间服药时间已到，请确认是否已服用阿托伐他汀钙片。'
  },
  {
    id: 12,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 19:05',
    type: '患者聊天',
    status: '待人工跟进',
    statusType: 'warning',
    patientText: '明天要体检，早上的降糖药还照常吃吗？',
    deviceText: '体检前用药需结合检查项目确认，建议医药师或医生复核后再决定。'
  },
  {
    id: 13,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 18:00',
    type: '小智提醒',
    status: '已确认',
    statusType: 'success',
    patientText: '已经服用。',
    deviceText: '晚餐前服药提醒已播报，请确认是否已服用降糖药。'
  },
  {
    id: 14,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 15:20',
    type: '设备事件',
    status: '已归档',
    statusType: 'info',
    deviceText: '药盒完成一次远程配置同步，提醒音量调整为中。'
  },
  {
    id: 15,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/20 08:15',
    type: '患者聊天',
    status: '已归档',
    statusType: 'success',
    patientText: '今天早餐吃得比较少，药还按原来的量吃吗？',
    deviceText: '请按医嘱服药，若进食明显减少且担心低血糖，可记录情况并等待医药师建议。'
  },
  {
    id: 16,
    patientId: 1,
    patient: '王秀兰',
    deviceNo: 'PBX-202605-018',
    time: '05/19 21:30',
    type: '小智提醒',
    status: '未响应',
    statusType: 'danger',
    deviceText: '睡前提醒已播报，请确认今日药品是否已全部完成。'
  },
  {
    id: 17,
    patientId: 2,
    patient: '张建国',
    deviceNo: 'PBX-202605-006',
    time: '05/21 09:42',
    type: '设备事件',
    status: '待处理',
    statusType: 'danger',
    deviceText: '药盒已离线，请检查网络或电源。',
    note: '离线超过 6 小时，计划下发和服药记录可能延迟。'
  },
  {
    id: 18,
    patientId: 3,
    patient: '李桂芳',
    deviceNo: 'PBX-202605-011',
    time: '05/20 20:12',
    type: '患者聊天',
    status: '已归档',
    statusType: 'success',
    patientText: '已经吃过了。',
    deviceText: '晚间服药提醒已播报，请确认阿托伐他汀钙片是否已服用。'
  }
]

export const healthRecords = [
  {
    id: 1,
    patientId: 1,
    patient: '王秀兰',
    date: '2026-05-15',
    morningBP: '135/85',
    eveningBP: '128/82',
    fastingGlucose: 6.2,
    responded: true,
    riskLevel: '正常',
    note: '数据完整'
  },
  {
    id: 2,
    patientId: 1,
    patient: '王秀兰',
    date: '2026-05-16',
    morningBP: '142/90',
    eveningBP: '138/88',
    fastingGlucose: 6.8,
    responded: true,
    riskLevel: '关注',
    note: '晨间血压偏高'
  },
  {
    id: 3,
    patientId: 1,
    patient: '王秀兰',
    date: '2026-05-17',
    morningBP: null,
    eveningBP: null,
    fastingGlucose: null,
    responded: false,
    riskLevel: '高风险',
    note: '全天未上报'
  },
  {
    id: 4,
    patientId: 2,
    patient: '张建国',
    date: '2026-05-21',
    morningBP: '150/92',
    eveningBP: null,
    fastingGlucose: null,
    responded: true,
    riskLevel: '关注',
    note: '血压偏高，设备离线后缺晚间数据'
  },
  {
    id: 5,
    patientId: 3,
    patient: '李桂芳',
    date: '2026-05-21',
    morningBP: '126/78',
    eveningBP: '122/76',
    fastingGlucose: 5.8,
    responded: true,
    riskLevel: '正常',
    note: '血压血糖稳定'
  }
]

export const agreement = {
  name: '智慧药盒服务知情同意书',
  version: 'V2026.05',
  status: 1,
  updatedAt: '2026-05-21 14:08',
  summary:
    '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
  ocrEnabled: true,
  ocrFileTypes: 'jpg、png、pdf',
  ocrFields: '药品名称、规格、剂量、频次、服药时段、疗程、注意事项',
  ocrProvider: 'mock 识别服务',
  content:
    '<p>一、服务目的：智慧药盒用于辅助用药提醒和用药管理，不替代医生诊疗意见。</p><p>二、信息采集：系统将采集患者基础信息、用药计划、药盒设备状态、服药任务记录和语音问答记录。</p><p>三、风险提示：如出现胸闷、严重不适、疑似不良反应等情况，请及时联系医药师或前往医疗机构。</p><p>四、授权确认：患者或家属点击同意后，表示已阅读并理解上述内容。</p>'
}

export const consentRecords = [
  {
    id: 1,
    patientId: 1,
    patient: '王秀兰',
    version: 'V2026.05',
    confirmTime: '2026-05-18 09:42',
    confirmTerminal: '患者小程序',
    status: '已同意',
    statusType: 'success'
  },
  {
    id: 2,
    patientId: 2,
    patient: '张建国',
    version: 'V2026.05',
    confirmTime: '2026-05-18 10:20',
    confirmTerminal: '子女小程序',
    status: '已同意',
    statusType: 'success'
  },
  {
    id: 3,
    patientId: 4,
    patient: '陈德明',
    version: 'V2026.05',
    confirmTime: '',
    confirmTerminal: '-',
    status: '未同意',
    statusType: 'danger'
  }
]

export const dashboard = {
  statCards: [
    { label: '今日任务', value: '86', note: '已完成 71 次', icon: 'ri:checkbox-circle-line' },
    { label: '未打卡', value: '5', note: '需确认实际服药', icon: 'ri:close-circle-line' },
    { label: '待处理', value: '7', note: '进入对应页面处理', icon: 'ri:alarm-warning-line' }
  ],
  trendBars: [
    { label: '周五', done: 80, miss: 10 },
    { label: '周六', done: 68, miss: 20 },
    { label: '周日', done: 76, miss: 14 },
    { label: '周一', done: 82, miss: 11 },
    { label: '周二', done: 78, miss: 12 },
    { label: '周三', done: 84, miss: 9 },
    { label: '今日', done: 86, miss: 16 }
  ],
  sidePanel: {
    actions: [
      {
        label: '新增患者',
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
        label: '处理缺药',
        icon: 'ri:pulse-line',
        route: '/doctor/health-data?tab=shortage',
        tone: 'warning'
      },
      {
        label: '查看任务',
        icon: 'ri:notification-3-line',
        route: '/doctor/tasks',
        tone: 'info'
      }
    ]
  }
}

function nextId(records) {
  return records.length ? Math.max(...records.map((item) => Number(item.id) || 0)) + 1 : 1
}

function patientName(patientId) {
  return patients.find((item) => String(item.id) === String(patientId))?.name || '-'
}

function getPlanEndDate(startDate, durationDays) {
  if (!startDate || !durationDays) return null
  const date = new Date(`${startDate}T00:00:00`)
  date.setDate(date.getDate() + Number(durationDays) - 1)
  return date.toISOString().slice(0, 10)
}

export function buildHealthSummary(patientId) {
  const records = healthRecords.filter((item) => String(item.patientId) === String(patientId))
  const bpValues = records
    .flatMap((item) => [item.morningBP, item.eveningBP])
    .filter(Boolean)
    .map((bp) => {
      const [systolic, diastolic] = bp.split('/').map(Number)
      return { systolic, diastolic }
    })
  const glucoseValues = records
    .map((item) => item.fastingGlucose)
    .filter((value) => typeof value === 'number')
  const average = (values, key) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value[key], 0) / values.length) : 0
  const averageNumber = (values) =>
    values.length
      ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
      : 0

  return {
    avgSystolic: average(bpValues, 'systolic'),
    avgDiastolic: average(bpValues, 'diastolic'),
    avgGlucose: averageNumber(glucoseValues),
    complianceRate: records.length
      ? Math.round((records.filter((item) => item.responded).length / records.length) * 100)
      : 0,
    systolicTrend: bpValues.length >= 2 ? bpValues[bpValues.length - 1].systolic - bpValues[0].systolic : 0,
    diastolicTrend:
      bpValues.length >= 2 ? bpValues[bpValues.length - 1].diastolic - bpValues[0].diastolic : 0,
    glucoseTrend:
      glucoseValues.length >= 2
        ? Math.round((glucoseValues[glucoseValues.length - 1] - glucoseValues[0]) * 10) / 10
        : 0
  }
}

export function syncPatientDerivedData(patient) {
  const planData = patient.medicationPlan
  const medications = Array.isArray(planData?.medications) ? planData.medications : []
  if (!medications.length) return
  if (plans.some((plan) => plan.patientId === patient.id && plan.source === '患者建档生成')) return

  const firstStartDate = planData.startDate || medications[0]?.startDate || today
  const maxDuration = Math.max(...medications.map((item) => Number(item.durationDays) || 30))
  const planCode = `PLAN-${String(Date.now()).slice(-8)}-${patient.id}`
  const generatedPlan = {
    id: nextId(plans),
    patientId: patient.id,
    patientName: patient.name,
    title: `${patient.name} 新建用药方案`,
    code: planCode,
    period: `${firstStartDate} 至 ${getPlanEndDate(firstStartDate, maxDuration)}`,
    startDate: firstStartDate,
    endDate: getPlanEndDate(firstStartDate, maxDuration),
    status: '已生效',
    dispatchStatus: patient.deviceNo && patient.deviceNo !== '未绑定' ? '待下发' : '未绑定设备',
    dispatchType: patient.deviceNo && patient.deviceNo !== '未绑定' ? 'warning' : 'info',
    generatedTasks: `已生成 ${medications.length} 种药品任务`,
    source: '患者建档生成',
    reminderCount: planData.reminderGroups?.length || medications.length,
    auditSummary: medications.map((item) => item.precaution).filter(Boolean).join('；') || '按处方执行',
    drugs: medications.map((item) => ({
      name: item.name,
      dose: item.dosage || '1片/次',
      frequency: item.frequency || '每日1次',
      time: item.timingMeals || item.reminders?.[0]?.tag || '餐后',
      guide: item.precaution || '请按处方和医药师建议执行。',
      specification: item.specification,
      quantity: item.quantity,
      startDate: item.startDate || firstStartDate,
      endDate: item.endDate || getPlanEndDate(item.startDate || firstStartDate, item.durationDays || 30),
      durationDays: item.durationDays || 30,
      reminders: item.reminders || []
    }))
  }

  plans.unshift(generatedPlan)

  generatedPlan.drugs.forEach((drug) => {
    const slots = drug.reminders?.length ? drug.reminders : [{ time: '08:00', tag: drug.time }]
    slots.forEach((slot) => {
      tasks.unshift({
        id: nextId(tasks),
        patientId: patient.id,
        patient: patient.name,
        taskDate: today,
        time: slot.time,
        period: slot.tag,
        drug: drug.name,
        dose: drug.dose,
        frequency: drug.frequency,
        source: '待上报',
        status: '待执行',
        statusType: 'warning',
        suggestion: '新建档案自动生成，待药盒或患者端上报执行结果。',
        planCode,
        reminderType: '药盒语音',
        abnormalLevel: '待观察',
        completedAt: null
      })
    })

    medicationRecords.unshift({
      id: nextId(medicationRecords),
      patientId: patient.id,
      planCode,
      commonName: drug.name,
      dosage: drug.dose,
      time: `${today} ${drug.reminders?.[0]?.time || '08:00'}`,
      status: '待执行',
      statusType: 'warning',
      source: '建档生成',
      createdAt: `${today} 00:00`
    })
  })

  messages.unshift({
    id: nextId(messages),
    patientId: patient.id,
    title: `${patient.name} 用药计划待下发`,
    content: `已生成 ${generatedPlan.drugs.length} 种药品的提醒方案，请确认设备在线后下发。`,
    patient: patient.name,
    receiver: '医药师',
    channel: '后台',
    type: '系统提醒',
    status: '已推送',
    statusType: 'success',
    creationMode: '系统推送',
    creator: '系统',
    createTime: '今日',
    sendTime: '今日',
    cancelTime: '',
    triggerScene: '手动创建',
    triggerSource: '建档生成'
  })
}
