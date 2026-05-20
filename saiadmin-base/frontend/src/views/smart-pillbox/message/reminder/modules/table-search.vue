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
      <ElFormItem label="提醒类型" prop="type">
        <ElSelect v-model="formData.type" clearable placeholder="全部">
          <ElOption label="复诊提醒" value="复诊提醒" />
          <ElOption label="子女提醒" value="子女提醒" />
          <ElOption label="系统提醒" value="系统提醒" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="8" :lg="6">
      <ElFormItem label="患者" prop="patient">
        <ElInput v-model="formData.patient" placeholder="请输入患者姓名" clearable />
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
