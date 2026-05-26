<template>
  <div class="smart-page">
    <a-card class="smart-panel" :bordered="false">
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
            <a-button type="primary" @click="importVisible = true">
              <template #icon><sa-icon icon="ri:upload-cloud-2-line" :size="16" /></template>
              导入设备
            </a-button>
            <a-button :loading="loading" @click="fetchDevices">
              <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
              刷新状态
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <div class="device-summary-grid">
      <a-card v-for="item in statusSummary" :key="item.label" class="device-summary-card" :bordered="false">
        <div class="smart-muted">{{ item.label }}</div>
        <div class="device-summary-value">{{ item.value }}</div>
      </a-card>
    </div>

    <a-spin :loading="loading" class="device-card-spin">
      <div v-if="devices.length" class="device-card-grid">
        <a-card v-for="device in devices" :key="device.id" class="device-card" :bordered="false">
          <div class="device-card-header">
            <div>
              <div class="device-sn">{{ device.sn }}</div>
              <div class="smart-muted">绑定日期 {{ device.bindDate || '-' }}</div>
            </div>
            <a-tag :color="statusColor(device.status)">{{ device.status }}</a-tag>
          </div>

          <div class="device-patient-row">
            <div>
              <div class="smart-muted">绑定患者</div>
              <div class="device-patient">{{ device.patient || '-' }}</div>
            </div>
            <a-space wrap>
              <a-button size="small" type="primary" :disabled="!device.bindPatientId" @click="openPatient(device)">
                <template #icon><sa-icon icon="ri:user-heart-line" :size="14" /></template>
                患者详情
              </a-button>
              <a-button size="small" @click="router.push(`/doctor/conversations?patientId=${device.bindPatientId || ''}`)">
                <template #icon><sa-icon icon="ri:file-list-3-line" :size="14" /></template>
                对话记录
              </a-button>
            </a-space>
          </div>

          <div class="device-battery">
            <div class="device-battery-header">
              <span>电量 {{ device.battery || '-' }}</span>
              <span>{{ device.wifi }}</span>
            </div>
            <div class="device-battery-track">
              <div class="device-battery-bar" :style="{ width: `${batteryPercent(device)}%` }"></div>
            </div>
          </div>

          <div class="device-field-grid">
            <div>
              <span class="smart-muted">固件</span>
              <strong>{{ device.firmware || '-' }}</strong>
            </div>
            <div>
              <span class="smart-muted">最后心跳</span>
              <strong>{{ device.lastHeartbeat || '-' }}</strong>
            </div>
            <div>
              <span class="smart-muted">离线时长</span>
              <strong>{{ device.offlineHours ? `${device.offlineHours} 小时` : '正常' }}</strong>
            </div>
            <div>
              <span class="smart-muted">下发状态</span>
              <strong>{{ device.dispatchStatus || '-' }}</strong>
            </div>
          </div>

          <div class="smart-toolbar device-card-actions">
            <div class="smart-row">
              <span class="smart-muted">操作</span>
              <a-tag>{{ device.dispatchStatus || '-' }}</a-tag>
            </div>
            <a-space wrap>
              <a-button size="small" @click="openEditDialog(device)">
                <template #icon><sa-icon icon="ri:edit-2-line" :size="14" /></template>
                编辑
              </a-button>
              <a-popconfirm :content="`确认解除设备 ${device.sn} 与 ${device.patient} 的绑定关系？`" @ok="unbindDevice(device)">
                <a-button size="small" status="danger" :disabled="!isDeviceBound(device)">
                  <template #icon><sa-icon icon="ri:link-unlink" :size="14" /></template>
                  确认解绑
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="暂无设备" />
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
          <div class="smart-toolbar" style="width: 100%">
            <span class="smart-muted">目前版本</span>
            <a-input v-model="deviceForm.firmware" readonly />
            <a-button type="primary" :disabled="deviceForm.firmware === latestFirmwareVersion" @click="handleFirmwareUpdate">
              <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
              更新版本
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="importVisible" title="导入设备" width="min(680px, calc(100vw - 32px))" :footer="false">
      <div class="import-drop">
        <a-textarea
          v-model="importText"
          :auto-size="{ minRows: 5, maxRows: 8 }"
          placeholder="将文件拖到此处，或点击选择。当前 mock 支持粘贴 CSV，每行一台设备，例如：PBX-202605-099,王秀兰,在线,90%,v2.1.3"
        />
        <a-alert style="margin-top: 12px" type="info">
          支持 .xlsx、.xls、.csv，至少包含设备 SN。已识别 {{ previewRows.length }} 台设备
        </a-alert>
      </div>
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
  sn: '',
  status: String(pickQueryValue(route.query.status))
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

const statusSummary = computed(() => {
  const counts = devices.value.reduce(
    (result, device) => {
      result.total += 1
      result.online += device.status === '在线' ? 1 : 0
      result.offline += device.status === '离线' ? 1 : 0
      result.unbound += device.status === '待分配' ? 1 : 0
      return result
    },
    { total: 0, online: 0, offline: 0, unbound: 0 }
  )

  return [
    { label: '设备总数', value: counts.total },
    { label: '在线设备', value: counts.online },
    { label: '离线设备', value: counts.offline },
    { label: '待分配设备', value: counts.unbound },
    { label: '已绑定设备', value: devices.value.filter((item) => isDeviceBound(item)).length }
  ]
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

const openPatient = (device) => {
  if (!device.bindPatientId) return
  router.push(`/doctor/patient-detail?patientId=${device.bindPatientId}`)
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
