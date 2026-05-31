<template>
  <div class="smart-page">
    <sa-table
      ref="crudRef"
      :options="tableOptions"
      :columns="columns"
      :searchForm="searchForm"
      @resetSearch="handleResetSearch">
      <template #tableSearch>
        <a-col :xs="24" :md="8">
          <a-form-item field="keyword" label="关键词">
            <a-input-search v-model="searchForm.keyword" placeholder="关键词：姓名/手机号" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-form-item field="deviceBindStatus" label="设备绑定">
            <a-select v-model="searchForm.deviceBindStatus" placeholder="设备绑定" allow-clear>
              <a-option value="bound">已绑定</a-option>
              <a-option value="unbound">未绑定</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-form-item field="childBindStatus" label="子女绑定">
            <a-select v-model="searchForm.childBindStatus" placeholder="子女绑定" allow-clear>
              <a-option value="bound">已绑定</a-option>
              <a-option value="unbound">未绑定</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </template>

      <template #tableBeforeButtons>
        <a-space wrap>
          <a-button type="primary" @click="openCreateDialog">
            <template #icon><sa-icon icon="ri:user-add-line" :size="16" /></template>
            新增患者建档
          </a-button>
          <a-button disabled>
            <template #icon><sa-icon icon="ri:cloud-line" :size="16" /></template>
            HIS同步
          </a-button>
          <a-button disabled>
            <template #icon><sa-icon icon="ri:upload-cloud-2-line" :size="16" /></template>
            批量导入
          </a-button>
        </a-space>
      </template>

      <template #tableAfterButtons>
        <a-button :loading="loading" @click="refreshPatients">
          <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
          刷新
        </a-button>
      </template>

      <template #recordNo="{ record }">
        <span class="record-link">{{ record.recordNo || `MR-${record.id}` }}</span>
      </template>
      <template #name="{ record }"><span>{{ record.name }}</span></template>
      <template #deviceStatus="{ record }">
        <a-tag :color="statusColor(record.deviceStatus)">{{ record.deviceStatus }}</a-tag>
      </template>
      <template #child="{ record }">
        <a-tag :color="isChildBound(record.child) ? 'green' : 'orange'">
          {{ getChildStatus(record.child) }}
        </a-tag>
      </template>
      <template #completionRate="{ record }">
        <div class="completion-rate-cell">
          <a-progress :percent="getCompletionRate(record.completionRate) / 100" :show-text="false" size="small" />
          <span>{{ getCompletionRate(record.completionRate) }}%</span>
        </div>
      </template>
      <template #operationCell="{ record }">
        <a-space class="patient-table-actions" size="mini" wrap>
          <a-button v-if="!isDeviceBound(record)" size="mini" type="primary" @click="openBindDialog(record)">
            绑定设备
          </a-button>
          <a-button size="mini" @click="router.push(`/doctor/patient-detail?patientId=${record.id}`)">
            详情
          </a-button>
          <a-button size="mini" @click="router.push(`/doctor/plans?patientId=${record.id}`)">
            计划
          </a-button>
        </a-space>
      </template>
    </sa-table>

    <a-modal v-model:visible="createVisible" title="新增患者建档" width="min(720px, calc(100vw - 32px))" :footer="false">
      <a-alert v-if="createdPatient" type="success" show-icon style="margin-bottom: 16px">
        {{ createdPatient.name }} 已完成建档，{{ hasBoundDevice ? '下一步可以继续设置用药计划' : '下一步需要先绑定设备，再设置用药计划' }}
      </a-alert>
      <a-descriptions v-if="createdPatient" :column="2" bordered>
        <a-descriptions-item label="姓名">{{ createdPatient.name }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ createdPatient.phone }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{ createdPatient.gender }}</a-descriptions-item>
        <a-descriptions-item label="出生年月日">{{ createdPatient.birthDate }}</a-descriptions-item>
        <a-descriptions-item label="设备状态">
          <a-tag :color="statusColor(createdPatient.deviceStatus)">{{ createdPatient.deviceStatus }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="下一步">{{ hasBoundDevice ? '设置用药计划' : '绑定药盒设备' }}</a-descriptions-item>
      </a-descriptions>

      <a-form v-else :model="createForm" layout="vertical">
        <h3 class="form-step-title">患者基础信息</h3>
        <p class="smart-muted" style="margin-top: 6px">批量导入和 HIS 同步也会先进入同样的基础档案状态。</p>
        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :xs="24" :md="12"><a-form-item label="患者姓名"><a-input v-model="createForm.name" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="手机号"><a-input v-model="createForm.phone" /></a-form-item></a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="性别">
              <a-select v-model="createForm.gender" placeholder="请选择性别">
                <a-option value="男">男</a-option>
                <a-option value="女">女</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="出生年月日"><a-date-picker v-model="createForm.birthDate" placeholder="请选择出生年月日" style="width: 100%" /></a-form-item>
          </a-col>
          <a-col :xs="24">
            <a-form-item label="设备绑定">
              <a-select v-model="createForm.deviceId" :loading="devicesLoading" placeholder="请选择设备" allow-clear>
                <a-option value="">暂不绑定设备</a-option>
                <a-option v-for="device in availableDevices" :key="device.id" :value="device.id">
                  {{ device.sn }} | {{ device.status }} | 电量 {{ device.battery }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="form-actions" style="margin-top: 18px">
        <a-button @click="closeCreateDialog">
          <template #icon><sa-icon icon="ri:close-line" :size="16" /></template>
          关闭
        </a-button>
        <a-button v-if="createdPatient" @click="router.push('/doctor/patients')">返回列表</a-button>
        <a-button v-if="createdPatient && hasBoundDevice" type="primary" @click="goToMedicationPlan(createdPatient)">
          <template #icon><sa-icon icon="ri:calendar-check-line" :size="16" /></template>
          设置用药计划
        </a-button>
        <a-button v-if="createdPatient && !hasBoundDevice" type="primary" @click="goToDeviceBinding(createdPatient)">
          <template #icon><sa-icon icon="ri:link-m" :size="16" /></template>
          继续绑定设备
        </a-button>
        <a-button v-if="!createdPatient" type="primary" :loading="saving" @click="saveCreate">
          <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
          保存基础档案
        </a-button>
      </div>
    </a-modal>

    <a-modal v-model:visible="bindVisible" title="绑定药盒设备" width="min(560px, calc(100vw - 32px))" :footer="false">
      <a-form :model="bindForm" layout="vertical">
        <a-form-item label="患者"><a-input v-model="bindForm.patientName" readonly /></a-form-item>
        <a-form-item label="设备">
          <a-select v-model="bindForm.deviceId" :loading="devicesLoading" placeholder="请选择可用设备">
            <a-option v-for="device in availableDevices" :key="device.id" :value="device.id">
              {{ device.sn }} | {{ device.status }} | 电量 {{ device.battery }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="绑定后状态">
          <a-input model-value="待选择设备后自动同步" readonly placeholder="待选择" />
        </a-form-item>
      </a-form>
      <div class="form-actions">
        <a-button @click="bindVisible = false">取消</a-button>
        <a-button type="primary" :loading="saving" @click="saveBindDevice">
          <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
          保存绑定
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { deviceApi, patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { calculateAge, formatDateTime, generatePatientNo, getPayload, getRecords, isBoundValue, statusColor } from '@/views/smart-pillbox/utils'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const devicesLoading = ref(false)
const crudRef = ref()
const patients = ref([])
const availableDevices = ref([])
const createVisible = ref(false)
const bindVisible = ref(false)
const createdPatient = ref(null)

const searchForm = reactive({ keyword: '', deviceBindStatus: '', childBindStatus: '' })
const createForm = reactive({ name: '', phone: '', gender: '', birthDate: '', deviceId: '' })
const bindForm = reactive({ patientId: '', patientName: '', deviceId: '' })
const tableOptions = reactive({
  api: loadPatients,
  pageLayout: 'normal',
  showIndex: false,
  showTools: true,
  operationColumn: true,
  operationColumnText: '操作',
  operationColumnWidth: 230,
  add: { show: false },
  edit: { show: false },
  delete: { show: false }
})
const columns = reactive([
  { title: '患者编号', dataIndex: 'recordNo', width: 160 },
  { title: '姓名', dataIndex: 'name', width: 110 },
  { title: '手机号', dataIndex: 'phone', width: 135 },
  { title: '设备状态', dataIndex: 'deviceStatus', width: 120 },
  { title: '子女绑定状态', dataIndex: 'child', width: 140 },
  { title: '完成率', dataIndex: 'completionRate', width: 150 }
])

const hasBoundDevice = computed(() => isDeviceBound(createdPatient.value || {}))

async function loadPatients(params = {}) {
  loading.value = true
  try {
    const response = await patientApi.list(params)
    const records = getRecords(response)
    const payload = getPayload(response)
    patients.value = records
    return { data: { data: records, total: payload?.total || records.length } }
  } finally {
    loading.value = false
  }
}

const loadAvailableDevices = async () => {
  devicesLoading.value = true
  try {
    const response = await deviceApi.list({ page: 1, limit: 100 })
    availableDevices.value = getRecords(response).filter((device) => !device.bindPatientId || device.patient === '-' || device.status === '待分配')
  } finally {
    devicesLoading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, { keyword: '', deviceBindStatus: '', childBindStatus: '' })
  refreshPatients()
}

const handleResetSearch = () => {
  Object.assign(searchForm, { keyword: '', deviceBindStatus: '', childBindStatus: '' })
}

const refreshPatients = () => {
  crudRef.value?.refresh()
}

const openCreateDialog = async () => {
  createdPatient.value = null
  Object.assign(createForm, { name: '', phone: '', gender: '', birthDate: '', deviceId: '' })
  createVisible.value = true
  await loadAvailableDevices()
}

const closeCreateDialog = () => {
  createVisible.value = false
  createdPatient.value = null
}

const isChildBound = (child) => isBoundValue(child)
const getChildStatus = (child) => (isChildBound(child) ? '已绑定' : child || '未绑定')
const isDeviceBound = (row) => Boolean(row?.deviceNo && row.deviceNo !== '未绑定' && row.deviceStatus !== '未绑定')
const getCompletionRate = (rate) => Math.min(100, Math.max(0, Number(rate) || 0))

const saveCreate = async () => {
  if (!createForm.name || !createForm.phone || !createForm.birthDate) {
    Message.warning('请填写患者姓名、手机号和出生年月日')
    return
  }
  saving.value = true
  try {
    const now = formatDateTime()
    const response = await patientApi.save({
      name: createForm.name,
      phone: createForm.phone,
      gender: createForm.gender,
      birthDate: createForm.birthDate,
      age: calculateAge(createForm.birthDate),
      recordNo: generatePatientNo(),
      diseases: [],
      historyDiseases: [],
      allergies: [],
      contacts: [],
      status: '正常管理',
      deviceNo: '未绑定',
      deviceStatus: '未绑定',
      deviceStatusType: 'warning',
      consent: '未同意',
      child: '待绑定',
      nextReminder: '-',
      todayDrugs: 0,
      recentInteraction: '-',
      completionRate: 0,
      taskRisk: '待绑定设备',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: null
    })
    const patient = getPayload(response)
    createdPatient.value = await bindSelectedDevice(patient, createForm.deviceId)
    Message.success(createForm.deviceId ? '患者已建档并绑定设备' : '患者基础档案已保存')
    refreshPatients()
  } finally {
    saving.value = false
  }
}

const bindSelectedDevice = async (patient, deviceId) => {
  const device = availableDevices.value.find((item) => String(item.id) === String(deviceId))
  if (!device) return patient
  const status = device.status === '离线' ? '离线' : '在线'
  const statusType = status === '离线' ? 'danger' : 'success'
  const deviceResponse = await deviceApi.update({
    ...device,
    bindPatientId: patient.id,
    patient: patient.name,
    status,
    statusType,
    bindDate: new Date().toISOString().slice(0, 10),
    dispatchStatus: '计划待下发',
    wifi: status === '离线' ? '未连接' : device.wifi || '已连接',
    wifiConnected: status !== '离线'
  })
  const savedDevice = getPayload(deviceResponse)
  const patientResponse = await patientApi.update({
    ...patient,
    deviceNo: savedDevice.sn || device.sn,
    deviceStatus: status,
    deviceStatusType: savedDevice.statusType || statusType,
    taskRisk: '待设置用药计划',
    updatedAt: formatDateTime()
  })
  return getPayload(patientResponse)
}

const openBindDialog = async (patient) => {
  Object.assign(bindForm, { patientId: patient.id, patientName: patient.name, deviceId: '' })
  bindVisible.value = true
  await loadAvailableDevices()
}

const saveBindDevice = async () => {
  if (!bindForm.deviceId) {
    Message.warning('请选择设备')
    return
  }
  saving.value = true
  try {
    const patientResponse = await patientApi.read(bindForm.patientId)
    await bindSelectedDevice(getPayload(patientResponse), bindForm.deviceId)
    Message.success('设备绑定成功')
    bindVisible.value = false
    refreshPatients()
  } finally {
    saving.value = false
  }
}

const goToDeviceBinding = (patient) => {
  router.push({ path: '/doctor/devices', query: { action: 'bind', patientId: patient.id, patientName: patient.name } })
}

const goToMedicationPlan = (patient) => {
  router.push({ path: '/doctor/plans', query: { patientId: patient.id, action: 'create' } })
}

onMounted(refreshPatients)
</script>
