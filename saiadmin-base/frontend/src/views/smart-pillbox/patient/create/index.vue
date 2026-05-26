<template>
  <div class="smart-page">
    <div class="smart-page-header is-actions-only">
      <a-button @click="router.push('/doctor/patients')">
        <template #icon><sa-icon icon="ri:arrow-left-line" :size="16" /></template>
        返回患者管理
      </a-button>
    </div>

    <a-card v-if="createdPatient" class="smart-panel" :bordered="false">
      <a-result status="success" title="患者建档成功" :subtitle="successSubtitle">
        <template #extra>
          <a-space wrap>
            <a-button @click="router.push('/doctor/patients')">
              <template #icon><sa-icon icon="ri:list-check" :size="16" /></template>
              返回患者列表
            </a-button>
            <a-button v-if="hasBoundDevice" type="primary" @click="goToMedicationPlan()">
              <template #icon><sa-icon icon="ri:calendar-check-line" :size="16" /></template>
              设置用药计划
            </a-button>
            <a-button v-else type="primary" @click="goToDeviceBinding()">
              <template #icon><sa-icon icon="ri:link-m" :size="16" /></template>
              继续绑定设备
            </a-button>
          </a-space>
        </template>
      </a-result>
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="姓名">{{ createdPatient.name }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ createdPatient.phone }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{ createdPatient.gender }}</a-descriptions-item>
        <a-descriptions-item label="出生年月日">{{ createdPatient.birthDate }}</a-descriptions-item>
        <a-descriptions-item label="设备状态">
          <a-tag :color="statusColor(createdPatient.deviceStatus)">{{ createdPatient.deviceStatus }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="下一步">{{ nextStepText }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card v-else class="smart-panel" :bordered="false">
      <a-form :model="form" layout="vertical">
        <h3 class="form-step-title">患者基础信息</h3>
        <p class="smart-muted" style="margin: 6px 0 18px">批量导入和 HIS 同步也会先进入同样的基础档案状态。</p>

        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="患者姓名" required>
              <a-input v-model="form.name" placeholder="请输入患者姓名" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="手机号" required>
              <a-input v-model="form.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="性别" required>
              <a-select v-model="form.gender" placeholder="请选择性别">
                <a-option value="男">男</a-option>
                <a-option value="女">女</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="出生年月日" required>
              <a-date-picker v-model="form.birthDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="设备绑定">
              <a-select v-model="form.deviceId" :loading="devicesLoading" placeholder="请选择可用设备" allow-clear>
                <a-option value="">全部 / 暂不绑定设备</a-option>
                <a-option v-for="device in availableDevices" :key="device.id" :value="device.id">
                  {{ device.sn }} | {{ device.status }} | 电量 {{ device.battery }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <div class="form-actions">
          <a-button @click="router.push('/doctor/patients')">
            <template #icon><sa-icon icon="ri:close-line" :size="16" /></template>
            取消
          </a-button>
          <a-button type="primary" :loading="saving" @click="handleSubmit">
            <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
            保存基础档案
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRouter } from 'vue-router'
import { deviceApi, patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { calculateAge, formatDateTime, generatePatientNo, getPayload, getRecords, statusColor } from '@/views/smart-pillbox/utils'

const router = useRouter()
const saving = ref(false)
const devicesLoading = ref(false)
const createdPatient = ref(null)
const availableDevices = ref([])

const form = reactive({
  name: '',
  phone: '',
  gender: '男',
  birthDate: '',
  deviceId: ''
})

const selectedDevice = computed(() => availableDevices.value.find((item) => String(item.id) === String(form.deviceId)))
const hasBoundDevice = computed(() => Boolean(createdPatient.value?.deviceNo) && createdPatient.value.deviceNo !== '未绑定')
const successSubtitle = computed(() => (hasBoundDevice.value ? '下一步可以继续设置用药计划' : '下一步需要先绑定设备，再设置用药计划'))
const nextStepText = computed(() => (hasBoundDevice.value ? '设置用药计划' : '绑定药盒设备'))

const loadAvailableDevices = async () => {
  devicesLoading.value = true
  try {
    const response = await deviceApi.list({ page: 1, limit: 100 })
    availableDevices.value = getRecords(response).filter(
      (device) => !device.bindPatientId || device.patient === '-' || device.status === '待分配'
    )
  } finally {
    devicesLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.name || !form.phone || !form.gender || !form.birthDate) {
    Message.warning('请填写患者姓名、手机号、性别和出生年月日')
    return
  }
  saving.value = true
  try {
    const now = formatDateTime()
    const response = await patientApi.save({
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      birthDate: form.birthDate,
      age: calculateAge(form.birthDate),
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
    const finalPatient = await bindSelectedDevice(getPayload(response))
    createdPatient.value = finalPatient
    Message.success(selectedDevice.value ? '患者已建档并绑定设备' : '患者基础档案已保存')
  } finally {
    saving.value = false
  }
}

const bindSelectedDevice = async (patient) => {
  const device = selectedDevice.value
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

const goToDeviceBinding = (patient = createdPatient.value) => {
  if (!patient) return
  router.push({ path: '/doctor/devices', query: { action: 'bind', patientId: patient.id, patientName: patient.name } })
}

const goToMedicationPlan = (patient = createdPatient.value) => {
  if (!patient) return
  router.push({ path: '/doctor/plans', query: { patientId: patient.id, action: 'create' } })
}

onMounted(loadAvailableDevices)
</script>
