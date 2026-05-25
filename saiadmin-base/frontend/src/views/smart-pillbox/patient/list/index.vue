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
          <ElButton type="primary" @click="createDialogVisible = true">
            <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
            新增患者建档
          </ElButton>
          <ElButton disabled>
            <template #icon><ArtSvgIcon icon="ri:cloud-line" /></template>
            HIS同步
          </ElButton>
          <ElButton disabled>
            <template #icon><ArtSvgIcon icon="ri:upload-cloud-2-line" /></template>
            批量导入
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :data="data"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        :pagination-options="{ align: 'right' }"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @sort-change="handleSortChange"
      >
        <template #name="{ row }">
          <b class="patient-name-cell">{{ row.name }}</b>
        </template>
        <template #basicInfo="{ row }">
          <span class="muted patient-basic-cell">{{ row.gender }} {{ row.age }} 岁</span>
        </template>
        <template #phone="{ row }">
          <span class="patient-phone-cell">{{ row.phone }}</span>
        </template>
        <template #deviceStatus="{ row }">
          <ElTag :type="row.deviceStatusType">{{ row.deviceStatus }}</ElTag>
        </template>
        <template #child="{ row }">
          <ElTag :type="getChildStatusType(row.child)" effect="plain">
            {{ getChildStatus(row.child) }}
          </ElTag>
        </template>
        <template #completionRate="{ row }">
          <div class="completion-rate-cell">
            <ElProgress
              :percentage="getCompletionRate(row.completionRate)"
              :stroke-width="8"
              :show-text="false"
              :color="getCompletionColor(row.completionRate)"
            />
            <span>{{ getCompletionRate(row.completionRate) }}%</span>
          </div>
        </template>
        <template #operation="{ row }">
          <ElSpace>
            <SaButton
              v-if="!isDeviceBound(row)"
              type="primary"
              icon="ri:link-m"
              tool-tip="绑定设备"
              @click="openBindDeviceDialog(row)"
            />
            <SaButton
              type="success"
              icon="ri:eye-line"
              tool-tip="详情"
              @click="router.push(`/doctor/patient-detail?id=${row.id}`)"
            />
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

    <CreateBasicDialog v-model="createDialogVisible" @success="handleCreateSuccess" />
    <BindDeviceDialog
      v-model="bindDeviceDialogVisible"
      :patient="bindDevicePatient"
      @success="handleBindDeviceSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import { useTable } from '@/hooks/core/useTable'
  import type { Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'
  import BindDeviceDialog from './modules/bind-device-dialog.vue'
  import CreateBasicDialog from './modules/create-basic-dialog.vue'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'SmartPillboxPatientList' })

  const router = useRouter()
  const showSearchBar = ref(true)
  const createDialogVisible = ref(false)
  const bindDeviceDialogVisible = ref(false)
  const bindDevicePatient = ref<Patient | null>(null)
  const createSearchForm = () => ({ keyword: '', deviceBindStatus: '', childBindStatus: '' })
  const searchForm = ref(createSearchForm())

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
    refreshData
  } = useTable({
    core: {
      apiFn: patientApi.list,
      columnsFactory: () => [
        { prop: 'name', label: '姓名', useSlot: true, minWidth: 96 },
        { prop: 'basicInfo', label: '基本信息', useSlot: true, minWidth: 102 },
        { prop: 'phone', label: '手机号', useSlot: true, minWidth: 128 },
        { prop: 'deviceStatus', label: '设备状态', useSlot: true, minWidth: 108 },
        { prop: 'child', label: '子女绑定状态', useSlot: true, minWidth: 126 },
        { prop: 'completionRate', label: '完成率', useSlot: true, minWidth: 140 },
        { prop: 'operation', label: '操作', useSlot: true, width: 170, fixed: 'right' }
      ]
    }
  })

  const handleSearch = () => {
    delete searchParams.status
    delete searchParams.disease
    delete searchParams.hasAllergy
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = createSearchForm()
    await resetSearchParams()
    getData()
  }

  const isChildBound = (child?: string) => Boolean(child && !['待绑定', '未绑定'].includes(child))

  const getChildStatus = (child?: string) => (isChildBound(child) ? '已绑定' : child || '未绑定')

  const getChildStatusType = (child?: string) => {
    if (isChildBound(child)) return 'success'
    return child === '待绑定' ? 'warning' : 'info'
  }

  const isDeviceBound = (row: Record<string, any>) =>
    Boolean(row.deviceNo && row.deviceNo !== '未绑定' && row.deviceStatus !== '未绑定')

  const openBindDeviceDialog = (row: Patient) => {
    bindDevicePatient.value = row
    bindDeviceDialogVisible.value = true
  }

  const getCompletionRate = (rate?: number) => Math.min(100, Math.max(0, Number(rate) || 0))

  const getCompletionColor = (rate?: number) => {
    const percentage = getCompletionRate(rate)
    if (percentage < 60) return '#f56c6c'
    if (percentage < 85) return '#e6a23c'
    return '#13c2c2'
  }

  const handleCreateSuccess = () => {
    refreshData()
  }

  const handleBindDeviceSuccess = () => {
    bindDevicePatient.value = null
    refreshData()
  }
</script>

<style lang="scss" scoped>
  @use '../../style';

  .completion-rate-cell {
    display: grid;
    grid-template-columns: minmax(72px, 1fr) 44px;
    gap: 10px;
    align-items: center;
    max-width: 140px;

    span {
      font-size: 13px;
      line-height: 1;
      color: var(--art-text-gray-700);
      text-align: right;
    }
  }

  .patient-name-cell {
    font-weight: 600;
    color: var(--art-text-gray-800);
  }

  .patient-basic-cell {
    font-size: 13px;
    white-space: nowrap;
  }

  .patient-phone-cell {
    font-size: 13px;
    color: var(--art-text-gray-700);
    white-space: nowrap;
  }
</style>
