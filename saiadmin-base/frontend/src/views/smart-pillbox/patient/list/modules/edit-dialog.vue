<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="760px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElRow :gutter="16">
        <ElCol :xs="24" :md="12">
          <ElFormItem label="患者姓名" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入患者姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="手机号" prop="phone">
            <ElInput v-model="formData.phone" placeholder="请输入手机号" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="基础疾病" prop="diseasesText">
            <ElInput v-model="formData.diseasesText" placeholder="多个疾病用逗号分隔" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="管理状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择管理状态">
              <ElOption label="正常管理" value="正常管理" />
              <ElOption label="重点关注" value="重点关注" />
              <ElOption label="已归档" value="已归档" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="家属信息" prop="child">
            <ElInput v-model="formData.child" placeholder="请输入家属姓名和联系方式" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :md="12">
          <ElFormItem label="管理药师" prop="managementPharmacist">
            <ElInput v-model="formData.managementPharmacist" placeholder="请输入管理药师" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="联系地址" prop="address">
            <ElInput v-model="formData.address" placeholder="请输入联系地址" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="联系人" prop="contactsText">
            <ElInput
              v-model="formData.contactsText"
              type="textarea"
              :rows="2"
              placeholder="每行填写：关系，姓名，电话"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="过敏史" prop="allergiesText">
            <ElInput
              v-model="formData.allergiesText"
              type="textarea"
              :rows="2"
              placeholder="每行填写：过敏源，反应"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="诊疗备注" prop="remark">
            <ElInput
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入诊疗备注"
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
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type {
    Patient,
    PatientAllergy,
    PatientContact
  } from '@/views/plugin/smart-pillbox/api/doctor/types'

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
    status: '正常管理' as Patient['status'],
    managementPharmacist: '',
    address: '',
    contactsText: '',
    allergiesText: '',
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
      formData.status = value?.status || '正常管理'
      formData.managementPharmacist = value?.managementPharmacist || ''
      formData.address = value?.address || ''
      formData.contactsText =
        value?.contacts
          ?.map((item) => `${item.relation}，${item.name}，${item.phone}`)
          .join('\n') || ''
      formData.allergiesText =
        value?.allergies?.map((item) => `${item.allergen}，${item.reaction}`).join('\n') || ''
      formData.remark = value?.taskRisk || ''
    },
    { immediate: true, deep: true }
  )

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const contacts = formData.contactsText
      .split(/\n|；|;/)
      .map((line, index) => {
        const [relation = '', name = '', phone = ''] = line.split(/[，,]/).map((item) => item.trim())
        return relation && name
          ? {
              id: `CT-EDIT-${index}`,
              relation,
              name,
              phone,
              isPrimary: index === 0
            }
          : null
      })
      .filter((item): item is PatientContact => Boolean(item))
    const allergies = formData.allergiesText
      .split(/\n|；|;/)
      .map((line, index) => {
        const [allergen = '', reaction = ''] = line.split(/[，,]/).map((item) => item.trim())
        return allergen
          ? {
              id: `ALG-EDIT-${index}`,
              allergenType: 'drug',
              allergen,
              severity: 'moderate',
              reaction: reaction || '待补充'
            }
          : null
      })
      .filter((item): item is PatientAllergy => Boolean(item))
    const payload = {
      ...props.initialFormData,
      id: formData.id,
      name: formData.name,
      phone: formData.phone,
      child: formData.child,
      status: formData.status,
      managementPharmacist: formData.managementPharmacist,
      address: formData.address,
      contacts,
      allergies,
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
