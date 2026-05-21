<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>设备管理</h2>
        <p>维护药盒设备绑定关系、在线状态、开关记录和计划下发记录</p>
      </div>
    </div>

    <TableSearch
      v-if="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="summary-grid mb-4">
      <div v-for="item in deviceSummary" :key="item.label" class="summary-item">
        <span class="summary-number" :class="item.className">{{ item.value }}</span>
        <span class="muted">{{ item.label }}</span>
      </div>
    </div>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="primary" @click="showDialog('add')">
            <template #icon><ArtSvgIcon icon="ri:link-m" /></template>
            绑定药盒
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :data="data"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @sort-change="handleSortChange"
      >
        <template #status="{ row }">
          <ElTag :type="row.statusType">{{ row.status }}</ElTag>
        </template>
        <template #battery="{ row }">
          <ElProgress
            :percentage="Number(row.batteryLevel ?? String(row.battery).replace('%', '')) || 0"
            :stroke-width="8"
            :status="Number(row.batteryLevel) < 20 ? 'exception' : undefined"
          />
        </template>
        <template #dispatchStatus="{ row }">
          <ElTag :type="row.dispatchStatus?.includes('待') ? 'warning' : 'success'" effect="plain">
            {{ row.dispatchStatus || '未同步' }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElSpace>
            <SaButton
              type="success"
              icon="ri:file-list-3-line"
              tool-tip="对话记录"
              @click="router.push(`/doctor/conversations?patientId=${row.bindPatientId || ''}`)"
            />
            <SaButton type="secondary" tool-tip="编辑" @click="showDialog('edit', row)" />
            <SaButton type="error" tool-tip="解绑" @click="unbindDevice(row)" />
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :initial-form-data="dialogData"
      @success="refreshUpdate"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import { useTable } from '@/hooks/core/useTable'
  import type { Device } from '@/views/plugin/smart-pillbox/api/doctor/types'
  import EditDialog from './modules/edit-dialog.vue'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'SmartPillboxDeviceManage' })

  const router = useRouter()
  const showSearchBar = ref(true)
  const searchForm = ref({ sn: '', status: '' })
  const { dialogType, dialogVisible, dialogData, showDialog } = useSaiAdmin()

  const {
    columns,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    handleSortChange,
    refreshData,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: deviceApi.list,
      columnsFactory: () => [
        { prop: 'sn', label: '设备 SN', minWidth: 170 },
        { prop: 'patient', label: '绑定患者', minWidth: 130 },
        { prop: 'status', label: '在线状态', useSlot: true, width: 110 },
        { prop: 'battery', label: '电量', useSlot: true, width: 140 },
        { prop: 'wifi', label: 'WiFi 状态', width: 120 },
        { prop: 'firmware', label: '固件版本', width: 120 },
        { prop: 'lastHeartbeat', label: '最后心跳', width: 160 },
        { prop: 'dispatchStatus', label: '计划同步', useSlot: true, width: 120 },
        { prop: 'bindDate', label: '绑定日期', width: 140 },
        { prop: 'operation', label: '操作', useSlot: true, width: 150, fixed: 'right' }
      ]
    }
  })

  const deviceSummary = computed(() => {
    const records = (data.value || []) as Device[]
    return [
      {
        label: '在线设备',
        value: records.filter((item) => item.status === '在线').length,
        className: 'is-success'
      },
      {
        label: '离线设备',
        value: records.filter((item) => item.status === '离线').length,
        className: 'is-danger'
      },
      {
        label: '待分配设备',
        value: records.filter((item) => item.status === '待分配').length,
        className: 'is-warning'
      },
      {
        label: '已绑定设备',
        value: records.filter((item) => item.patient !== '-').length,
        className: ''
      }
    ]
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { sn: '', status: '' }
    await resetSearchParams()
    getData()
  }

  const unbindDevice = async (row: Record<string, any>) => {
    await deviceApi.update({
      ...row,
      bindPatientId: null,
      patient: '-',
      status: '待分配',
      statusType: 'warning',
      dispatchStatus: '未绑定'
    })
    ElMessage.success('设备已解绑')
    refreshUpdate()
  }
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
