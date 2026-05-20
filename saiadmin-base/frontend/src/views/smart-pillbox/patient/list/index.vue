<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>患者管理</h2>
        <p>维护患者基本信息、疾病信息、子女绑定和知情同意状态</p>
      </div>
    </div>

    <TableSearch v-if="showSearchBar" v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="primary" @click="router.push('/doctor/patient-create')">
            <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
            新增患者建档
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
        <template #patient="{ row }">
          <div>
            <b>{{ row.name }}</b>
            <div class="muted text-xs">{{ row.gender }} {{ row.age }} 岁 {{ row.phone }}</div>
          </div>
        </template>
        <template #diseases="{ row }">
          <ElSpace wrap>
            <ElTag v-for="disease in row.diseases" :key="disease" effect="plain">
              {{ disease }}
            </ElTag>
          </ElSpace>
        </template>
        <template #consent="{ row }">
          <ElSpace>
            <ElTag type="primary">已登记</ElTag>
            <ElTag :type="row.consent === '已同意' ? 'success' : 'warning'">{{ row.consent }}</ElTag>
          </ElSpace>
        </template>
        <template #deviceStatus="{ row }">
          <ElTag :type="row.deviceStatusType">{{ row.deviceNo }}</ElTag>
        </template>
        <template #taskRisk="{ row }">
          <ElTag :type="row.taskRisk.includes('漏服') ? 'danger' : row.taskRisk === '正常' ? 'success' : 'warning'">
            {{ row.taskRisk }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElSpace>
            <SaButton type="secondary" tool-tip="编辑" @click="showDialog('edit', row)" />
            <SaButton type="success" icon="ri:file-list-3-line" tool-tip="计划" @click="router.push('/doctor/plans')" />
            <SaButton type="primary" icon="ri:message-2-line" tool-tip="提醒" @click="router.push('/doctor/messages')" />
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
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import { useTable } from '@/hooks/core/useTable'
  import EditDialog from './modules/edit-dialog.vue'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'SmartPillboxPatientList' })

  const router = useRouter()
  const showSearchBar = ref(true)
  const searchForm = ref({ keyword: '', deviceStatus: '', consent: '' })

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
      apiFn: patientApi.list,
      columnsFactory: () => [
        { prop: 'patient', label: '患者', useSlot: true, minWidth: 160 },
        { prop: 'diseases', label: '基础疾病', useSlot: true, minWidth: 160 },
        { prop: 'consent', label: '实名/同意', useSlot: true, minWidth: 160 },
        { prop: 'deviceStatus', label: '药盒', useSlot: true, minWidth: 170 },
        { prop: 'child', label: '子女绑定', minWidth: 180, showOverflowTooltip: true },
        { prop: 'taskRisk', label: '最近任务', useSlot: true, width: 120 },
        { prop: 'operation', label: '操作', useSlot: true, width: 150, fixed: 'right' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { keyword: '', deviceStatus: '', consent: '' }
    await resetSearchParams()
    getData()
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
