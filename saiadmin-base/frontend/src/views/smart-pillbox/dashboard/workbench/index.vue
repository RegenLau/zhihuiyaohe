<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>工作台</h2>
        <p>查看患者服药风险、药盒状态和待处理提醒</p>
      </div>
      <ElSpace wrap>
        <ElButton @click="router.push('/doctor/tasks')">
          <template #icon><ArtSvgIcon icon="ri:checkbox-circle-line" /></template>
          查看任务
        </ElButton>
        <ElButton type="primary" @click="router.push('/doctor/patient-create')">
          <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
          新增患者建档
        </ElButton>
      </ElSpace>
    </div>

    <ElRow :gutter="16">
      <ElCol v-for="item in statCards" :key="item.label" :xs="24" :sm="12" :lg="8" :xl="4">
        <ElCard class="stat-card" shadow="never">
          <div class="flex justify-between items-center muted">
            <span>{{ item.label }}</span>
            <ArtSvgIcon :icon="item.icon" />
          </div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="muted">{{ item.note }}</div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16" class="mt-4">
      <ElCol :xs="24" :lg="15">
        <ElCard shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <b>近 7 天服药完成趋势</b>
                <div class="muted text-sm mt-1">蓝色为完成任务，红色为漏服任务</div>
              </div>
              <ElButton @click="router.push('/doctor/tasks')">查看任务</ElButton>
            </div>
          </template>
          <div class="flex items-end gap-3 h-56">
            <div v-for="bar in trendBars" :key="bar.label" class="flex-1 text-center">
              <div class="flex items-end justify-center gap-1 h-42">
                <div class="w-5 rounded-t" :style="{ height: bar.done + '%', background: 'var(--el-color-primary)' }"></div>
                <div class="w-5 rounded-t" :style="{ height: bar.miss + '%', background: 'var(--el-color-danger)' }"></div>
              </div>
              <div class="text-xs muted mt-2">{{ bar.label }}</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :lg="9">
        <ElCard shadow="never">
          <template #header>
            <div>
              <b>待处理风险</b>
              <div class="muted text-sm mt-1">按处理优先级排序</div>
            </div>
          </template>
          <ElTimeline v-loading="dashboardLoading">
            <ElTimelineItem v-for="risk in risks" :key="risk.title" :type="risk.type" :timestamp="risk.timestamp">
              <b>{{ risk.title }}</b>
              <div class="muted mt-1">{{ risk.note }}</div>
            </ElTimelineItem>
          </ElTimeline>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16" class="mt-4">
      <ElCol :xs="24" :lg="16">
        <ElCard class="art-table-card" shadow="never">
          <template #header>
            <div>
              <b>今日重点患者</b>
              <div class="muted text-sm mt-1">根据漏服、离线和复诊规则聚合</div>
            </div>
          </template>
          <ArtTable
            :data="data"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
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
            <template #completionRate="{ row }">
              <ElProgress :percentage="row.completionRate" :status="row.completionRate < 70 ? 'exception' : undefined" />
            </template>
            <template #deviceStatus="{ row }">
              <ElTag :type="row.deviceStatusType">{{ row.deviceStatus }}</ElTag>
            </template>
            <template #operation="{ row }">
              <SaButton
                type="success"
                icon="ri:eye-line"
                tool-tip="查看任务"
                @click="router.push('/doctor/tasks')"
              />
            </template>
          </ArtTable>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :lg="8">
        <ElCard shadow="never">
          <template #header><b>快速操作</b></template>
          <ElRow :gutter="10">
            <ElCol :span="12">
              <ElButton class="w-full" type="primary" @click="router.push('/doctor/patient-create')">
                新增患者建档
              </ElButton>
            </ElCol>
            <ElCol :span="12">
              <ElButton class="w-full" @click="router.push('/doctor/plans')">创建用药计划</ElButton>
            </ElCol>
            <ElCol :span="12" class="mt-3">
              <ElButton class="w-full" @click="router.push('/doctor/devices')">绑定药盒</ElButton>
            </ElCol>
            <ElCol :span="12" class="mt-3">
              <ElButton class="w-full" @click="router.push('/doctor/messages')">创建提醒</ElButton>
            </ElCol>
          </ElRow>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import dashboardApi from '@/views/plugin/smart-pillbox/api/doctor/dashboard'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import { useTable } from '@/hooks/core/useTable'
  import type {
    DashboardStatCard,
    RiskItem,
    TrendBar
  } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxWorkbench' })

  const router = useRouter()
  const dashboardLoading = ref(false)
  const statCards = ref<DashboardStatCard[]>([])
  const trendBars = ref<TrendBar[]>([])
  const risks = ref<RiskItem[]>([])

  const { columns, data, loading, pagination, handleSizeChange, handleCurrentChange } = useTable({
    core: {
      apiFn: patientApi.list,
      apiParams: {
        limit: 3
      },
      columnsFactory: () => [
        { prop: 'patient', label: '患者', useSlot: true, minWidth: 160 },
        { prop: 'diseases', label: '疾病', useSlot: true, minWidth: 160 },
        { prop: 'completionRate', label: '完成率', useSlot: true, minWidth: 160 },
        { prop: 'deviceStatus', label: '药盒', useSlot: true, width: 100 },
        { prop: 'operation', label: '操作', useSlot: true, width: 80, fixed: 'right' }
      ]
    }
  })

  const loadDashboard = async () => {
    dashboardLoading.value = true
    try {
      const dashboardData = await dashboardApi.read()
      statCards.value = dashboardData.statCards
      trendBars.value = dashboardData.trendBars
      risks.value = dashboardData.risks
    } finally {
      dashboardLoading.value = false
    }
  }

  onMounted(() => {
    loadDashboard()
  })
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
