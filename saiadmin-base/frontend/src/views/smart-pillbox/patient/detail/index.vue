<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <template v-if="patient.id">
        <div class="patient-detail-stack">
          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <div class="detail-hero">
              <div>
                <h3>{{ patient.name }} · {{ patient.recordNo }}</h3>
                <p class="smart-muted" style="margin: 6px 0 0">
                  {{ patient.gender }} · {{ patient.age }} 岁 · {{ patient.phone }} ·
                  {{ patient.managementPharmacist || '未分配药师' }}
                </p>
                <div class="chip-row" style="margin-top: 12px">
                  <a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag>
                  <a-tag :color="patient.status === '重点关注' ? 'orange' : 'green'">
                    {{ patient.status || '正常管理' }}
                  </a-tag>
                  <a-tag :color="patient.consent === '已同意' ? 'green' : 'orange'">{{ patient.consent || '未确认同意' }}</a-tag>
                </div>
              </div>
              <div class="detail-action-stack">
                <a-space wrap>
                  <a-button
                    v-if="!isEditing"
                    :status="patient.status === '重点关注' ? 'warning' : undefined"
                    :disabled="!patient.id"
                    :loading="statusSaving"
                    @click="toggleFocusPatient"
                  >
                    <template #icon><sa-icon icon="ri:flag-line" :size="16" /></template>
                    {{ patient.status === '重点关注' ? '取消重点标注' : '标注重点患者' }}
                  </a-button>
                  <a-button v-if="isEditing" @click="cancelEdit">
                    <template #icon><sa-icon icon="ri:close-line" :size="16" /></template>
                    取消编辑
                  </a-button>
                  <a-button v-else type="primary" :disabled="!patient.id" @click="startEdit">
                    <template #icon><sa-icon icon="ri:edit-2-line" :size="16" /></template>
                    编辑信息
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-card>
          </div>

          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <a-tabs v-model:active-key="activeTab">
              <a-tab-pane key="basic" title="核心信息">
                <a-form v-if="isEditing" :model="basicForm" layout="vertical">
                  <a-row :gutter="16">
                    <a-col :xs="24" :md="12"><a-form-item label="患者姓名"><a-input v-model="basicForm.name" placeholder="请输入患者姓名" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="手机号"><a-input v-model="basicForm.phone" placeholder="请输入手机号" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12">
                      <a-form-item label="性别">
                        <a-select v-model="basicForm.gender" placeholder="请选择性别"><a-option value="男">男</a-option><a-option value="女">女</a-option></a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="出生年月日"><a-date-picker v-model="basicForm.birthDate" placeholder="请选择出生年月日" style="width: 100%" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="管理药师"><a-input v-model="basicForm.managementPharmacist" placeholder="请输入管理药师" /></a-form-item></a-col>
                  </a-row>
                  <div class="detail-edit-actions">
                    <a-button @click="cancelEdit"><template #icon><sa-icon icon="ri:close-line" :size="16" /></template>取消</a-button>
                    <a-button type="primary" :loading="saving" @click="saveBasicInfo">
                      <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
                      保存基础信息
                    </a-button>
                  </div>
                </a-form>
                <div v-else class="detail-basic-stack">
                  <div class="tab-toolbar">
                    <div>
                      <h4>档案信息</h4>
                      <p>保留患者识别、药盒绑定和管理状态。</p>
                    </div>
                  </div>
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="出生年月">{{ patient.birthDate || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="管理药师">{{ patient.managementPharmacist || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="药盒设备">
                      <a-link v-if="canOpenDeviceRecord" @click="openDeviceRecord">{{ patient.deviceNo }}</a-link>
                      <template v-else>{{ patient.deviceNo || '-' }}</template>
                    </a-descriptions-item>
                    <a-descriptions-item label="设备状态"><a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag></a-descriptions-item>
                    <a-descriptions-item label="知情同意"><a-tag :color="patient.consent === '已同意' ? 'green' : 'orange'">{{ patient.consent || '未同意' }}</a-tag></a-descriptions-item>
                    <a-descriptions-item label="最近互动">{{ patient.recentInteraction || '-' }}</a-descriptions-item>
                  </a-descriptions>
                  <a-divider />
                  <div class="tab-toolbar">
                    <div>
                      <h4>健康背景</h4>
                      <p>只展示影响用药判断的基础信息。</p>
                    </div>
                  </div>
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="慢病史">
                      <a-space direction="vertical" fill :size="0">
                        <div v-if="patient.diseases?.length" class="chip-row">
                          <a-tag v-for="item in patient.diseases" :key="item">{{ item }}</a-tag>
                        </div>
                        <a-typography-text v-else type="secondary">暂无慢病史记录</a-typography-text>
                      </a-space>
                    </a-descriptions-item>
                    <a-descriptions-item label="过敏史">
                      <a-space direction="vertical" fill :size="0">
                        <div v-if="displayAllergyNames.length" class="chip-row">
                          <a-tag v-for="item in displayAllergyNames" :key="item">{{ item }}</a-tag>
                        </div>
                        <a-typography-text v-else type="secondary">暂无过敏史记录</a-typography-text>
                      </a-space>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>

              <a-tab-pane key="records" title="用药记录">
                <div class="health-tab-pane">
                  <div class="tab-toolbar">
                    <div>
                      <h4>用药执行</h4>
                      <p>保留最近服药记录和当前执行状态。</p>
                    </div>
                    <a-space wrap>
                      <a-button size="small" @click="router.push(`/doctor/plans?patientId=${patient.id}`)">用药计划</a-button>
                      <a-button size="small" type="primary" @click="router.push(`/doctor/tasks?patientId=${patient.id}`)">今日任务</a-button>
                    </a-space>
                  </div>
                  <a-descriptions :column="4" bordered>
                    <a-descriptions-item label="服药完成率">{{ patient.completionRate ?? 0 }}%</a-descriptions-item>
                    <a-descriptions-item label="今日用药">{{ patient.todayDrugs || 0 }} 种</a-descriptions-item>
                    <a-descriptions-item label="下一提醒">{{ patient.nextReminder || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="当前状态"><a-tag :color="taskRiskTagColor">{{ patient.taskRisk || '正常' }}</a-tag></a-descriptions-item>
                  </a-descriptions>
                  <a-table
                    row-key="id"
                    :data="medicineRecords"
                    :pagination="false"
                    :scroll="{ x: 700 }"
                    class="smart-block-gap-sm"
                    bordered
                  >
                    <template #columns>
                      <a-table-column title="时间" data-index="time" :width="170" />
                      <a-table-column title="药品" data-index="commonName" />
                      <a-table-column title="剂量" data-index="dosage" :width="120" />
                      <a-table-column title="来源" data-index="source" :width="130" />
                      <a-table-column title="状态" :width="110">
                        <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </a-tab-pane>

              <a-tab-pane key="reports" title="上报信息">
                <div class="health-tab-pane">
                  <div class="tab-toolbar">
                    <div>
                      <h4>健康数据</h4>
                      <p>展示最近上报数据，异常处理进入健康数据页。</p>
                    </div>
                    <a-button size="small" @click="router.push(`/doctor/health-data?patientId=${patient.id}`)">
                      查看全部
                    </a-button>
                  </div>
                  <a-descriptions :column="4" bordered>
                    <a-descriptions-item label="平均血压">{{ averageBloodPressure }}</a-descriptions-item>
                    <a-descriptions-item label="平均空腹血糖">{{ averageGlucose }}</a-descriptions-item>
                    <a-descriptions-item label="响应率">{{ healthSummary.complianceRate ?? 0 }}%</a-descriptions-item>
                    <a-descriptions-item label="趋势">{{ healthTrendText }}</a-descriptions-item>
                  </a-descriptions>
                  <a-table
                    v-if="healthRecords.length"
                    row-key="id"
                    :data="healthRecords"
                    :pagination="false"
                    size="small"
                    :scroll="{ x: 640 }"
                    bordered
                  >
                    <template #columns>
                      <a-table-column title="日期" data-index="date" :width="120" />
                      <a-table-column title="晨间血压" data-index="morningBP" :width="120">
                        <template #cell="{ record }">{{ record.morningBP || '未上报' }}</template>
                      </a-table-column>
                      <a-table-column title="晚间血压" data-index="eveningBP" :width="120">
                        <template #cell="{ record }">{{ record.eveningBP || '未上报' }}</template>
                      </a-table-column>
                      <a-table-column title="空腹血糖" data-index="fastingGlucose" :width="130">
                        <template #cell="{ record }">{{ formatGlucose(record.fastingGlucose) }}</template>
                      </a-table-column>
                      <a-table-column title="风险" data-index="riskLevel" :width="100">
                        <template #cell="{ record }"><a-tag :color="statusColor(record.riskLevel)">{{ record.riskLevel }}</a-tag></template>
                      </a-table-column>
                      <a-table-column title="备注" data-index="note" />
                    </template>
                  </a-table>
                  <a-empty v-else description="暂无健康数据" />
                </div>

                <a-divider />

                <div class="tab-toolbar">
                  <div>
                    <h4>缺药上报</h4>
                    <p>展示最近补药风险，处理明细进入缺药上报页。</p>
                  </div>
                  <a-button size="small" @click="router.push(`/doctor/health-data?tab=shortage&patientId=${patient.id}`)">查看全部</a-button>
                </div>
                <a-table row-key="id" :data="shortageRecords" :pagination="false" :scroll="{ x: 680 }" bordered>
                  <template #columns>
                    <a-table-column title="药品" data-index="medicine" />
                    <a-table-column title="剩余量" data-index="remainingAmount" :width="110" />
                    <a-table-column title="预计可用" data-index="expectedDays" :width="110">
                      <template #cell="{ record }">{{ record.expectedDays }} 天</template>
                    </a-table-column>
                    <a-table-column title="来源" data-index="source" :width="130" />
                    <a-table-column title="状态" data-index="status" :width="100">
                      <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
                    </a-table-column>
                    <a-table-column title="处理结果" data-index="result" />
                  </template>
                </a-table>

                <a-divider />

                <div class="tab-toolbar">
                  <div>
                    <h4>知情同意</h4>
                    <p>只展示最近一次确认信息，完整记录在系统设置查看。</p>
                  </div>
                </div>
                <a-descriptions :column="4" bordered>
                  <a-descriptions-item label="当前状态"><a-tag :color="patient.consent === '已同意' ? 'green' : 'orange'">{{ patient.consent || '未同意' }}</a-tag></a-descriptions-item>
                  <a-descriptions-item label="协议版本">{{ latestConsentRecord.version || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="确认时间">{{ latestConsentRecord.confirmTime || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="确认端">{{ latestConsentRecord.confirmTerminal || '-' }}</a-descriptions-item>
                </a-descriptions>
              </a-tab-pane>
            </a-tabs>
          </a-card>
          </div>
        </div>
      </template>
      <a-empty v-else description="未找到患者档案" />
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { healthApi, patientApi, settingsApi, shortageApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { calculateAge, formatDateTime, getPayload, getRecords, pickQueryValue, statusColor, unwrapAllergyNames } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const statusSaving = ref(false)
const activeTab = ref('basic')
const isEditing = ref(false)
const patient = reactive({})
const medicineRecords = ref([])
const healthSummary = reactive({})
const healthRecords = ref([])
const shortageRecords = ref([])
const consentRecords = ref([])

const basicForm = reactive({ name: '', phone: '', gender: '男', birthDate: '', managementPharmacist: '' })

const patientId = computed(() => {
  const value = pickQueryValue(route.query.patientId, route.query.id)
  return value ? String(value) : ''
})
const taskRiskTagColor = computed(() => {
  const value = String(patient.taskRisk || '')
  if (!value || value === '正常') return 'green'
  if (value.includes('漏服') || value.includes('异常')) return 'red'
  if (value.includes('无计划')) return 'orange'
  return statusColor(value)
})
const displayAllergyNames = computed(() => unwrapAllergyNames(patient.allergies || []))
const latestConsentRecord = computed(() => consentRecords.value[0] || {})
const canOpenDeviceRecord = computed(() => Boolean(patient.deviceNo && !['-', '未绑定'].includes(String(patient.deviceNo))))
const averageBloodPressure = computed(() => {
  return healthSummary.avgSystolic ? `${healthSummary.avgSystolic}/${healthSummary.avgDiastolic}` : '-'
})
const averageGlucose = computed(() => (healthSummary.avgGlucose ? `${healthSummary.avgGlucose} mmol/L` : '-'))
const healthTrendText = computed(() => {
  const bpTrend = Number(healthSummary.systolicTrend || 0)
  const glucoseTrend = Number(healthSummary.glucoseTrend || 0)
  const bpText = bpTrend > 0 ? `收缩压 +${bpTrend}` : `收缩压 ${bpTrend}`
  const glucoseText = glucoseTrend > 0 ? `血糖 +${glucoseTrend}` : `血糖 ${glucoseTrend}`
  return `${bpText}，${glucoseText}`
})
const formatGlucose = (value) => (typeof value === 'number' ? `${value} mmol/L` : '未上报')

const syncEditForms = () => {
  Object.assign(basicForm, {
    name: patient.name || '',
    phone: patient.phone || '',
    gender: patient.gender || '男',
    birthDate: patient.birthDate || '',
    managementPharmacist: patient.managementPharmacist || ''
  })
}

const startEdit = () => {
  syncEditForms()
  isEditing.value = true
}

const cancelEdit = () => {
  syncEditForms()
  isEditing.value = false
}

const openDeviceRecord = () => {
  if (!canOpenDeviceRecord.value) return
  router.push({ path: '/doctor/devices', query: { sn: patient.deviceNo } })
}

const updatePatient = async (payload, successText) => {
  saving.value = true
  try {
    const response = await patientApi.update({ ...patient, ...payload, updatedAt: formatDateTime() })
    Object.assign(patient, getPayload(response))
    syncEditForms()
    Message.success(successText)
  } finally {
    saving.value = false
  }
}

const saveBasicInfo = () => updatePatient({ ...basicForm, age: calculateAge(basicForm.birthDate) || patient.age }, '基础信息已保存')

const toggleFocusPatient = async () => {
  const nextStatus = patient.status === '重点关注' ? '正常管理' : '重点关注'
  statusSaving.value = true
  try {
    const response = await patientApi.update({ ...patient, status: nextStatus, updatedAt: formatDateTime() })
    Object.assign(patient, getPayload(response))
    syncEditForms()
    Message.success(nextStatus === '重点关注' ? '已标注为重点患者' : '已取消重点标注')
  } finally {
    statusSaving.value = false
  }
}

const loadAll = async () => {
  if (!patientId.value) {
    Object.keys(patient).forEach((key) => delete patient[key])
    medicineRecords.value = []
    Object.keys(healthSummary).forEach((key) => delete healthSummary[key])
    healthRecords.value = []
    shortageRecords.value = []
    consentRecords.value = []
    isEditing.value = false
    syncEditForms()
    return
  }
  loading.value = true
  try {
    const [patientResponse, recordsResponse, healthSummaryResponse, healthRecordsResponse, shortageResponse, consentResponse] = await Promise.all([
      patientApi.read(patientId.value),
      patientApi.medicineRecords(patientId.value),
      healthApi.summary(patientId.value),
      healthApi.list({ patientId: patientId.value, page: 1, limit: 3 }),
      shortageApi.list({ patientId: patientId.value, page: 1, limit: 5 }),
      settingsApi.consentRecords({ patientId: patientId.value, page: 1, limit: 5 })
    ])
    Object.keys(patient).forEach((key) => delete patient[key])
    Object.assign(patient, getPayload(patientResponse))
    medicineRecords.value = getRecords(recordsResponse)
    Object.keys(healthSummary).forEach((key) => delete healthSummary[key])
    Object.assign(healthSummary, getPayload(healthSummaryResponse))
    healthRecords.value = getRecords(healthRecordsResponse)
    shortageRecords.value = getRecords(shortageResponse)
    consentRecords.value = getRecords(consentResponse)
    syncEditForms()
    isEditing.value = false
  } finally {
    loading.value = false
  }
}

watch(() => [route.query.patientId, route.query.id], loadAll)
onMounted(loadAll)
</script>
