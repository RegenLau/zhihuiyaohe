<template>
  <div class="smart-page">
    <div class="ma-content-block p-4">
      <a-row class="smart-filter-row" :gutter="[12, 12]" align="center">
        <a-col :xs="24" :sm="10" :md="8">
          <a-input-search
            v-model="filters.sn"
            placeholder="搜索设备编号、患者姓名"
            allow-clear
            @search="fetchDevices"
            @clear="fetchDevices"
          />
        </a-col>
        <a-col :xs="24" :sm="8" :md="5">
          <a-select
            v-model="filters.status"
            placeholder="全部设备状态"
            allow-clear
            @change="fetchDevices"
            @clear="fetchDevices"
          >
            <a-option value="">全部</a-option>
            <a-option value="在线">在线</a-option>
            <a-option value="离线">离线</a-option>
            <a-option value="待分配">待分配</a-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="11" class="smart-filter-actions">
          <a-space wrap>
            <a-button :loading="loading" @click="fetchDevices">
              <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
              刷新状态
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <div class="device-summary-grid">
      <div v-for="item in deviceStatusSummary" :key="item.label" class="ma-content-block p-4 device-summary-card">
        <a-avatar :size="44" :class="['device-summary-avatar', `is-${item.type}`]">
          <sa-icon :icon="item.icon" :size="22" />
        </a-avatar>
        <div class="device-summary-meta">
          <div class="device-summary-value">{{ item.count }}</div>
          <div class="device-summary-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <a-spin :loading="loading" class="device-card-spin">
      <div v-if="!devices.length" class="ma-content-block p-4">
        <a-empty description="暂无设备数据" />
      </div>
      <div v-else class="device-card-grid">
        <a-card v-for="device in devices" :key="device.id" class="device-card">
          <div class="device-card-header">
            <span class="device-card-title">
              <span class="smart-muted">设备编号：</span>
              <span class="device-card-sn">{{ device.sn }}</span>
            </span>
            <a-tag :color="statusColor(device.status)" class="device-card-status">{{ device.status }}</a-tag>
          </div>
          <a-divider class="device-card-divider" />

          <div class="device-card-fields">
            <div class="device-card-field">
              <span class="smart-muted">绑定患者</span>
              <a-link
                v-if="device.bindPatientId"
                @click="router.push(`/doctor/patient-detail?patientId=${device.bindPatientId}`)"
              >
                {{ device.patient || '-' }}
              </a-link>
              <span v-else>{{ device.patient || '-' }}</span>
            </div>
            <div class="device-card-field">
              <span class="smart-muted">电量</span>
              <a-space :size="4">
                <sa-icon icon="ri:battery-2-charge-line" :size="16" />
                <a-typography-text :type="batteryPercent(device) <= 20 ? 'danger' : undefined">
                  {{ device.battery || '-' }}
                </a-typography-text>
              </a-space>
            </div>
            <div class="device-card-field">
              <span class="smart-muted">WiFi状态</span>
              <a-space :size="4">
                <sa-icon :icon="device.wifiConnected === false ? 'ri:wifi-off-line' : 'ri:wifi-line'" :size="16" />
                <span>{{ wifiStatus(device) }}</span>
              </a-space>
            </div>
            <div class="device-card-field">
              <span class="smart-muted">固件版本</span>
              <a-space :size="4">
                <sa-icon icon="ri:cpu-line" :size="16" />
                <span>{{ device.firmware || '-' }}</span>
              </a-space>
            </div>
            <div class="device-card-field">
              <span class="smart-muted">绑定日期</span>
              <span>{{ device.bindDate || '-' }}</span>
            </div>
            <div class="device-card-field">
              <span class="smart-muted">最后心跳</span>
              <span>{{ device.lastHeartbeat || '-' }}</span>
            </div>
          </div>

          <template #actions>
            <a-button type="text" @click="openEditDialog(device)">编辑</a-button>
            <a-button status="danger" :disabled="!isDeviceBound(device)" @click="openUnbindConfirm(device)">解绑设备</a-button>
          </template>
        </a-card>
      </div>
    </a-spin>

    <a-modal
      v-model:visible="editVisible"
      :title="guidedBinding || dialogType === 'add' ? '绑定药盒' : '编辑设备'"
      width="min(640px, calc(100vw - 32px))"
      @ok="saveDevice"
    >
      <a-form :model="deviceForm" layout="vertical">
        <a-form-item label="设备 SN" required><a-input v-model="deviceForm.sn" /></a-form-item>
        <a-form-item label="绑定患者" required><a-input v-model="deviceForm.patient" placeholder="请输入绑定患者姓名" :readonly="guidedBinding" :disabled="dialogType === 'edit'" /></a-form-item>
        <a-form-item v-if="dialogType === 'edit'" label="绑定日期"><a-input v-model="deviceForm.bindDate" disabled /></a-form-item>
        <a-form-item label="在线状态" required>
          <a-select v-model="deviceForm.status" placeholder="请选择在线状态" :disabled="dialogType === 'edit'">
            <a-option value="在线">在线</a-option>
            <a-option value="离线">离线</a-option>
            <a-option value="待分配">待分配</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="电量"><a-input-number v-model="deviceForm.batteryLevel" :min="0" :max="100" style="width: 100%" :disabled="dialogType === 'edit'" /></a-form-item>
        <a-form-item label="固件更新">
          <div class="device-firmware-row">
            <span class="smart-muted">目前版本</span>
            <a-input v-model="deviceForm.firmware" readonly />
            <a-button :disabled="deviceForm.firmware === latestFirmwareVersion" @click="handleFirmwareUpdate">更新版本</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="importVisible" title="导入设备" width="min(680px, calc(100vw - 32px))" :footer="false">
      <a-textarea
        v-model="importText"
        :auto-size="{ minRows: 5, maxRows: 8 }"
        placeholder="将文件拖到此处，或点击选择。当前 mock 支持粘贴 CSV，每行一台设备，例如：PBX-202605-099,王秀兰,在线,90%,v2.1.3"
      />
      <a-alert style="margin-top: 12px" type="info">
        支持 .xlsx、.xls、.csv，至少包含设备 SN。已识别 {{ previewRows.length }} 台设备
      </a-alert>
      <a-table v-if="previewRows.length" row-key="sn" :data="previewRows" :pagination="false" :scroll="{ x: 760 }" style="margin-top: 16px">
        <template #columns>
          <a-table-column title="设备SN" data-index="sn" />
          <a-table-column title="绑定患者" data-index="patient" />
          <a-table-column title="在线状态" data-index="status" />
          <a-table-column title="电量" data-index="battery" />
          <a-table-column title="固件版本" data-index="firmware" />
          <a-table-column title="计划同步 / 同步状态" data-index="dispatchStatus" />
        </template>
      </a-table>
      <div class="form-actions" style="margin-top: 16px">
        <a-button @click="importVisible = false">取消</a-button>
        <a-button type="primary" :loading="saving" @click="submitImport">
          <template #icon><sa-icon icon="ri:import-line" :size="16" /></template>
          确认导入
        </a-button>
      </div>
    </a-modal>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { deviceApi, patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { formatDateTime, getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const devices = ref([])
const loading = ref(false)
const saving = ref(false)
const editVisible = ref(false)
const importVisible = ref(false)
const dialogType = ref('edit')
const guidedBinding = ref(false)
const latestFirmwareVersion = 'v2.1.3'
const importText = ref('')

const filters = reactive({
  sn: String(pickQueryValue(route.query.sn)),
  status: String(pickQueryValue(route.query.status))
})

const deviceStatusSummary = computed(() => {
  const records = devices.value
  return [
    {
      label: '在线设备',
      count: records.filter((device) => device.status === '在线').length,
      icon: 'ri:checkbox-circle-line',
      type: 'success'
    },
    {
      label: '离线设备',
      count: records.filter((device) => device.status === '离线').length,
      icon: 'ri:error-warning-line',
      type: 'danger'
    },
    {
      label: '待分配设备',
      count: records.filter((device) => device.status === '待分配').length,
      icon: 'ri:question-line',
      type: 'warning'
    }
  ]
})

const deviceForm = reactive({
  id: undefined,
  bindPatientId: null,
  sn: '',
  patient: '',
  status: '在线',
  batteryLevel: 100,
  firmware: latestFirmwareVersion,
  bindDate: ''
})

const previewRows = computed(() => {
  return importText.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sn, patient = '-', status = '', battery = '100%', firmware = latestFirmwareVersion, dispatchStatus = ''] = line.split(',').map((item) => item.trim())
      return {
        sn,
        patient,
        status: status || (patient === '-' ? '待分配' : '在线'),
        battery,
        batteryLevel: Number(String(battery).replace('%', '')) || 100,
        firmware,
        dispatchStatus: dispatchStatus || (patient === '-' ? '未绑定' : '计划待下发')
      }
    })
    .filter((item) => item.sn)
})

