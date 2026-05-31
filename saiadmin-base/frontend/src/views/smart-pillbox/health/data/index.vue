<template>
  <div class="smart-page">
    <div class="ma-content-block p-3">
      <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
        <a-tab-pane key="health" title="慢病指标">
          <sa-table
            ref="crudRef"
            :options="tableOptions"
            :columns="columns"
            :searchForm="searchForm"
            @resetSearch="handleResetSearch">
            <template #tableSearch>
              <a-col :xs="24" :md="8" class="health-search-col">
                <a-form-item field="keyword" label="患者姓名">
                  <a-input v-model="searchForm.keyword" placeholder="请输入患者姓名" allow-clear />
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
              <a-button :loading="shortageLoading" @click="loadShortageReports">
                <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
                刷新
              </a-button>
            </a-space>
          </div>

          <a-table row-key="id" :data="shortageReports" :loading="shortageLoading" :pagination="false" :scroll="{ x: 1160 }" class="smart-block-gap-sm">
            <template #columns>
              <a-table-column title="患者" data-index="patient" :width="110">
                <template #cell="{ record }">
                  <a-link @click="router.push(`/doctor/patient-detail?patientId=${record.patientId}`)">{{ record.patient }}</a-link>
                </template>
              </a-table-column>
              <a-table-column title="药品" data-index="medicine" :width="170" />
              <a-table-column title="剩余量" data-index="remainingAmount" :width="90" />
              <a-table-column title="预计可用天数" data-index="expectedDays" :width="120">
                <template #cell="{ record }">{{ record.expectedDays }} 天</template>
              </a-table-column>
              <a-table-column title="上报来源" data-index="source" :width="100" />
              <a-table-column title="上报时间" data-index="reportTime" :width="150" />
              <a-table-column title="处理状态" data-index="status" :width="100">
                <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
              </a-table-column>
              <a-table-column title="处理人" data-index="handler" :width="90">
                <template #cell="{ record }">{{ record.handler || '-' }}</template>
              </a-table-column>
              <a-table-column title="操作" :width="90">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button size="mini" :type="record.status === '已处理' ? 'text' : 'primary'" @click="openShortageProcessDialog(record)">
                      {{ record.status === '已处理' ? '查看' : '处理' }}
                    </a-button>
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
          <a-col :xs="24" :md="12"><a-form-item label="晨间血压"><a-input v-model="healthForm.morningBP" placeholder="如 135/85" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="晚间血压"><a-input v-model="healthForm.eveningBP" placeholder="如 128/82" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="空腹血糖"><a-input-number v-model="healthForm.fastingGlucose" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="数据来源">
              <a-select v-model="healthForm.source">
                <a-option value="患者端">患者端</a-option>
                <a-option value="家属端">家属端</a-option>
                <a-option value="药盒">药盒</a-option>
                <a-option value="后台创建">后台创建</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="shortageProcessDialogVisible" :title="shortageProcessReadonly ? '缺药上报详情' : '处理缺药上报'" width="min(720px, calc(100vw - 32px))">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="患者">{{ currentShortage.patient }}</a-descriptions-item>
        <a-descriptions-item label="药品">{{ currentShortage.medicine }}</a-descriptions-item>
        <a-descriptions-item label="剩余量">{{ currentShortage.remainingAmount || '-' }}</a-descriptions-item>
        <a-descriptions-item label="预计可用">{{ currentShortage.expectedDays }} 天</a-descriptions-item>
        <a-descriptions-item label="上报来源">{{ currentShortage.source }}</a-descriptions-item>
        <a-descriptions-item label="触发场景">{{ currentShortage.triggerScene }}</a-descriptions-item>
        <a-descriptions-item label="上报时间">{{ currentShortage.reportTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="处理人">{{ currentShortage.handler || '-' }}</a-descriptions-item>
      </a-descriptions>
      <a-descriptions v-if="shortageProcessReadonly" :column="1" bordered style="margin-top: 16px">
        <a-descriptions-item label="处理状态">
          <a-tag :color="statusColor(shortageProcessForm.status)">{{ shortageProcessForm.status || '-' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="处理结果">{{ shortageProcessForm.result || '-' }}</a-descriptions-item>
      </a-descriptions>
      <a-form v-else :model="shortageProcessForm" layout="vertical" style="margin-top: 16px">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="处理状态">
              <a-select v-model="shortageProcessForm.status">
                <a-option v-for="item in shortageStatusOptions" :key="item" :value="item">{{ item }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="处理结果">
              <a-textarea v-model="shortageProcessForm.result" placeholder="请输入处理结果" :auto-size="{ minRows: 3, maxRows: 5 }" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-button @click="shortageProcessDialogVisible = false">{{ shortageProcessReadonly ? '关闭' : '取消' }}</a-button>
        <a-button v-if="!shortageProcessReadonly" type="primary" @click="saveShortageProcess">保存</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { healthApi, patientApi, shortageApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { formatDateTime, getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const shortageLoading = ref(false)
const crudRef = ref()
const records = ref([])
const shortageReports = ref([])
const patientOptions = ref([])
const tabKeys = ['health', 'shortage']
const normalizeTabKey = (value) => {
  const tabKey = String(pickQueryValue(value))
  return tabKeys.includes(tabKey) ? tabKey : 'health'
}
const activeTab = ref(normalizeTabKey(route.query.tab))
const shortageKeyword = ref('')
const shortageStatus = ref('')
const healthDialogVisible = ref(false)
const shortageProcessDialogVisible = ref(false)
const shortageProcessReadonly = ref(false)
const shortageStatusOptions = ['待处理', '处理中', '已处理']

const searchForm = reactive({ keyword: '', patientId: String(pickQueryValue(route.query.patientId)) })
const healthForm = reactive({
  patientId: '',
  patient: '',
  date: '2026-05-21',
  morningBP: '',
  eveningBP: '',
  fastingGlucose: null,
  responded: true,
  source: '后台创建'
})
const currentShortage = reactive({})
const shortageProcessForm = reactive({
  status: '处理中',
  result: ''
})

const tableOptions = reactive({
  api: loadData,
  pageLayout: 'normal',
  showTools: true,
  showIndex: false,
  operationColumn: false,
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
  { title: '数据来源', dataIndex: 'source', width: 120 }
])

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
const shortageStatusType = (status) => {
  if (status === '已处理') return 'success'
  if (status === '处理中') return 'warning'
  return 'danger'
}
const handleResetSearch = () => {
  Object.assign(searchForm, { keyword: '', patientId: '' })
}
const refreshData = async () => {
  if (activeTab.value === 'health') {
    crudRef.value?.refresh()
  }
  if (activeTab.value === 'shortage') {
    await loadShortageReports()
  }
}
const handleTabChange = async (key) => {
  activeTab.value = String(key)
  await refreshData()
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
    source: '后台创建'
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
const openShortageProcessDialog = (record) => {
  Object.assign(currentShortage, record)
  Object.assign(shortageProcessForm, {
    status: record.status === '待处理' ? '处理中' : record.status,
    result: record.result || ''
  })
  shortageProcessReadonly.value = record.status === '已处理'
  shortageProcessDialogVisible.value = true
}
const saveShortageProcess = async () => {
  if (!shortageProcessForm.result) {
    Message.warning('请输入处理结果')
    return false
  }
  await shortageApi.update({
    ...currentShortage,
    status: shortageProcessForm.status,
    statusType: shortageStatusType(shortageProcessForm.status),
    handler: '医药师',
    handledAt: shortageProcessForm.status === '已处理' ? formatDateTime() : currentShortage.handledAt || '',
    result: shortageProcessForm.result
  })
  Message.success('缺药上报已保存')
  shortageProcessDialogVisible.value = false
  await loadShortageReports()
}
watch(
  () => route.query.tab,
  (value) => {
    activeTab.value = normalizeTabKey(value)
  }
)

onMounted(async () => {
  await loadPatients()
  await refreshData()
})
</script>
