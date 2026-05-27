<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <div class="dashboard-content">
        <div class="ma-content-block p-4">
          <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16">
            <a-grid-item v-for="item in dashboard.statCards" :key="item.label" :span="6">
              <a-space>
                <a-avatar :size="54" style="color: #fff; background-color: rgb(var(--primary-6))">
                  <sa-icon :icon="item.icon || 'ri:dashboard-line'" :size="24" />
                </a-avatar>
                <a-space direction="vertical" :size="2">
                  <a-typography-text type="secondary">{{ item.label }}</a-typography-text>
                  <a-typography-title :heading="5" style="margin: 0">{{ item.value }}</a-typography-title>
                  <div class="smart-muted">{{ item.note }}</div>
                </a-space>
              </a-space>
            </a-grid-item>
          </a-grid>
        </div>

        <div class="dashboard-layout">
        <div class="dashboard-main">
          <div class="ma-content-block p-3">
          <a-card title="近 7 天服药完成趋势" :bordered="false">
            <template #extra>
              <a-button @click="router.push('/doctor/tasks')">
                <template #icon><sa-icon icon="ri:checkbox-circle-line" :size="16" /></template>
                查看任务
              </a-button>
            </template>
            <sa-chart height="300px" :options="trendChartOptions" />
          </a-card>
          </div>

          <div class="ma-content-block p-3">
          <a-card title="待处理风险" :bordered="false">
            <template #extra>
              <a-button @click="router.push('/doctor/messages')">
                <template #icon><sa-icon icon="ri:notification-3-line" :size="16" /></template>
                查看提醒
              </a-button>
            </template>
            <a-table row-key="title" :data="dashboard.risks" :pagination="false" :scroll="{ x: 760 }">
              <template #columns>
                <a-table-column title="风险事项" data-index="title">
                  <template #cell="{ record }">
                    <a-space direction="vertical" :size="4" fill>
                      <a-space wrap>
                        <span>{{ record.title }}</span>
                        <a-tag :color="statusColor(record.type)">{{ record.level || '待处理' }}</a-tag>
                      </a-space>
                      <span class="smart-muted">{{ record.note }}</span>
                    </a-space>
                  </template>
                </a-table-column>
                <a-table-column title="患者" data-index="patient" :width="160" />
                <a-table-column title="来源" data-index="source" :width="140" />
                <a-table-column title="时间" data-index="timestamp" :width="140" />
                <a-table-column title="操作" :width="120">
                  <template #cell="{ record }">
                    <a-button size="mini" :status="buttonStatus(record.type)" @click="openRisk(record)">
                      {{ record.action || '处理' }}
                    </a-button>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
          </div>
        </div>

        <aside class="dashboard-side">
          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <template #title>
              <div class="side-card-header">
                <strong>今日管理成效</strong>
                <a-link @click="router.push('/doctor/tasks')">
                  更多数据
                  <sa-icon icon="ri:arrow-right-s-line" :size="16" />
                </a-link>
              </div>
            </template>
            <div class="side-card-body">
              <a-space direction="vertical" fill>
                <a-button
                  v-for="metric in dashboard.sidePanel.metrics"
                  :key="metric.label"
                  long
                  @click="router.push(metric.route)"
                >
                  {{ metric.label }} {{ metric.value }}
                </a-button>
              </a-space>

              <a-space wrap style="margin-top: 16px">
                <a-button
                  v-for="action in dashboard.sidePanel.actions"
                  :key="action.label"
                  :type="action.tone === 'primary' ? 'primary' : 'outline'"
                  @click="router.push(action.route)"
                >
                  <template #icon><sa-icon :icon="action.icon" :size="16" /></template>
                  {{ action.label }}
                </a-button>
              </a-space>
            </div>
          </a-card>
          </div>

          <div class="ma-content-block p-3">
          <a-card title="本周服药达标" :bordered="false">
            <template #title>
              <div class="side-card-header">
                <strong>本周服药达标</strong>
                <a-tag color="green">7天</a-tag>
              </div>
            </template>
            <a-table row-key="label" :data="dashboard.sidePanel.weeklyBars" :pagination="false" size="small">
              <template #columns>
                <a-table-column title="日期" data-index="label" :width="70" />
                <a-table-column title="达标率">
                  <template #cell="{ record }">
                    <a-progress :percent="record.value / 100" size="small" />
                  </template>
                </a-table-column>
                <a-table-column title="次数" data-index="count" :width="70" />
              </template>
            </a-table>
            <a-alert style="margin-top: 12px" type="success">
              {{ dashboard.sidePanel.weeklySummary.value }}，{{ dashboard.sidePanel.weeklySummary.note }}
            </a-alert>
          </a-card>
          </div>
        </aside>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { statusColor as mapStatusColor } from '@/views/smart-pillbox/utils'

const router = useRouter()
const loading = ref(false)
const dashboard = reactive({
  statCards: [],
  trendBars: [],
  risks: [],
  sidePanel: {
    metrics: [],
    actions: [],
    weeklyBars: [],
    weeklySummary: { value: '', note: '' }
  }
})

const statusColor = (type) => mapStatusColor(type, 'arcoblue')

const buttonStatus = (type) => {
  if (type === 'danger') return 'danger'
  if (type === 'warning') return 'warning'
  return undefined
}

const trendChartOptions = computed(() => {
  const labels = dashboard.trendBars.map((item) => item.label)
  return {
    color: ['#165dff', '#f53f3f'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['完成任务', '漏服任务'], bottom: 0 },
    grid: { left: 32, right: 20, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '完成任务',
        type: 'bar',
        data: dashboard.trendBars.map((item) => item.done),
        barMaxWidth: 22
      },
      {
        name: '漏服任务',
        type: 'bar',
        data: dashboard.trendBars.map((item) => item.miss),
        barMaxWidth: 22
      }
    ]
  }
})

const openRisk = (risk) => {
  if (risk.query) {
    router.push({ path: risk.route || '/doctor/messages', query: risk.query })
    return
  }
  router.push(risk.route || '/doctor/messages')
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.read()
    Object.assign(dashboard, response.data || {})
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>
