<template>
  <ElDialog
    v-model="visible"
    title="新增患者建档"
    width="720px"
    class="patient-create-basic-dialog"
    :close-on-click-modal="!saving"
    @closed="resetDialog"
  >
    <template v-if="createdPatient">
      <ElResult icon="success" title="患者建档成功" :sub-title="successSubtitle" />

      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="姓名">{{ createdPatient.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="手机号">{{ createdPatient.phone }}</ElDescriptionsItem>
        <ElDescriptionsItem label="性别">{{ createdPatient.gender }}</ElDescriptionsItem>
        <ElDescriptionsItem label="出生年月日">{{ createdPatient.birthDate }}</ElDescriptionsItem>
        <ElDescriptionsItem label="设备状态">
          <ElTag :type="createdPatient.deviceStatusType">{{ createdPatient.deviceStatus }}</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="下一步">{{ nextStepText }}</ElDescriptionsItem>
      </ElDescriptions>
    </template>

    <ElForm v-else ref="formRef" :model="form" :rules="rules" label-width="110px">
      <ElRow :gutter="16">
        <ElCol :xs="24" :md="12">
          <ElFormItem label="患者姓名" prop="name">
            <ElInput v-model="form.name" placeholder="请输入患者姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="手机号" prop="phone">
            <ElInput v-model="form.phone" placeholder="请输入手机号" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="性别" prop="gender">
            <ElSelect v-model="form.gender" placeholder="请选择性别">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="出生年月日" prop="birthDate">
            <ElDatePicker
              v-model="form.birthDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择出生年月日"
              :disabled-date="disableFutureDate"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="设备绑定">
            <ElSelect
              v-model="form.deviceId"
              filterable
              :loading="devicesLoading"
              placeholder="请选择设备"
            >
              <ElOption label="暂不绑定设备" value="" />
              <ElOption
                v-for="device in availableDevices"
                :key="device.id"
                :label="`${device.sn} | ${device.status} | 电量 ${device.battery}`"
                :value="device.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <template v-if="createdPatient">
        <ElButton @click="visible = false">
          <template #icon><ArtSvgIcon icon="ri:user-search-line" /></template>
          返回患者管理
        </ElButton>
        <ElButton v-if="hasBoundDevice" type="primary" @click="goToMedicationPlan()">
          <template #icon><ArtSvgIcon icon="ri:file-list-3-line" /></template>
          继续设置用药计划
        </ElButton>
        <ElButton v-else type="primary" @click="goToDeviceBinding()">
          <template #icon><ArtSvgIcon icon="ri:link-m" /></template>
          继续绑定设备
        </ElButton>
      </template>
      <template v-else>
        <ElButton @click="visible = false">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消
        </ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSubmit">
          <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
          保存基础档案
        </ElButton>
      </template>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type { Device, Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'

  interface Props {
    modelValue: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success', patient: Patient): void
  }>()

  const router = useRouter()
  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const createdPatient = ref<Patient | null>(null)
  const availableDevices = ref<Device[]>([])
  const devicesLoading = ref(false)

  const createInitialForm = (): {
    name: string
    phone: string
    gender: string
    birthDate: string
    deviceId: number | ''
  } => ({
    name: '',
    phone: '',
    gender: '男',
    birthDate: '',
    deviceId: ''
  })

  const form = reactive(createInitialForm())

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birthDate: [{ required: true, message: '请选择出生年月日', trigger: 'change' }]
  }

  const selectedDevice = computed(() =>
    availableDevices.value.find((item) => String(item.id) === String(form.deviceId))
  )

  const hasBoundDevice = computed(
    () => Boolean(createdPatient.value?.deviceNo) && createdPatient.value?.deviceNo !== '未绑定'
  )

  const successSubtitle = computed(() =>
    hasBoundDevice.value ? '下一步可以继续设置用药计划' : '下一步需要先绑定设备，再设置用药计划'
  )

  const nextStepText = computed(() =>
    hasBoundDevice.value ? '设置用药计划' : '绑定药盒设备'
  )

  const isDeviceAvailable = (device: Device) =>
    !device.bindPatientId || device.patient === '-' || device.status === '待分配'

  const loadAvailableDevices = async () => {
    devicesLoading.value = true
    try {
      const result = await deviceApi.list({ page: 1, limit: 100 })
      availableDevices.value = (result.records || []).filter(isDeviceAvailable)
    } finally {
      devicesLoading.value = false
    }
  }

  const disableFutureDate = (date: Date) => date.getTime() > Date.now()

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

  const generatePatientNo = () => {
    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('')
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('')
    return `PAT-${date}-${time}`
  }

  const calculateAge = (birthDate: string) => {
    const birthday = new Date(`${birthDate}T00:00:00`)
    if (Number.isNaN(birthday.getTime())) return 0

    const today = new Date()
    let age = today.getFullYear() - birthday.getFullYear()
    const monthDiff = today.getMonth() - birthday.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age -= 1
    }
    return Math.max(age, 0)
  }

  const resetDialog = () => {
    Object.assign(form, createInitialForm())
    createdPatient.value = null
    saving.value = false
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    await formRef.value?.validate()
    saving.value = true
    try {
      const now = formatDateTime()
      const patient = await patientApi.save({
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
      const finalPatient = await bindSelectedDevice(patient)
      createdPatient.value = finalPatient
      emit('success', finalPatient)
      ElMessage.success(selectedDevice.value ? '患者已建档并绑定设备' : '患者基础档案已保存')
    } finally {
      saving.value = false
    }
  }

  const bindSelectedDevice = async (patient: Patient) => {
    const device = selectedDevice.value
    if (!device) return patient

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

    return patientApi.update({
      ...patient,
      deviceNo: savedDevice.sn || device.sn,
      deviceStatus: status,
      deviceStatusType: savedDevice.statusType || statusType,
      taskRisk: '待设置用药计划',
      updatedAt: formatDateTime()
    })
  }

  const goToDeviceBinding = (patient = createdPatient.value) => {
    if (!patient) return
    visible.value = false
    router.push({
      path: '/doctor/devices',
      query: {
        action: 'bind',
        patientId: patient.id,
        patientName: patient.name
      }
    })
  }

  const goToMedicationPlan = (patient = createdPatient.value) => {
    if (!patient) return
    visible.value = false
    router.push({
      path: '/doctor/plans',
      query: {
        patientId: patient.id,
        action: 'create'
      }
    })
  }

  watch(
    () => visible.value,
    (value) => {
      if (value) loadAvailableDevices()
    }
  )
</script>

<style lang="scss" scoped>
  :deep(.patient-create-basic-dialog) {
    .el-result {
      padding-top: 8px;
    }

    .el-select,
    .el-date-editor.el-input {
      width: 100%;
    }
  }
</style>
