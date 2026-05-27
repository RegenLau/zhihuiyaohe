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

    <div class="ma-content-block p-2">
      <a-table
        row-key="id"
        :data="devices"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 1080 }"
        table-layout-fixed
      >
        <template #columns>
          <a-table-column title="设备编号" data-index="sn" :width="180">
            <template #cell="{ record }">
              <a-link @click="openEditDialog(record)">{{ record.sn }}</a-link>
              <div class="smart-muted">绑定日期 {{ record.bindDate || '-' }}</div>
            </template>
          </a-table-column>
          <a-table-column title="绑定患者" data-index="patient" :width="150">
            <template #cell="{ record }">
              <a-link v-if="record.bindPatientId" @click="router.push(`/doctor/patient-detail?patientId=${record.bindPatientId}`)">
                {{ record.patient || '-' }}
              </a-link>
              <span v-else>{{ record.patient || '-' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="110">
            <template #cell="{ record }">
              <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="电量" data-index="battery" :width="170">
            <template #cell="{ record }">
              <a-space direction="vertical" :size="4" fill>
                <span>{{ record.battery || '-' }}</span>
                <a-progress :percent="batteryPercent(record) / 100" size="small" :show-text="false" />
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="固件" data-index="firmware" :width="120" />
          <a-table-column title="最后心跳" data-index="lastHeartbeat" :width="180">
            <template #cell="{ record }">{{ record.lastHeartbeat || '-' }}</template>
          </a-table-column>
          <a-table-column title="操作" :width="190">
            <template #cell="{ record }">
              <a-space>
                <a-button size="mini" @click="openRecordsDrawer(record)">设备记录</a-button>
                <a-button size="mini" @click="openEditDialog(record)">编辑</a-button>
                <a-button size="mini" status="danger" :disabled="!isDeviceBound(record)" @click="openUnbindConfirm(record)">解绑</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

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
            <a-tag color="arcoblue">仅展示</a-tag>
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

    <a-drawer v-model:visible="recordsDrawerVisible" :width="720" title="设备记录" unmount-on-close>
      <a-spin :loading="recordsLoading">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="设备编号">{{ selectedDevice.sn }}</a-descriptions-item>
          <a-descriptions-item label="绑定患者">{{ selectedDevice.patient }}</a-descriptions-item>
          <a-descriptions-item label="在线状态"><a-tag :color="statusColor(selectedDevice.status)">{{ selectedDevice.status }}</a-tag></a-descriptions-item>
          <a-descriptions-item label="最后心跳">{{ selectedDevice.lastHeartbeat || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-tabs default-active-key="events" class="smart-block-gap-sm">
          <a-tab-pane key="events" title="开关记录与事件">
            <a-table row-key="id" :data="deviceEventRecords" :pagination="false" :scroll="{ x: 640 }" size="small">
              <template #columns>
                <a-table-column title="时间" data-index="eventTime" :width="150" />
                <a-table-column title="事件" data-index="eventType" :width="100" />
                <a-table-column title="药品" data-index="medicine" :width="150" />
                <a-table-column title="状态" data-index="matchedPlan" :width="100">
                  <template #cell="{ record }"><a-tag :color="record.matchedPlan ? 'green' : 'orange'">{{ record.matchedPlan ? '匹配' : '需确认' }}</a-tag></template>
                </a-table-column>
                <a-table-column title="说明" data-index="note" />
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="dispatch" title="计划下发记录">
            <a-table row-key="id" :data="dispatchRecords" :pagination="false" :scroll="{ x: 640 }" size="small">
              <template #columns>
                <a-table-column title="下发时间" data-index="dispatchTime" :width="150" />
                <a-table-column title="计划" data-index="planTitle" />
                <a-table-column title="状态" data-index="status" :width="90">
                  <template #cell="{ record }"><a-tag :color="statusColor(record.statusType || record.status)">{{ record.status }}</a-tag></template>
                </a-table-column>
                <a-table-column title="说明" data-index="failReason" :width="120">
                  <template #cell="{ record }">{{ record.failReason || '-' }}</template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </a-drawer>
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
const recordsDrawerVisible = ref(false)
const dialogType = ref('edit')
const guidedBinding = ref(false)
const latestFirmwareVersion = 'v2.1.3'
const importText = ref('')
const recordsLoading = ref(false)
const deviceEventRecords = ref([])
const dispatchRecords = ref([])
const selectedDevice = reactive({})

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

const openRecordsDrawer = async (device) => {
  Object.assign(selectedDevice, device)
  recordsDrawerVisible.value = true
  recordsLoading.value = true
  try {
    const [eventsResponse, dispatchResponse] = await Promise.all([
      deviceApi.events({ sn: device.sn, limit: 100 }),
      deviceApi.dispatchRecords({ sn: device.sn, limit: 100 })
    ])
    deviceEventRecords.value = getRecords(eventsResponse)
    dispatchRecords.value = getRecords(dispatchResponse)
  } finally {
    recordsLoading.value = false
  }
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
