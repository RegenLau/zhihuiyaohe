<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>提醒消息</h2>
        <p>创建复诊提醒、子女提醒和系统提醒，当前以小程序消息中心为主</p>
      </div>
    </div>

    <TableSearch
      v-if="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="primary" @click="showDialog('add')">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            创建提醒
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
        <template #message="{ row }">
          <div>
            <b>{{ row.title }}</b>
            <div class="muted text-xs">{{ row.content }}</div>
          </div>
        </template>
        <template #status="{ row }"
          ><ElTag :type="row.statusType">{{ row.status }}</ElTag></template
        >
        <template #operation="{ row }">
          <ElSpace>
            <SaButton type="success" icon="ri:eye-line" tool-tip="查看" @click="viewMessage(row)" />
            <SaButton type="secondary" tool-tip="编辑" @click="showDialog('edit', row)" />
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :initial-form-data="dialogData"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import messageApi from '@/views/plugin/smart-pillbox/api/doctor/message'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import { useTable } from '@/hooks/core/useTable'
  import EditDialog from './modules/edit-dialog.vue'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'SmartPillboxReminder' })

  const showSearchBar = ref(true)
  const searchForm = ref({ type: '', patient: '' })
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
    refreshCreate,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: messageApi.list,
      columnsFactory: () => [
        { prop: 'message', label: '消息', useSlot: true, minWidth: 220 },
        { prop: 'patient', label: '患者', width: 120 },
        { prop: 'receiver', label: '接收方', minWidth: 150 },
        { prop: 'channel', label: '渠道', minWidth: 150 },
        { prop: 'status', label: '状态', useSlot: true, width: 110 },
        { prop: 'createTime', label: '创建时间', width: 140 },
        { prop: 'operation', label: '操作', useSlot: true, width: 120, fixed: 'right' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { type: '', patient: '' }
    await resetSearchParams()
    getData()
  }

  const handleEditSuccess = () => {
    if (dialogType.value === 'add') {
      refreshCreate()
      return
    }
    refreshUpdate()
  }

  const viewMessage = (row: Record<string, any>) => {
    ElMessage.success(`${row.title} 已打开`)
  }
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