const fetchDevices = async () => {
  loading.value = true
  try {
    const response = await deviceApi.list({
      sn: filters.sn,
      status: filters.status,
      limit: 100
    })
    devices.value = getRecords(response)
  } finally {
    loading.value = false
  }
}

const batteryPercent = (device) => {
  const value = Number(device.batteryLevel ?? String(device.battery || '').replace('%', ''))
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
}

const wifiStatus = (device) => {
  return device.wifi || (device.status === '离线' ? '未连接' : '已连接')
}

const isDeviceBound = (device) => {
  return Boolean(device.bindPatientId || (device.patient && device.patient !== '-')) && device.status !== '待分配'
}

const statusTypeMap = {
  在线: 'success',
  离线: 'danger',
  待分配: 'warning'
}

const openEditDialog = (device) => {
  dialogType.value = 'edit'
  guidedBinding.value = false
  Object.assign(deviceForm, {
    ...device,
    batteryLevel: batteryPercent(device)
  })
  editVisible.value = true
}

const openGuidedBindDialog = async () => {
  if (pickQueryValue(route.query.action) !== 'bind') return
  filters.status = ''
  await fetchDevices()
  const patientId = Number(pickQueryValue(route.query.patientId))
  if (!patientId) return
  let patientName = String(pickQueryValue(route.query.patientName))
  if (!patientName) {
    const patientResponse = await patientApi.read(patientId)
    patientName = getPayload(patientResponse).name
  }
  const availableDevice = devices.value.find((device) => !isDeviceBound(device) || device.status === '待分配')
  if (!availableDevice) {
    Message.warning('暂无待分配设备，请先导入设备')
    router.replace({ path: '/doctor/devices' })
    return
  }
  dialogType.value = 'edit'
  guidedBinding.value = true
  Object.assign(deviceForm, {
    ...availableDevice,
    bindPatientId: patientId,
    patient: patientName,
    status: '在线',
    batteryLevel: batteryPercent(availableDevice) || 100,
    firmware: availableDevice.firmware || latestFirmwareVersion,
    bindDate: new Date().toISOString().slice(0, 10)
  })
  editVisible.value = true
}

