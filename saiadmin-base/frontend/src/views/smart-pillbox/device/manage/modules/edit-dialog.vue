<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="设备 SN" prop="sn">
        <ElInput v-model="formData.sn" placeholder="请输入设备 SN" />
      </ElFormItem>
      <ElFormItem label="绑定患者" prop="patient">
        <ElInput
          v-model="formData.patient"
          placeholder="请输入绑定患者姓名"
          :readonly="props.patientReadonly"
          :disabled="isEdit"
        />
      </ElFormItem>
      <ElFormItem v-if="isEdit" label="绑定日期">
        <ElInput v-model="formData.bindDate" disabled />
      </ElFormItem>
      <ElFormItem label="在线状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择在线状态" :disabled="isEdit">
          <ElOption label="在线" value="在线" />
          <ElOption label="离线" value="离线" />
          <ElOption label="待分配" value="待分配" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="电量">
        <ElInputNumber v-model="formData.batteryLevel" :min="0" :max="100" :disabled="isEdit" />
      </ElFormItem>
      <ElFormItem label="固件更新">
        <div class="firmware-update-row">
          <span class="firmware-version">目前版本 {{ formData.firmware }}</span>
          <ElButton
            type="primary"
            plain
            :disabled="formData.firmware === latestFirmwareVersion"
            @click="handleFirmwareUpdate"
          >
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            更新版本
          </ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">
        <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
        取消
      </ElButton>
      <ElButton type="primary" @click="handleSubmit">
        <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import type { Device } from '@/views/plugin/smart-pillbox/api/doctor/types'

  interface Props {
    modelValue: boolean
    dialogType: string
    initialFormData?: Partial<Device>
    patientReadonly?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    initialFormData: () => ({}),
    patientReadonly: false
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success', value: Partial<Device>): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const dialogTitle = computed(() => (props.dialogType === 'add' ? '绑定药盒' : '编辑设备'))
  const isEdit = computed(() => props.dialogType === 'edit')
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    sn: '',
    patient: '',
    status: '在线',
    batteryLevel: 100,
    firmware: 'v2.1.3',
    bindDate: ''
  })
  const latestFirmwareVersion = 'v2.1.3'

  const rules: FormRules = {
    sn: [{ required: true, message: '请输入设备 SN', trigger: 'blur' }],
    patient: [{ required: true, message: '请输入绑定患者', trigger: 'blur' }],
    status: [{ required: true, message: '请选择在线状态', trigger: 'change' }]
  }

  watch(
    () => props.initialFormData,
    (value) => {
      formData.id = value?.id
      formData.sn = value?.sn || ''
      formData.patient = value?.patient || ''
      formData.status = value?.status || '在线'
      formData.batteryLevel = value?.batteryLevel || Number(value?.battery?.replace('%', '')) || 100
      formData.firmware = value?.firmware || 'v2.1.3'
      formData.bindDate = value?.bindDate || ''
    },
    { immediate: true, deep: true }
  )

  const statusTypeMap = {
    在线: 'success',
    离线: 'danger',
    待分配: 'warning'
  } as const

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload: Partial<Device> = {
      ...props.initialFormData,
      id: formData.id,
      bindPatientId: props.initialFormData?.bindPatientId ?? null,
      sn: formData.sn,
      patient: formData.patient,
      status: formData.status,
      statusType: statusTypeMap[formData.status as keyof typeof statusTypeMap] || 'info',
      battery: `${formData.batteryLevel}%`,
      batteryLevel: formData.batteryLevel,
      firmware: formData.firmware,
      bindDate: props.initialFormData?.bindDate || formData.bindDate || new Date().toISOString().slice(0, 10),
      wifi: formData.status === '离线' ? '未连接' : '已连接',
      wifiConnected: formData.status !== '离线'
    }
    let savedDevice: Partial<Device>
    if (props.dialogType === 'add') {
      savedDevice = await deviceApi.save(payload)
    } else {
      savedDevice = await deviceApi.update(payload)
    }
    ElMessage.success(props.dialogType === 'add' ? '设备绑定关系已保存' : '设备信息已保存')
    visible.value = false
    emit('success', savedDevice || payload)
  }

  const handleFirmwareUpdate = () => {
    if (formData.firmware === latestFirmwareVersion) {
      ElMessage.info('当前已是最新版本')
      return
    }

    formData.firmware = latestFirmwareVersion
    ElMessage.success(`固件已更新至 ${latestFirmwareVersion}`)
  }
</script>

<style lang="scss" scoped>
  .firmware-update-row {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  .firmware-version {
    flex: 1;
    min-width: 0;
    padding: 0 12px;
    color: var(--art-gray-800);
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    line-height: 32px;
  }
</style>
