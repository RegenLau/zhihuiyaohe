<template>
  <ElDialog v-model="visible" title="导入设备" width="680px" destroy-on-close>
    <div class="device-import-dialog">
      <ElUpload
        ref="uploadRef"
        v-model:file-list="fileList"
        drag
        action="#"
        accept=".xlsx,.xls,.csv"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
      >
        <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 .xlsx、.xls、.csv，至少包含设备 SN</div>
        </template>
      </ElUpload>

      <ElAlert
        v-if="parsedRows.length"
        class="mt-4"
        type="success"
        :closable="false"
        show-icon
        :title="`已识别 ${parsedRows.length} 台设备`"
      />

      <ElTable v-if="previewRows.length" :data="previewRows" class="mt-4" height="220px">
        <ElTableColumn prop="sn" label="设备 SN" min-width="150" />
        <ElTableColumn prop="patient" label="绑定患者" min-width="110" />
        <ElTableColumn prop="status" label="在线状态" width="100" />
        <ElTableColumn prop="battery" label="电量" width="90" />
        <ElTableColumn prop="firmware" label="固件版本" width="120" />
      </ElTable>
    </div>

    <template #footer>
      <ElButton @click="visible = false">
        <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
        取消
      </ElButton>
      <ElButton type="primary" :loading="importing" @click="handleSubmit">
        <template #icon><ArtSvgIcon icon="ri:import-line" /></template>
        确认导入
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import * as XLSX from 'xlsx'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { ElMessage, genFileId } from 'element-plus'
  import type {
    UploadFile,
    UploadFiles,
    UploadInstance,
    UploadProps,
    UploadRawFile,
    UploadUserFile
  } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import type { Device, StatusType } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'DeviceImportDialog' })

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  interface ImportDeviceRow extends Partial<Device> {
    sn: string
  }

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const uploadRef = ref<UploadInstance>()
  const fileList = ref<UploadUserFile[]>([])
  const parsedRows = ref<ImportDeviceRow[]>([])
  const importing = ref(false)
  const previewRows = computed(() => parsedRows.value.slice(0, 5))

  const statusTypeMap = {
    在线: 'success',
    离线: 'danger',
    待分配: 'warning'
  } as const

  const today = () => new Date().toISOString().slice(0, 10)

  const normalizeKey = (key: string) => key.replace(/\s+/g, '').toLowerCase()

  const getValue = (row: Record<string, unknown>, keys: string[]) => {
    const normalizedKeys = keys.map(normalizeKey)
    const matched = Object.entries(row).find(([key]) => normalizedKeys.includes(normalizeKey(key)))
    return matched?.[1] == null ? '' : String(matched[1]).trim()
  }

  const parseBatteryLevel = (value: string) => {
    const matched = value.match(/\d+/)
    if (!matched) return 100
    return Math.min(Number(matched[0]), 100)
  }

  const buildDeviceRow = (row: Record<string, unknown>): ImportDeviceRow | null => {
    const sn = getValue(row, ['设备 SN', '设备SN', '设备编号', 'SN', 'sn', 'deviceSn'])
    if (!sn) return null

    const patient = getValue(row, ['绑定患者', '患者', '患者姓名', 'patient']) || '-'
    const importedStatus = getValue(row, ['在线状态', '设备状态', '状态', 'status'])
    const status = importedStatus || (patient === '-' ? '待分配' : '在线')
    const batteryLevel = parseBatteryLevel(getValue(row, ['电量', 'battery', 'batteryLevel']))
    const firmware = getValue(row, ['固件版本', 'firmware']) || 'v2.1.3'
    const wifi =
      getValue(row, ['WiFi 状态', 'WIFI 状态', 'wifi']) || (status === '离线' ? '未连接' : '已连接')
    const bindDate = getValue(row, ['绑定日期', 'bindDate']) || (patient === '-' ? '-' : today())
    const dispatchStatus =
      getValue(row, ['计划同步', '同步状态', 'dispatchStatus']) ||
      (patient === '-' ? '未绑定' : '计划待下发')
    const statusType: StatusType = statusTypeMap[status as keyof typeof statusTypeMap] || 'info'

    return {
      sn,
      bindPatientId: null,
      patient,
      status,
      statusType,
      battery: `${batteryLevel}%`,
      batteryLevel,
      wifi,
      wifiConnected: wifi !== '未连接',
      firmware,
      bindDate,
      lastHeartbeat: getValue(row, ['最后心跳', 'lastHeartbeat']) || null,
      dispatchStatus
    } satisfies ImportDeviceRow
  }

  const parseFile = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })
    parsedRows.value = rows.map(buildDeviceRow).filter((item): item is ImportDeviceRow => Boolean(item))

    if (!parsedRows.value.length) {
      ElMessage.warning('未识别到设备数据')
    }
  }

  const handleFileChange = async (file: UploadFile) => {
    if (!file.raw) return
    await parseFile(file.raw)
  }

  const handleExceed: UploadProps['onExceed'] = (files) => {
    uploadRef.value?.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value?.handleStart(file)
  }

  const handleRemove = (_file: UploadFile, files: UploadFiles) => {
    if (!files.length) {
      parsedRows.value = []
    }
  }

  const resetDialog = () => {
    fileList.value = []
    parsedRows.value = []
    importing.value = false
  }

  const handleSubmit = async () => {
    if (!parsedRows.value.length) {
      ElMessage.warning('请先选择设备导入文件')
      return
    }

    importing.value = true
    try {
      await Promise.all(parsedRows.value.map((item) => deviceApi.save(item)))
      ElMessage.success(`已导入 ${parsedRows.value.length} 台设备`)
      emit('success')
      visible.value = false
    } finally {
      importing.value = false
    }
  }

  watch(visible, (value) => {
    if (!value) resetDialog()
  })
</script>

<style lang="scss" scoped>
  .device-import-dialog {
    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }
</style>
