<template>
  <SaSearchBar
    ref="searchBarRef"
    v-model="formData"
    label-width="90px"
    :showExpand="false"
    @reset="handleReset"
    @search="handleSearch"
  >
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="关键词" prop="keyword">
        <ElInput v-model="formData.keyword" placeholder="姓名/手机号/档案编号" clearable />
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="药盒状态" prop="deviceStatus">
        <ElSelect v-model="formData.deviceStatus" placeholder="全部" clearable>
          <ElOption label="在线" value="在线" />
          <ElOption label="离线" value="离线" />
          <ElOption label="未绑定" value="未绑定" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="管理状态" prop="status">
        <ElSelect v-model="formData.status" placeholder="全部" clearable>
          <ElOption label="正常管理" value="正常管理" />
          <ElOption label="重点关注" value="重点关注" />
          <ElOption label="已归档" value="已归档" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="基础疾病" prop="disease">
        <ElSelect v-model="formData.disease" placeholder="全部" clearable>
          <ElOption label="高血压" value="高血压" />
          <ElOption label="糖尿病" value="糖尿病" />
          <ElOption label="冠心病" value="冠心病" />
          <ElOption label="高血脂" value="高血脂" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="过敏史" prop="hasAllergy">
        <ElSelect v-model="formData.hasAllergy" placeholder="全部" clearable>
          <ElOption label="有记录" value="yes" />
          <ElOption label="无记录" value="no" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
  </SaSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const handleSearch = () => {
    emit('search', formData.value)
  }

  const handleReset = () => {
    searchBarRef.value?.ref?.resetFields()
    emit('reset')
  }
</script>
