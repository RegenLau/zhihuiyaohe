<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>健康数据</h2>
        <p>查看患者血压、血糖上报、响应情况和异常风险</p>
      </div>
      <ElButton @click="router.push('/doctor/patients')">
        <template #icon><ArtSvgIcon icon="ri:user-heart-line" /></template>
        返回患者管理
      </ElButton>
    </div>

    <div class="summary-grid mb-4">
      <div v-for="item in healthOverview" :key="item.label" class="summary-item">
        <span class="summary-number" :class="item.className">{{ item.value }}</span>
        <span class="muted">{{ item.label }}</span>
      </div>
    </div>

    <SaSearchBar
      v-if="showSearchBar"
      ref="searchBarRef"
      v-model="searchForm"
      label-width="90px"
      :showExpand="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <ElCol :xs="24" :sm="12" :md="8" :lg="6">
        <ElFormItem label="关键词" prop="keyword">
          <ElInput v-model="searchForm.keyword" placeholder="患者姓名或备注" clearable />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="8" :lg="6">
        <ElFormItem label="风险级别" prop="riskLevel">
          <ElSelect v-model="searchForm.riskLevel" clearable placeholder="全部">
            <ElOption label="正常" value="正常" />
            <ElOption label="关注" value="关注" />
            <ElOption label="高风险" value="高风险" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </SaSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      />

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
          <ElButton link type="primary" @click="router.push(`/doctor/patient-detail?id=${row.patientId}`)">
            {{ row.patient }}
          </ElButton>
        </template>
        <template #bloodPressure="{ row }">
          <div>
            <b>晨 {{ row.morningBP || '未上报' }}</b>
            <div class="muted text-xs">晚 {{ row.eveningBP || '未上报' }}</div>
          </div>
        </template>
        <template #fastingGlucose="{ row }">
          <span>{{ row.fastingGlucose == null ? '未上报' : `${row.fastingGlucose} mmol/L` }}</span>
        </template>
        <template #responded="{ row }">
          <ElTag :type="row.responded ? 'success' : 'danger'">
            {{ row.responded ? '已响应' : '未响应' }}
          </ElTag>
        </template>
        <template #riskLevel="{ row }">
          <ElTag :type="getRiskType(row.riskLevel)">{{ row.riskLevel }}</ElTag>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import healthApi from '@/views/plugin/smart-pillbox/api/doctor/health'
  import { useTable } from '@/hooks/core/useTable'
  import type { HealthRecord } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxHealthData' })

  const router = useRouter()
  const route = useRoute()
  const showSearchBar = ref(true)
  const searchBarRef = ref()
  const initialPatientId = String(route.query.patientId || '')
  const searchForm = ref({ keyword: '', riskLevel: '', patientId: initialPatientId })

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
      apiFn: healthApi.list,
      apiParams: {
        patientId: initialPatientId
      },
      columnsFactory: () => [
        { prop: 'patient', label: '患者', useSlot: true, minWidth: 120 },
        { prop: 'date', label: '上报日期', width: 130 },
        { prop: 'bloodPressure', label: '血压', useSlot: true, minWidth: 150 },
        { prop: 'fastingGlucose', label: '空腹血糖', useSlot: true, width: 130 },
        { prop: 'responded', label: '响应状态', useSlot: true, width: 110 },
        { prop: 'riskLevel', label: '风险级别', useSlot: true, width: 110 },
        { prop: 'note', label: '备注', minWidth: 220 }
      ]
    }
  })

  const healthOverview = computed(() => {
    const records = (data.value || []) as HealthRecord[]
    const responded = records.filter((item) => item.responded).length
    const risk = records.filter((item) => item.riskLevel !== '正常').length
    const glucoseValues = records
      .map((item) => item.fastingGlucose)
      .filter((value): value is number => typeof value === 'number')
    const avgGlucose = glucoseValues.length
      ? (glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length).toFixed(1)
      : '-'

    return [
      { label: '当前记录', value: records.length, className: '' },
      { label: '已响应', value: responded, className: 'is-success' },
      { label: '异常或关注', value: risk, className: risk ? 'is-warning' : 'is-success' },
      { label: '平均空腹血糖', value: avgGlucose, className: '' }
    ]
  })

  const getRiskType = (riskLevel: string) => {
    if (riskLevel === '高风险') return 'danger'
    if (riskLevel === '关注') return 'warning'
    return 'success'
  }

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { keyword: '', riskLevel: '', patientId: '' }
    searchBarRef.value?.ref?.resetFields()
    await resetSearchParams()
    getData()
  }
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
