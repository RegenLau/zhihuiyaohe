<template>
  <div class="smart-page">
    <div class="ma-content-block p-4">
      <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16">
        <a-grid-item v-for="item in overviewCards" :key="item.label" :span="6">
          <a-space direction="vertical" :size="2">
            <a-typography-text type="secondary">{{ item.label }}</a-typography-text>
            <a-typography-title :heading="5" style="margin: 0">{{ item.value }}</a-typography-title>
            <div class="smart-muted">{{ item.note }}</div>
          </a-space>
        </a-grid-item>
      </a-grid>
    </div>

    <div class="ma-content-block p-3">
      <a-tabs v-model:active-key="activeTab" @change="refreshData">
        <a-tab-pane key="health" title="慢病指标">
          <sa-table
            ref="crudRef"
            :options="tableOptions"
            :columns="columns"
            :searchForm="searchForm"
            @resetSearch="handleResetSearch">
            <template #tableSearch>
              <a-col :xs="24" :md="7">
                <a-form-item field="keyword" label="关键词">
                  <a-input v-model="searchForm.keyword" placeholder="关键词：患者姓名或备注" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="6">
                <a-form-item field="riskLevel" label="风险级别">
                  <a-select v-model="searchForm.riskLevel" placeholder="全部" allow-clear>
                    <a-option value="正常">正常</a-option>
                    <a-option value="关注">关注</a-option>
                    <a-option value="高风险">高风险</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="6">
                <a-form-item field="patientId" label="患者 ID">
                  <a-input v-model="searchForm.patientId" placeholder="患者 ID" allow-clear />
                </a-form-item>
              </a-col>
            </template>

            <template #tableBeforeButtons>
              <a-button type="primary" @click="openHealthDialog">
                <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                新增指标
              </a-button>
            </template>

            <template #tableAfterButtons>
              <a-button :loading="loading" @click="refreshData">
                <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
                刷新
              </a-button>
            </template>

            <template #patient="{ record }">
              <a-link @click="router.push(`/doctor/patient-detail?patientId=${record.patientId}`)">{{ record.patient }}</a-link>
            </template>
            <template #bloodPressure="{ record }">
              <span>晨 {{ record.morningBP || '未上报' }}</span>
              <div class="smart-muted">晚 {{ record.eveningBP || '未上报' }}</div>
            </template>
            <template #fastingGlucose="{ record }">
              {{ record.fastingGlucose == null ? '未上报' : `${record.fastingGlucose} mmol/L` }}
            </template>
            <template #responded="{ record }">
              <a-tag :color="record.responded ? 'green' : 'red'">{{ record.responded ? '已响应' : '未响应' }}</a-tag>
            </template>
            <template #riskLevel="{ record }">
              <a-tag :color="statusColor(record.riskLevel)">{{ record.riskLevel }}</a-tag>
            </template>
            <template #operationCell="{ record }">
              <a-space size="mini">
                <a-tooltip content="标记已响应">
                  <a-button size="mini" type="primary" :disabled="record.responded" @click="markResponded(record)">
                    <template #icon><sa-icon icon="ri:check-line" :size="14" /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="创建提醒">
                  <a-button size="mini" @click="createHealthReminder(record)">
                    <template #icon><sa-icon icon="ri:notification-3-line" :size="14" /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip content="患者详情">
                  <a-button size="mini" @click="router.push(`/doctor/patient-detail?patientId=${record.patientId}`)">
                    <template #icon><sa-icon icon="ri:eye-line" :size="14" /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </sa-table>
        </a-tab-pane>

        <a-tab-pane key="shortage" title="缺药上报">
          <div class="smart-toolbar smart-row is-between smart-block-gap-sm">
            <a-space wrap>
              <a-input-search v-model="shortageKeyword" placeholder="搜索患者、药品、来源" allow-clear @search="loadShortageReports" @clear="loadShortageReports" />
              <a-select v-model="shortageStatus" placeholder="全部状态" allow-clear style="width: 160px" @change="loadShortageReports" @clear="loadShortageReports">
                <a-option value="待处理">待处理</a-option>
                <a-option value="处理中">处理中</a-option>
                <a-option value="已处理">已处理</a-option>
              </a-select>
            </a-space>
            <a-space wrap>
              <a-button type="primary" @click="openShortageDialog">
                <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                新增缺药上报
              </a-button>
              <a-button :loading="shortageLoading" @click="loadShortageReports">
                <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
                刷新
              </a-button>
            </a-space>
          </div>

          <a-table row-key="id" :data="shortageReports" :loading="shortageLoading" :pagination="false" :scroll="{ x: 980 }" class="smart-block-gap-sm">
            <template #columns>
              <a-table-column title="患者" data-index="patient" :width="120">
                <template #cell="{ record }">
                  <a-link @click="router.push(`/doctor/patient-detail?patientId=${record.patientId}`)">{{ record.patient }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="药品" data-index="medicine" :width="180" />
              <a-table-column title="剩余量" data-index="remainingAmount" :width="110" />
              <a-table-column title="预计可用" data-index="expectedDays" :width="110">
                <template #cell="{ record }">{{ record.expectedDays }} 天</template>
              </a-table-column>
              <a-table-column title="来源" data-index="source" :width="140" />
              <a-table-column title="状态" data-index="status" :width="110">
                <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
              </a-table-column>
              <a-table-column title="处理结果" data-index="result" />
              <a-table-column title="操作" :width="190">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button size="mini" type="primary" :disabled="record.status === '已处理'" @click="markShortageHandled(record)">处理</a-button>
                    <a-button size="mini" @click="createShortageReminder(record)">提醒</a-button>
                    <a-button size="mini" @click="router.push(`/doctor/plans?patientId=${record.patientId}`)">计划</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>

    <a-modal v-model:visible="healthDialogVisible" title="新增慢病指标" width="min(720px, calc(100vw - 32px))" @ok="saveHealthReport">
      <a-form :model="healthForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="患者" required>
              <a-select v-model="healthForm.patientId" placeholder="请选择患者" allow-search @change="syncHealthPatient">
                <a-option v-for="patient in patientOptions" :key="patient.id" :value="String(patient.id)">
                  {{ patient.name }} · {{ patient.recordNo }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12"><a-form-item label="日期"><a-date-picker v-model="healthForm.date" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="风险级别"><a-select v-model="healthForm.riskLevel"><a-option value="正常">正常</a-option><a-option value="关注">关注</a-option><a-option value="高风险">高风险</a-option></a-select></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="晨间血压"><a-input v-model="healthForm.morningBP" placeholder="如 135/85" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="晚间血压"><a-input v-model="healthForm.eveningBP" placeholder="如 128/82" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="空腹血糖"><a-input-number v-model="healthForm.fastingGlucose" style="width: 100%" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="备注"><a-textarea v-model="healthForm.note" placeholder="请输入处理建议或上报说明" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="shortageDialogVisible" title="新增缺药上报" width="min(720px, calc(100vw - 32px))" @ok="saveShortageReport">
      <a-form :model="shortageForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="患者" required>
              <a-select v-model="shortageForm.patientId" placeholder="请选择患者" allow-search @change="syncShortagePatient">
                <a-option v-for="patient in patientOptions" :key="patient.id" :value="String(patient.id)">
                  {{ patient.name }} · {{ patient.recordNo }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12"><a-form-item label="药品名称" required><a-input v-model="shortageForm.medicine" placeholder="请输入药品名称" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="剩余量"><a-input v-model="shortageForm.remainingAmount" placeholder="如 5片" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="预计可用天数"><a-input-number v-model="shortageForm.expectedDays" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="来源"><a-select v-model="shortageForm.source"><a-option value="药盒余量上报">药盒余量上报</a-option><a-option value="患者小程序">患者小程序</a-option><a-option value="子女小程序">子女小程序</a-option><a-option value="后台录入">后台录入</a-option></a-select></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="处理建议"><a-textarea v-model="shortageForm.result" placeholder="请输入建议或处理结果" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { healthApi, patientApi, shortageApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const shortageLoading = ref(false)
const crudRef = ref()
const records = ref([])
const shortageReports = ref([])
const patientOptions = ref([])
const activeTab = ref(String(pickQueryValue(route.query.tab)) || 'health')
const shortageKeyword = ref('')
const shortageStatus = ref('')
const healthDialogVisible = ref(false)
const shortageDialogVisible = ref(false)

const searchForm = reactive({ keyword: '', riskLevel: '', patientId: String(pickQueryValue(route.query.patientId)) })
const healthForm = reactive({
  patientId: '',
  patient: '',
  date: '2026-05-21',
  morningBP: '',
  eveningBP: '',
  fastingGlucose: null,
  responded: true,
  riskLevel: '正常',
  note: ''
})
const shortageForm = reactive({
  patientId: '',
  patient: '',
  medicine: '',
  remainingAmount: '',
  expectedDays: 7,
  source: '后台录入',
  result: ''
})

const tableOptions = reactive({
  api: loadData,
  pageLayout: 'normal',
  showTools: true,
  showIndex: false,
  operationColumn: true,
  operationColumnText: '操作',
  operationColumnWidth: 132,
  operationColumnFixed: false,
  add: { show: false },
  edit: { show: false },
  delete: { show: false }
})
const columns = reactive([
  { title: '患者', dataIndex: 'patient', width: 130 },
  { title: '上报日期', dataIndex: 'date', width: 130 },
  { title: '血压', dataIndex: 'bloodPressure', width: 160 },
  { title: '空腹血糖', dataIndex: 'fastingGlucose', width: 130 },
  { title: '响应状态', dataIndex: 'responded', width: 110 },
  { title: '风险级别', dataIndex: 'riskLevel', width: 110 },
  { title: '备注', dataIndex: 'note' }
])

const overviewCards = computed(() => {
  const responded = records.value.filter((item) => item.responded).length
  const healthRisk = records.value.filter((item) => item.riskLevel !== '正常').length
  const pendingShortage = shortageReports.value.filter((item) => item.status !== '已处理').length
  const urgentShortage = shortageReports.value.filter((item) => Number(item.expectedDays) <= 7).length
  return [
    { label: '慢病记录', value: records.value.length, note: `${responded} 条已响应` },
    { label: '指标异常', value: healthRisk, note: '关注或高风险' },
    { label: '缺药待处理', value: pendingShortage, note: '需创建提醒或调整计划' },
    { label: '7天内缺药', value: urgentShortage, note: '优先处理补药' }
  ]
})

async function loadData(params = {}) {
  loading.value = true
  try {
    const response = await healthApi.list(params)
    const rows = getRecords(response)
    const payload = getPayload(response)
    records.value = rows
    return { data: { data: rows, total: payload?.total || rows.length } }
  } finally {
    loading.value = false
  }
}
const loadShortageReports = async () => {
  shortageLoading.value = true
  try {
    const response = await shortageApi.list({
      keyword: shortageKeyword.value,
      status: shortageStatus.value,
      patientId: searchForm.patientId,
      limit: 100
    })
    shortageReports.value = getRecords(response)
  } finally {
    shortageLoading.value = false
  }
}
const loadPatients = async () => {
  const response = await patientApi.list({ page: 1, limit: 100 })
  patientOptions.value = getRecords(response)
}
const syncPatientToForm = (id, target) => {
  const patient = patientOptions.value.find((item) => String(item.id) === String(id))
  target.patient = patient?.name || ''
}
const syncHealthPatient = (id) => syncPatientToForm(id, healthForm)
const syncShortagePatient = (id) => syncPatientToForm(id, shortageForm)
const handleResetSearch = () => {
  Object.assign(searchForm, { keyword: '', riskLevel: '', patientId: '' })
}
const refreshData = async () => {
  if (activeTab.value === 'health') {
    crudRef.value?.refresh()
  }
  await loadShortageReports()
}
const markResponded = async (record) => {
  await healthApi.update({ ...record, responded: true, responseTime: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  Message.success('健康指标已标记响应')
  refreshData()
}
const openHealthDialog = () => {
  Object.assign(healthForm, {
    patientId: searchForm.patientId || '',
    patient: '',
    date: '2026-05-21',
    morningBP: '',
    eveningBP: '',
    fastingGlucose: null,
    responded: true,
    riskLevel: '正常',
    note: ''
  })
  syncHealthPatient(healthForm.patientId)
  healthDialogVisible.value = true
}
const saveHealthReport = async () => {
  if (!healthForm.patientId || !healthForm.patient) {
    Message.warning('请填写患者 ID 和患者姓名')
    return false
  }
  await healthApi.save({ ...healthForm })
  Message.success('慢病指标已新增')
  healthDialogVisible.value = false
  refreshData()
}
const openShortageDialog = () => {
  Object.assign(shortageForm, {
    patientId: searchForm.patientId || '',
    patient: '',
    medicine: '',
    remainingAmount: '',
    expectedDays: 7,
    source: '后台录入',
    result: '建议确认余药量并创建补药或复诊提醒'
  })
  syncShortagePatient(shortageForm.patientId)
  shortageDialogVisible.value = true
}
const saveShortageReport = async () => {
  if (!shortageForm.patientId || !shortageForm.patient || !shortageForm.medicine) {
    Message.warning('请填写患者和药品信息')
    return false
  }
  await shortageApi.save({ ...shortageForm })
  Message.success('缺药上报已新增')
  shortageDialogVisible.value = false
  await loadShortageReports()
}
const markShortageHandled = async (record) => {
  await shortageApi.update({ ...record, status: '已处理', statusType: 'success', handler: '医药师', result: record.result || '已完成补药提醒处理' })
  Message.success('缺药上报已处理')
  await loadShortageReports()
}
const createHealthReminder = (record) => {
  router.push({
    path: '/doctor/messages',
    query: {
      action: 'create',
      patient: record.patient,
      type: '慢病指标异常提醒',
      receiver: '患者 / 子女',
      title: `${record.patient}健康数据跟进`,
      content: `${record.date} 上报数据为 ${record.riskLevel}，请确认血压、血糖和用药情况。`
    }
  })
}
const createShortageReminder = (record) => {
  router.push({
    path: '/doctor/messages',
    query: {
      action: 'create',
      patient: record.patient,
      type: '缺药提醒',
      receiver: '患者 / 子女',
      title: `${record.patient}${record.medicine}缺药提醒`,
      content: `${record.medicine}剩余 ${record.remainingAmount}，预计可用 ${record.expectedDays} 天，请确认补药或复诊安排。`
    }
  })
}

watch(
  () => route.query.tab,
  (value) => {
    if (value) activeTab.value = String(pickQueryValue(value))
  }
)

onMounted(async () => {
  await loadPatients()
  await refreshData()
})
</script>
