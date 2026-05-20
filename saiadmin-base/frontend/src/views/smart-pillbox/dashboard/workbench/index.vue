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
      <ElCol v-for="item in statCards" :key="item.label" :xs="24" :sm="12" :lg="6" :xl="6">
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

    <div class="dashboard-layout mt-4">
      <div class="dashboard-main">
        <div class="dashboard-insight-grid">
          <ElCard shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <b>近 7 天服药完成趋势</b>
                  <div class="muted text-sm mt-1">蓝色为完成任务，红色为漏服任务</div>
                </div>
                <ElButton @click="router.push('/doctor/tasks')">
                  <template #icon><ArtSvgIcon icon="ri:checkbox-circle-line" /></template>
                  查看任务
                </ElButton>
              </div>
            </template>
            <div class="chart-bars">
              <div v-for="bar in trendBars" :key="bar.label" class="chart-bar-item">
                <div
                  class="chart-bar-stack"
                  :style="{ '--done-height': `${bar.done}%`, '--miss-height': `${bar.miss}%` }"
                >
                  <div class="chart-bar is-done"></div>
                  <div class="chart-bar is-miss"></div>
                </div>
                <div class="text-xs muted mt-2">{{ bar.label }}</div>
              </div>
            </div>
          </ElCard>
        </div>

        <ElCard class="risk-board-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <div>
                <b>待处理风险</b>
                <div class="muted text-sm mt-1">按漏服、离线和复诊规则聚合</div>
              </div>
              <ElButton @click="router.push('/doctor/messages')">
                <template #icon><ArtSvgIcon icon="ri:notification-3-line" /></template>
                查看提醒
              </ElButton>
            </div>
          </template>
          <div v-loading="dashboardLoading" class="risk-board">
            <div
              v-for="risk in risks"
              :key="risk.title"
              class="risk-board-item"
              :class="`is-${risk.type}`"
            >
              <span class="risk-board-icon">
                <ArtSvgIcon :icon="risk.icon || 'ri:alarm-warning-line'" />
              </span>
              <span class="risk-board-content">
                <span class="risk-board-title">
                  <b>{{ risk.title }}</b>
                  <ElTag :type="risk.type" effect="light">{{ risk.level || '待处理' }}</ElTag>
                </span>
                <span class="risk-board-note">{{ risk.note }}</span>
                <span class="risk-board-meta">
                  <span v-if="risk.patient">
                    <ArtSvgIcon icon="ri:user-heart-line" />
                    {{ risk.patient }}
                  </span>
                  <span v-if="risk.source">
                    <ArtSvgIcon icon="ri:flag-line" />
                    {{ risk.source }}
                  </span>
                  <span>
                    <ArtSvgIcon icon="ri:time-line" />
                    {{ risk.timestamp }}
                  </span>
                </span>
              </span>
              <ElButton
                :type="risk.type"
                plain
                @click="router.push(risk.route || '/doctor/messages')"
              >
                {{ risk.action || '处理' }}
              </ElButton>
            </div>
          </div>
        </ElCard>
      </div>

      <aside class="dashboard-side">
        <ElCard class="side-card" shadow="never">
          <template #header>
            <div class="side-card-header">
              <b>今日管理成效</b>
              <ElButton link type="primary" @click="router.push('/doctor/tasks')">
                更多数据
                <ArtSvgIcon icon="ri:arrow-right-s-line" />
              </ElButton>
            </div>
          </template>
          <div v-loading="dashboardLoading" class="side-card-body">
            <div class="progress-metric-stack">
              <button
                v-for="metric in sidePanel.metrics"
                :key="metric.label"
                type="button"
                class="progress-metric"
                @click="router.push(metric.route)"
              >
                <div class="progress-metric-top">
                  <span>{{ metric.label }}</span>
                  <b>{{ metric.value }}</b>
                </div>
                <ElProgress :percentage="metric.percent" :show-text="false" :stroke-width="8" />
                <div class="muted text-xs">{{ metric.note }}</div>
              </button>
            </div>

            <div class="side-action-grid">
              <button
                v-for="action in sidePanel.actions"
                :key="action.label"
                type="button"
                :class="['side-action', `is-${action.tone}`]"
                @click="router.push(action.route)"
              >
                <ArtSvgIcon :icon="action.icon" />
                <span>{{ action.label }}</span>
              </button>
            </div>
          </div>
        </ElCard>

        <ElCard class="side-card weekly-card" shadow="never">
          <template #header>
            <div class="side-card-header">
              <b>本周服药达标</b>
              <ElButton class="period-chip" size="small">
                7天
                <ArtSvgIcon icon="ri:arrow-down-s-line" />
              </ElButton>
            </div>
          </template>
          <div v-loading="dashboardLoading" class="weekly-chart">
            <div class="weekly-scale">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div class="weekly-bars">
              <div
                v-for="bar in sidePanel.weeklyBars"
                :key="bar.label"
                class="weekly-bar-item"
                :class="{ 'is-active': bar.active }"
              >
                <div class="weekly-bar-track">
                  <div class="weekly-bar" :style="{ '--bar-value': `${bar.value}%` }"></div>
                </div>
                <div class="weekly-label">{{ bar.label }}</div>
                <div class="weekly-count">{{ bar.count }}</div>
              </div>
            </div>
            <div class="weekly-summary">
              <b>{{ sidePanel.weeklySummary.value }}</b>
              <span>{{ sidePanel.weeklySummary.note }}</span>
            </div>
          </div>
        </ElCard>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
  import dashboardApi from '@/views/plugin/smart-pillbox/api/doctor/dashboard'
  import type {
    DashboardStatCard,
    DashboardSidePanel,
    RiskItem,
    TrendBar
  } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxWorkbench' })

  const router = useRouter()
  const dashboardLoading = ref(false)
  const statCards = ref<DashboardStatCard[]>([])
  const trendBars = ref<TrendBar[]>([])
  const risks = ref<RiskItem[]>([])
  const sidePanel = ref<DashboardSidePanel>({
    metrics: [],
    actions: [],
    weeklyBars: [],
    weeklySummary: {
      value: '',
      note: ''
    }
  })

  const loadDashboard = async () => {
    dashboardLoading.value = true
    try {
      const dashboardData = await dashboardApi.read()
      statCards.value = dashboardData.statCards
      trendBars.value = dashboardData.trendBars
      risks.value = dashboardData.risks
      sidePanel.value = dashboardData.sidePanel
    } finally {
      dashboardLoading.value = false
    }
  }

  onMounted(() => {
    loadDashboard()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
