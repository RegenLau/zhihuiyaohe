<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>设备管理</h2>
        <p>维护药盒设备绑定关系、在线状态、开关记录和计划下发记录</p>
      </div>
      <ElButton type="primary" @click="bindVisible = true">
        <template #icon><ArtSvgIcon icon="ri:link" /></template>
        绑定药盒
      </ElButton>
    </div>

    <SaSearchBar v-model="searchForm" @search="handleSearch" @reset="handleReset">
      <ElCol :span="6"><ElFormItem label="设备 SN"><ElInput v-model="searchForm.sn" clearable /></ElFormItem></ElCol>
      <ElCol :span="6">
        <ElFormItem label="在线状态">
          <ElSelect v-model="searchForm.status" clearable placeholder="全部">
            <ElOption label="在线" value="在线" />
            <ElOption label="离线" value="离线" />
            <ElOption label="待分配" value="待分配" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </SaSearchBar>

    <div class="summary-grid mb-4">
      <div class="summary-item"><span class="summary-number text-success">15</span><span class="muted">在线设备</span></div>
      <div class="summary-item"><span class="summary-number text-danger">3</span><span class="muted">离线设备</span></div>
      <div class="summary-item"><span class="summary-number">1</span><span class="muted">待分配设备</span></div>
      <div class="summary-item"><span class="summary-number">18</span><span class="muted">已绑定设备</span></div>
    </div>

    <div class="card-grid">
      <ElCard v-for="device in filteredDevices" :key="device.id" shadow="never">
        <template #header>
          <div class="flex justify-between items-start gap-3">
            <div>
              <div class="muted text-xs">DEVICE</div>
              <b>{{ device.sn }}</b>
            </div>
            <ElTag :type="device.statusType">{{ device.status }}</ElTag>
          </div>
        </template>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="绑定患者">{{ device.patient }}</ElDescriptionsItem>
          <ElDescriptionsItem label="电量">{{ device.battery }}</ElDescriptionsItem>
          <ElDescriptionsItem label="WiFi 状态">{{ device.wifi }}</ElDescriptionsItem>
          <ElDescriptionsItem label="固件版本">{{ device.firmware }}</ElDescriptionsItem>
          <ElDescriptionsItem label="绑定日期">{{ device.bindDate }}</ElDescriptionsItem>
        </ElDescriptions>
        <div class="flex gap-2 mt-4">
          <ElButton class="flex-1">开关记录</ElButton>
          <ElButton class="flex-1" type="danger">解绑设备</ElButton>
        </div>
      </ElCard>
    </div>

    <ElDialog v-model="bindVisible" title="绑定药盒" width="640px">
      <ElForm label-width="100px">
        <ElFormItem label="设备 SN"><ElInput model-value="PBX-202605-021" /></ElFormItem>
        <ElFormItem label="绑定患者"><ElInput model-value="陈德明" /></ElFormItem>
        <ElFormItem label="绑定方式">
          <ElSelect model-value="后台选择设备"><ElOption label="后台选择设备" value="后台选择设备" /><ElOption label="患者小程序扫码" value="患者小程序扫码" /></ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="bindVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveBind">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { devices } from '../../data'

  defineOptions({ name: 'SmartPillboxDeviceManage' })

  const searchForm = ref({ sn: '', status: '' })
  const filteredDevices = ref([...devices])
  const bindVisible = ref(false)

  const handleSearch = () => {
    filteredDevices.value = devices.filter((device) => {
      const snMatched = !searchForm.value.sn || device.sn.includes(searchForm.value.sn)
      const statusMatched = !searchForm.value.status || device.status === searchForm.value.status
      return snMatched && statusMatched
    })
  }

  const handleReset = () => {
    searchForm.value = { sn: '', status: '' }
    filteredDevices.value = [...devices]
  }

  const saveBind = () => {
    bindVisible.value = false
    ElMessage.success('设备绑定关系已保存')
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