const saveDevice = async () => {
  if (!deviceForm.sn || !deviceForm.patient) {
    Message.warning('请输入设备 SN 和绑定患者')
    return false
  }
  const payload = {
    ...deviceForm,
    statusType: statusTypeMap[deviceForm.status] || 'info',
    battery: `${deviceForm.batteryLevel}%`,
    bindDate: deviceForm.bindDate || new Date().toISOString().slice(0, 10),
    wifi: deviceForm.status === '离线' ? '未连接' : '已连接',
    wifiConnected: deviceForm.status !== '离线',
    dispatchStatus: deviceForm.bindPatientId ? '计划待下发' : '未绑定'
  }
  const response = dialogType.value === 'add' ? await deviceApi.save(payload) : await deviceApi.update(payload)
  const savedDevice = getPayload(response)
  if (savedDevice.bindPatientId) {
    const patientResponse = await patientApi.read(savedDevice.bindPatientId)
    const patient = getPayload(patientResponse)
    await patientApi.update({
      ...patient,
      deviceNo: savedDevice.sn,
      deviceStatus: savedDevice.status === '离线' ? '离线' : '在线',
      deviceStatusType: savedDevice.statusType,
      taskRisk: '待设置用药计划',
      updatedAt: formatDateTime()
    })
  }
  Message.success(dialogType.value === 'add' ? '设备绑定关系已保存' : '设备信息已保存')
  editVisible.value = false
  await fetchDevices()
  if (guidedBinding.value && savedDevice.bindPatientId) {
    Modal.confirm({
      title: '继续设置用药计划',
      content: '设备已绑定，是否继续设置用药计划？',
      okText: '继续设置',
      cancelText: '稍后处理',
      onOk: () => router.push({ path: '/doctor/plans', query: { patientId: savedDevice.bindPatientId, action: 'create' } })
    })
  }
}

