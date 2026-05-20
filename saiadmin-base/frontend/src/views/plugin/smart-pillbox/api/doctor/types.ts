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
  recordNo: string
  phone: string
  diseases: string[]
  deviceNo: string
  deviceStatus: string
  deviceStatusType: StatusType
  consent: string
  child: string
  nextReminder: string
  todayDrugs: number
  recentInteraction: string
  completionRate: number
  taskRisk: string
}

export interface Drug {
  name: string
  dose: string
  frequency: string
  time: string
  guide: string
}

export interface Plan {
  id: number
  patientId: number
  title: string
  code: string
  period: string
  status: string
  dispatchStatus: string
  dispatchType: StatusType
  generatedTasks: string
  source: string
  drugs: Drug[]
}

export interface MedicationTask {
  id: number
  patientId: number
  time: string
  period: string
  drug: string
  dose: string
  source: string
  status: string
  statusType: StatusType
  suggestion: string
}

export interface Device {
  id: number
  sn: string
  patient: string
  status: string
  statusType: StatusType
  battery: string
  wifi: string
  firmware: string
  bindDate: string
}

export interface ReminderMessage {
  id: number
  title: string
  content: string
  patient: string
  receiver: string
  channel: string
  type: string
  status: string
  statusType: StatusType
  createTime: string
}

export interface Conversation {
  id: number
  patientId: number
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
