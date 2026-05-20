<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="760px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElRow :gutter="16">
        <ElCol :xs="24" :md="12">
          <ElFormItem label="患者姓名" prop="name">
            <ElInput v-model="formData.name" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="手机号" prop="phone">
            <ElInput v-model="formData.phone" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="基础疾病" prop="diseasesText">
            <ElInput v-model="formData.diseasesText" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="家属信息" prop="child">
            <ElInput v-model="formData.child" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="诊疗备注" prop="remark">
            <ElInput v-model="formData.remark" type="textarea" :rows="3" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type { Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'

  interface Props {
    modelValue: boolean
    dialogType: string
    initialFormData?: Partial<Patient>
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

  const dialogTitle = computed(() => (props.dialogType === 'add' ? '新增患者档案' : '编辑患者档案'))
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    name: '',
    phone: '',
    child: '',
    diseasesText: '',
    remark: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
  }

  watch(
    () => props.initialFormData,
    (value) => {
      formData.id = value?.id
      formData.name = value?.name || ''
      formData.phone = value?.phone || ''
      formData.child = value?.child || ''
      formData.diseasesText = value?.diseases?.join('，') || ''
      formData.remark = value?.taskRisk || ''
    },
    { immediate: true, deep: true }
  )

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload = {
      ...props.initialFormData,
      id: formData.id,
      name: formData.name,
      phone: formData.phone,
      child: formData.child,
      diseases: formData.diseasesText
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      taskRisk: formData.remark || props.initialFormData?.taskRisk || '正常'
    }
    if (props.dialogType === 'add') {
      await patientApi.save(payload)
    } else {
      await patientApi.update(payload)
    }
    ElMessage.success('患者档案已保存')
    visible.value = false
    emit('success')
  }
</script>
