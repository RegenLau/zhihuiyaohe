<template>
  <div class="smart-page">
    <div class="smart-page-header is-actions-only">
      <a-button @click="router.push('/doctor/patients')">
        <template #icon><sa-icon icon="ri:user-heart-line" :size="16" /></template>
        返回患者管理
      </a-button>
    </div>

    <div class="summary-grid">
      <div v-for="item in healthOverview" :key="item.label" class="summary-item">
        <span class="summary-number" :class="item.className">{{ item.value }}</span>
        <span class="smart-muted">{{ item.label }}</span>
      </div>
    </div>

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
        <span class="smart-muted">健康数据记录</span>
      </template>

      <template #tableAfterButtons>
        <a-button :loading="loading" @click="refreshData">
          <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
          刷新
        </a-button>
      </template>

      <template #patient="{ record }">
        <a-link @click="router.push(`/doctor/patient-detail?id=${record.patientId}`)">{{ record.patient }}</a-link>
      </template>
      <template #bloodPressure="{ record }">
        <strong>晨 {{ record.morningBP || '未上报' }}</strong>
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
    </sa-table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { healthApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getPayload, getRecords, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const crudRef = ref()
const records = ref([])
const searchForm = reactive({ keyword: '', riskLevel: '', patientId: String(route.query.patientId || '') })
const tableOptions = reactive({
  api: loadData,
  pageLayout: 'normal',
  showTools: true,
  showIndex: false,
  operationColumn: false,
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

const healthOverview = computed(() => {
  const responded = records.value.filter((item) => item.responded).length
  const risk = records.value.filter((item) => item.riskLevel !== '正常').length
  const glucoseValues = records.value.map((item) => item.fastingGlucose).filter((value) => typeof value === 'number')
  const avgGlucose = glucoseValues.length ? (glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length).toFixed(1) : '-'
  return [
    { label: '当前记录', value: records.value.length, className: '' },
    { label: '已响应', value: responded, className: 'is-success' },
    { label: '异常或关注', value: risk, className: risk ? 'is-warning' : 'is-success' },
    { label: '平均空腹血糖', value: avgGlucose, className: '' }
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
const resetSearch = () => {
  Object.assign(searchForm, { keyword: '', riskLevel: '', patientId: '' })
  refreshData()
}
const handleResetSearch = () => {
  Object.assign(searchForm, { keyword: '', riskLevel: '', patientId: '' })
}
const refreshData = () => {
  crudRef.value?.refresh()
}
onMounted(refreshData)
</script>
