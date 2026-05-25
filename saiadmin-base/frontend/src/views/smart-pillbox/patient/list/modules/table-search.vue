<template>
  <SaSearchBar
    ref="searchBarRef"
    v-model="formData"
    label-width="76px"
    :showExpand="false"
    @reset="handleReset"
    @search="handleSearch"
  >
    <ElCol :xs="24" :sm="12" :md="7" :lg="6">
      <ElFormItem label="关键词" prop="keyword">
        <ElInput v-model="formData.keyword" placeholder="姓名/手机号" clearable />
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="7" :lg="6">
      <ElFormItem label="设备绑定" prop="deviceBindStatus">
        <ElSelect v-model="formData.deviceBindStatus" placeholder="全部" clearable>
          <ElOption label="已绑定" value="bound" />
          <ElOption label="未绑定" value="unbound" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol :xs="24" :sm="12" :md="7" :lg="6">
      <ElFormItem label="子女绑定" prop="childBindStatus">
        <ElSelect v-model="formData.childBindStatus" placeholder="全部" clearable>
          <ElOption label="已绑定" value="bound" />
          <ElOption label="未绑定" value="unbound" />
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
