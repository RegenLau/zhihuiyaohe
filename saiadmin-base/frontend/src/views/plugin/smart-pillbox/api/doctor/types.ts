export type StatusType = 'success' | 'warning' | 'danger' | 'primary' | 'info'

export interface SmartPillboxListParams extends Record<string, any> {
  page?: number
  limit?: number
  keyword?: string
}

export interface Patient {
  id: number
  name: string
  gender: string
  age: number
  birthDate?: string
  address?: string
  recordNo: string
  phone: string
  diseases: string[]
  historyDiseases?: string[]
  allergies?: PatientAllergy[]
  contacts?: PatientContact[]
  managementPharmacist?: string
  firstConsultPharmacist?: string
  status?: '正常管理' | '重点关注' | '已归档'
  deviceNo: string
  deviceStatus: string
  deviceStatusType: StatusType
  consent: string
  child: string
  nextReminder: string
  todayDrugs: number
  recentInteraction: string
  completionRate: number
  medicationPlan?: MedicationPlanPayload | Record<string, any>
  taskRisk: string
  breakfastTime?: string
  lunchTime?: string
  dinnerTime?: string
  sleepTime?: string
  createdAt?: string
  updatedAt?: string
  lastActiveAt?: string | null
}

export interface PatientContact {
  id: string
  relation: string
  name: string
  phone: string
  isPrimary: boolean
}

export interface PatientAllergy {
  id: string
  allergenType: 'drug' | 'food' | 'other' | string
  allergen: string
  severity: 'mild' | 'moderate' | 'severe' | string
  reaction: string
}

export interface MedicationReminderSlot {
  time: string
  tag: string
}

export interface MedicationPlanMedication {
  id?: string
  name: string
  genericName?: string
  specification?: string
  quantity?: string
  dosage?: string
  frequency: string
  timingMeals?: string
  startDate?: string
  endDate?: string | null
  durationDays?: number
  reminders?: MedicationReminderSlot[]
  precaution?: string
  manufacturer?: string
}

export interface MedicationPlanPayload {
  startDate?: string
  medications: MedicationPlanMedication[]
  reminderGroups?: {
    time: string
    tag: string
    medicationNames: string[]
  }[]
}

export interface Drug {
  name: string
  dose: string
  frequency: string
  time: string
  guide: string
  specification?: string
  quantity?: string
  startDate?: string
  endDate?: string | null
  durationDays?: number
  reminders?: MedicationReminderSlot[]
  source?: string
}

export interface Plan {
  id: number
  patientId: number
  patientName?: string
  title: string
  code: string
  period: string
  startDate?: string
  endDate?: string | null
  status: string
  dispatchStatus: string
  dispatchType: StatusType
  generatedTasks: string
  source: string
  reminderCount?: number
  auditSummary?: string
  drugs: Drug[]
}

export interface MedicationTask {
  id: number
  patientId: number
  patient?: string
  taskDate?: string
  time: string
  period: string
  drug: string
  dose: string
  frequency?: string
  source: string
  status: string
  statusType: StatusType
  suggestion: string
  planCode?: string
  reminderType?: string
  abnormalLevel?: string
  completedAt?: string | null
}

export interface Device {
  id: number
  sn: string
  bindPatientId?: number | null
  patient: string
  status: string
  statusType: StatusType
  battery: string
  batteryLevel?: number
  wifi: string
  wifiConnected?: boolean
  firmware: string
  bindDate: string
  lastHeartbeat?: string | null
  offlineHours?: number
  dispatchStatus?: string
}

export interface ReminderMessage {
  id: number
  patientId?: number
  title: string
  content: string
  patient: string
  receiver: string
  channel: string
  type: string
  status: string
  statusType: StatusType
  createTime: string
  sendTime?: string
  triggerSource?: string
}

export interface Conversation {
  id: number
  patientId: number
  patient?: string
  deviceNo?: string
  time: string
  type: string
  status: string
  statusType: StatusType
  patientText?: string
  deviceText?: string
  note?: string
}

export interface DashboardStatCard {
  label: string
  value: string
  note: string
  icon: string
}

export interface TrendBar {
  label: string
  done: number
  miss: number
}

export interface RiskItem {
  type: StatusType
  timestamp: string
  title: string
  note: string
  patient?: string
  source?: string
  level?: string
  action?: string
  route?: string
  icon?: string
}

export interface DashboardProgressItem {
  label: string
  value: string
  percent: number
  note: string
  route: string
}

export interface DashboardQuickAction {
  label: string
  icon: string
  route: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}

export interface DashboardWeeklyBar {
  label: string
  value: number
  count: string
  active?: boolean
}

export interface DashboardSidePanel {
  metrics: DashboardProgressItem[]
  actions: DashboardQuickAction[]
  weeklyBars: DashboardWeeklyBar[]
  weeklySummary: {
    value: string
    note: string
  }
}

export interface DashboardData {
  statCards: DashboardStatCard[]
  trendBars: TrendBar[]
  risks: RiskItem[]
  sidePanel: DashboardSidePanel
}

export interface AgreementSettings {
  name: string
  version: string
  status: number
  summary: string
  content: string
}

export interface MedicationRecord {
  id: number
  patientId: number
  planCode: string
  commonName: string
  dosage: string
  time: string
  status: string
  statusType: StatusType
  source: string
  createdAt: string
}

export interface HealthRecord {
  id: number
  patientId: number
  patient: string
  date: string
  morningBP: string | null
  eveningBP: string | null
  fastingGlucose: number | null
  responded: boolean
  riskLevel: string
  note: string
}

export interface HealthSummary {
  avgSystolic: number
  avgDiastolic: number
  avgGlucose: number
  complianceRate: number
  systolicTrend: number
  diastolicTrend: number
  glucoseTrend: number
}
