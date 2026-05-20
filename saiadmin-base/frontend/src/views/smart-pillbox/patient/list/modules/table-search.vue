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
