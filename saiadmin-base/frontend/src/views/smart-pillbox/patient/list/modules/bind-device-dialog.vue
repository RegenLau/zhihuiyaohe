<template>
  <ElDialog v-model="visible" title="绑定药盒设备" width="560px" @open="handleOpen">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="患者">
        <ElInput :model-value="patientLabel" readonly />
      </ElFormItem>
      <ElFormItem label="选择设备" prop="deviceId">
        <ElSelect
          v-model="formData.deviceId"
          placeholder="请选择可用设备"
          filterable
          clearable
          :loading="devicesLoading"
          class="w-full"
        >
          <ElOption
            v-for="device in availableDevices"
            :key="device.id"
            :label="`${device.sn} | ${device.status} | 电量 ${device.battery}`"
            :value="device.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="绑定后状态">
        <ElTag :type="selectedStatusType">{{ selectedStatus }}</ElTag>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">
        <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
        取消
      </ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSubmit">
        <template #icon><ArtSvgIcon icon="ri:link-m" /></template>
        保存绑定
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type { Device, Patient, StatusType } from '@/views/plugin/smart-pillbox/api/doctor/types'

  interface Props {
    modelValue: boolean
    patient?: Patient | null
  }

  const props = withDefaults(defineProps<Props>(), {
    patient: null
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formRef = ref<FormInstance>()
  const devicesLoading = ref(false)
  const saving = ref(false)
  const availableDevices = ref<Device[]>([])
  const formData = reactive({
    deviceId: '' as number | ''
  })

  const rules: FormRules = {
    deviceId: [{ required: true, message: '请选择可用设备', trigger: 'change' }]
  }

  const patientLabel = computed(() => {
    if (!props.patient) return ''
    return `${props.patient.name} ${props.patient.gender || ''} ${props.patient.age || ''} 岁`
  })

  const selectedDevice = computed(() =>
    availableDevices.value.find((item) => String(item.id) === String(formData.deviceId))
  )

  const selectedStatus = computed(() => {
    if (!selectedDevice.value) return '待选择'
    return selectedDevice.value.status === '离线' ? '离线' : '在线'
  })

  const selectedStatusType = computed<StatusType>(() => {
    if (!selectedDevice.value) return 'info'
    return selectedDevice.value.status === '离线' ? 'danger' : 'success'
  })

  const isDeviceAvailable = (device: Device) =>
    !device.bindPatientId || device.patient === '-' || device.status === '待分配'

  const formatDateTime = () => {
    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-')
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ].join(':')
    return `${date} ${time}`
  }

  const loadAvailableDevices = async () => {
    devicesLoading.value = true
    try {
      const result = await deviceApi.list({ page: 1, limit: 100 })
      availableDevices.value = (result.records || []).filter(isDeviceAvailable)
    } finally {
      devicesLoading.value = false
    }
  }

  const handleOpen = () => {
    formData.deviceId = ''
    formRef.value?.clearValidate()
    loadAvailableDevices()
  }

  const handleSubmit = async () => {
    await formRef.value?.validate()
    if (!props.patient || !selectedDevice.value) return

    saving.value = true
    try {
      const patient = await patientApi.read(props.patient.id)
      const device = selectedDevice.value
      const status = device.status === '离线' ? '离线' : '在线'
      const statusType = status === '离线' ? 'danger' : 'success'
      const savedDevice = await deviceApi.update({
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

      await patientApi.update({
        ...patient,
        deviceNo: savedDevice.sn || device.sn,
        deviceStatus: status,
        deviceStatusType: savedDevice.statusType || statusType,
        taskRisk: '待设置用药计划',
        updatedAt: formatDateTime()
      })

      ElMessage.success('设备绑定成功')
      visible.value = false
      emit('success')
    } finally {
      saving.value = false
    }
  }
</script>