const handleFirmwareUpdate = () => {
  if (deviceForm.firmware === latestFirmwareVersion) {
    Message.info('当前已是最新版本')
    return
  }
  deviceForm.firmware = latestFirmwareVersion
  Message.success(`固件已更新至 ${latestFirmwareVersion}`)
}

const openUnbindConfirm = (device) => {
  if (!isDeviceBound(device)) {
    Message.warning('当前设备未绑定患者')
    return
  }
  Modal.confirm({
    title: '确认解绑',
    content: `确认解除设备 ${device.sn} 与 ${device.patient} 的绑定关系？`,
    simple: false,
    titleAlign: 'start',
    okText: '确认',
    cancelText: '取消',
    onOk: () => unbindDevice(device)
  })
}

const unbindDevice = async (device) => {
  if (!isDeviceBound(device)) {
    Message.warning('当前设备未绑定患者')
    return
  }
  const boundPatientId = device.bindPatientId
  await deviceApi.update({
    ...device,
    bindPatientId: null,
    patient: '-',
    status: '待分配',
    statusType: 'warning',
    dispatchStatus: '未绑定'
  })
  if (boundPatientId) {
    const patientResponse = await patientApi.read(boundPatientId)
    const patient = getPayload(patientResponse)
    await patientApi.update({
      ...patient,
      deviceNo: '未绑定',
      deviceStatus: '未绑定',
      deviceStatusType: 'warning',
      taskRisk: '待绑定设备',
      updatedAt: formatDateTime()
    })
  }
  Message.success('设备已解绑')
  await fetchDevices()
}

const submitImport = async () => {
  if (!previewRows.value.length) {
    Message.warning('未识别到设备数据，请先选择设备导入文件')
    return
  }
  saving.value = true
  try {
    await Promise.all(
      previewRows.value.map((item) =>
        deviceApi.save({
          ...item,
          bindPatientId: null,
          statusType: statusTypeMap[item.status] || 'info',
          wifi: item.status === '离线' ? '未连接' : '已连接',
          wifiConnected: item.status !== '离线',
          bindDate: item.patient === '-' ? '-' : new Date().toISOString().slice(0, 10),
          lastHeartbeat: null,
          dispatchStatus: item.dispatchStatus || (item.patient === '-' ? '未绑定' : '计划待下发')
        })
      )
    )
    Message.success(`已导入 ${previewRows.value.length} 台设备`)
    importVisible.value = false
    importText.value = ''
    await fetchDevices()
  } finally {
    saving.value = false
  }
}

watch(
  () => route.fullPath,
  async () => {
    filters.sn = String(pickQueryValue(route.query.sn))
    filters.status = String(pickQueryValue(route.query.status))
    await fetchDevices()
    await openGuidedBindDialog()
  }
)

onMounted(async () => {
  await fetchDevices()
  await openGuidedBindDialog()
})
</script>

<style scoped>
.device-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.device-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
  align-items: stretch;
}

.device-card-spin {
  display: block;
  width: 100%;
}

.device-card-grid > * {
  min-width: 0;
}

.device-summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 96px;
}

.device-summary-avatar.is-success {
  color: rgb(var(--green-6));
  background: rgb(var(--green-1));
}

.device-summary-avatar.is-danger {
  color: rgb(var(--red-6));
  background: rgb(var(--red-1));
}

.device-summary-avatar.is-warning {
  color: rgb(var(--orange-6));
  background: rgb(var(--orange-1));
}

.device-summary-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.device-summary-value {
  color: var(--color-text-1);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}

.device-summary-label {
  color: var(--color-text-2);
  line-height: 1.4;
}

.device-card {
  height: 100%;
}

.device-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.device-card-title {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: 0;
  white-space: nowrap;
}

.device-card-sn {
  display: inline-block;
  font-size: 14px;
  line-height: 1.4;
  color: var(--color-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
}

.device-card-status {
  flex: 0 0 auto;
}

.device-card-divider {
  margin: 12px 0 16px;
}

.device-card-fields {
  display: grid;
  gap: 12px;
  padding: 4px 0;
}

.device-card-field {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 24px;
}

.device-card-field > :last-child {
  justify-self: end;
  min-width: 0;
  text-align: right;
}

.device-firmware-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  width: 100%;
}

@media (max-width: 640px) {
  .device-summary-grid,
  .device-card-grid {
    grid-template-columns: 1fr;
  }

  .device-firmware-row {
    grid-template-columns: 1fr;
  }
}
</style>
