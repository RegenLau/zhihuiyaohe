<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="760px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="16">
        <ElCol :xs="24" :md="12">
          <ElFormItem label="提醒类型" prop="type">
            <ElSelect v-model="formData.type" placeholder="请选择提醒类型">
              <ElOption label="子女提醒" value="子女提醒" />
              <ElOption label="复诊提醒" value="复诊提醒" />
              <ElOption label="系统提醒" value="系统提醒" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="患者" prop="patient">
            <ElInput v-model="formData.patient" placeholder="请输入患者姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="接收方" prop="receiver">
            <ElInput v-model="formData.receiver" placeholder="请输入接收方" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="渠道" prop="channel">
            <ElInput v-model="formData.channel" placeholder="请输入消息渠道" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="消息标题" prop="title">
            <ElInput v-model="formData.title" placeholder="请输入消息标题" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="消息正文" prop="content">
            <ElInput
              v-model="formData.content"
              type="textarea"
              :rows="4"
              placeholder="请输入消息正文"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
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
  import messageApi from '@/views/plugin/smart-pillbox/api/doctor/message'
  import type { ReminderMessage } from '@/views/plugin/smart-pillbox/api/doctor/types'

  interface Props {
    modelValue: boolean
    dialogType: string
    initialFormData?: Partial<ReminderMessage>
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

  const dialogTitle = computed(() => (props.dialogType === 'add' ? '创建提醒' : '编辑提醒'))
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: undefined as number | undefined,
    type: '子女提醒',
    patient: '',
    receiver: '',
    channel: '小程序消息中心',
    title: '',
    content: ''
  })

  const rules: FormRules = {
    type: [{ required: true, message: '请选择提醒类型', trigger: 'change' }],
    patient: [{ required: true, message: '请输入患者', trigger: 'blur' }],
    receiver: [{ required: true, message: '请输入接收方', trigger: 'blur' }],
    title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入消息正文', trigger: 'blur' }]
  }

  watch(
    () => props.initialFormData,
    (value) => {
      formData.id = value?.id
      formData.type = value?.type || '子女提醒'
      formData.patient = value?.patient || ''
      formData.receiver = value?.receiver || ''
      formData.channel = value?.channel || '小程序消息中心'
      formData.title = value?.title || ''
      formData.content = value?.content || ''
    },
    { immediate: true, deep: true }
  )

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload = {
      ...props.initialFormData,
      ...formData,
      status: props.initialFormData?.status || '已创建',
      statusType: props.initialFormData?.statusType || 'success',
      createTime: props.initialFormData?.createTime || '今日'
    }
    if (props.dialogType === 'add') {
      await messageApi.save(payload)
    } else {
      await messageApi.update(payload)
    }
    ElMessage.success('提醒消息已保存')
    visible.value = false
    emit('success')
  }
</script>
