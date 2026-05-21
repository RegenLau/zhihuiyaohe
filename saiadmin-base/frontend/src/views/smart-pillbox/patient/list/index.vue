<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>患者管理</h2>
        <p>维护患者基本信息、疾病信息、子女绑定和药盒状态</p>
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
        <template #deviceStatus="{ row }">
          <ElTag :type="row.deviceStatusType">{{ row.deviceStatus }}</ElTag>
        </template>
        <template #allergy="{ row }">
          <ElTag :type="row.allergies?.length ? 'warning' : 'info'" effect="plain">
            {{ row.allergies?.length ? `${row.allergies.length} 条` : '无记录' }}
          </ElTag>
        </template>
        <template #child="{ row }">
          <ElTag :type="getChildStatusType(row.child)" effect="plain">
            {{ getChildStatus(row.child) }}
          </ElTag>
        </template>
        <template #completionRate="{ row }">
          <ElProgress
            :percentage="row.completionRate"
            :stroke-width="8"
            :status="row.completionRate < 60 ? 'exception' : row.completionRate < 85 ? 'warning' : 'success'"
          />
        </template>
        <template #taskRisk="{ row }">
          <ElTag
            :type="
              row.taskRisk.includes('漏服')
                ? 'danger'
                : row.taskRisk === '正常'
                  ? 'success'
                  : 'warning'
            "
          >
            {{ row.taskRisk }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElSpace>
            <SaButton
              type="success"
              icon="ri:eye-line"
              tool-tip="详情"
              @click="router.push(`/doctor/patient-detail?id=${row.id}`)"
            />
            <SaButton type="secondary" tool-tip="编辑" @click="showDialog('edit', row)" />
            <SaButton
              type="success"
              icon="ri:file-list-3-line"
              tool-tip="计划"
              @click="router.push(`/doctor/plans?patientId=${row.id}`)"
            />
            <SaButton
              type="primary"
              icon="ri:message-2-line"
              tool-tip="提醒"
              @click="router.push(`/doctor/messages?patient=${row.name}`)"
            />
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
  const searchForm = ref({ keyword: '', deviceStatus: '', status: '', disease: '', hasAllergy: '' })

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
        { prop: 'deviceStatus', label: '设备状态', useSlot: true, width: 120 },
        { prop: 'allergy', label: '过敏史', useSlot: true, width: 110 },
        { prop: 'child', label: '子女绑定状态', useSlot: true, width: 140 },
        { prop: 'completionRate', label: '完成率', useSlot: true, width: 150 },
        { prop: 'taskRisk', label: '最近任务', useSlot: true, width: 120 },
        { prop: 'operation', label: '操作', useSlot: true, width: 190, fixed: 'right' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { keyword: '', deviceStatus: '', status: '', disease: '', hasAllergy: '' }
    await resetSearchParams()
    getData()
  }

  const isChildBound = (child?: string) => Boolean(child && !['待绑定', '未绑定'].includes(child))

  const getChildStatus = (child?: string) => (isChildBound(child) ? '已绑定' : child || '未绑定')

  const getChildStatusType = (child?: string) => {
    if (isChildBound(child)) return 'success'
    return child === '待绑定' ? 'warning' : 'info'
  }
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
