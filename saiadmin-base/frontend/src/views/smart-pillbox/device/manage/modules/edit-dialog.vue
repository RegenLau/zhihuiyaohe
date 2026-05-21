<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="640px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="设备 SN" prop="sn">
        <ElInput v-model="formData.sn" placeholder="请输入设备 SN" />
      </ElFormItem>
      <ElFormItem label="绑定患者" prop="patient">
        <ElInput v-model="formData.patient" placeholder="请输入绑定患者姓名" />
      </ElFormItem>
      <ElFormItem label="在线状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="请选择在线状态">
          <ElOption label="在线" value="在线" />
          <ElOption label="离线" value="离线" />
          <ElOption label="待分配" value="待分配" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="绑定方式">
        <ElSelect v-model="formData.bindMode" placeholder="请选择绑定方式">
          <ElOption label="后台选择设备" value="后台选择设备" />
          <ElOption label="患者小程序扫码" value="患者小程序扫码" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="电量">
        <ElInputNumber v-model="formData.batteryLevel" :min="0" :max="100" />
      </ElFormItem>
      <ElFormItem label="固件版本">
        <ElInput v-model="formData.firmware" placeholder="请输入固件版本" />
      </ElFormItem>
      <ElFormItem label="同步状态">
        <ElSelect v-model="formData.dispatchStatus" placeholder="请选择同步状态">
          <ElOption label="计划已同步" value="计划已同步" />
          <ElOption label="计划待重发" value="计划待重发" />
          <ElOption label="未绑定" value="未绑定" />
        </ElSelect>
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
  }

  const props = withDefaults(defineProps<Props>(), {
    initialFormData: () => ({})
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const dialogTitle = computed(() => (props.dialogType === 'add' ? '绑定药盒' : '编辑设备'))
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    sn: '',
    patient: '',
    status: '在线',
    bindMode: '后台选择设备',
    batteryLevel: 100,
    firmware: 'v2.1.3',
    dispatchStatus: '计划已同步'
  })

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
      formData.bindMode = '后台选择设备'
      formData.batteryLevel = value?.batteryLevel || Number(value?.battery?.replace('%', '')) || 100
      formData.firmware = value?.firmware || 'v2.1.3'
      formData.dispatchStatus = value?.dispatchStatus || '计划已同步'
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
    const payload = {
      ...props.initialFormData,
      id: formData.id,
      sn: formData.sn,
      patient: formData.patient,
      status: formData.status,
      statusType: statusTypeMap[formData.status as keyof typeof statusTypeMap] || 'info',
      battery: `${formData.batteryLevel}%`,
      batteryLevel: formData.batteryLevel,
      firmware: formData.firmware,
      dispatchStatus: formData.dispatchStatus,
      wifi: formData.status === '离线' ? '未连接' : '已连接',
      wifiConnected: formData.status !== '离线'
    }
    if (props.dialogType === 'add') {
      await deviceApi.save(payload)
    } else {
      await deviceApi.update(payload)
    }
    ElMessage.success('设备绑定关系已保存')
    visible.value = false
    emit('success')
  }
</script>
