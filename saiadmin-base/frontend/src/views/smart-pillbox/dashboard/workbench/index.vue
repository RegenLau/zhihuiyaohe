<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <div class="dashboard-content">
        <div class="ma-content-block p-4">
          <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16">
            <a-grid-item v-for="item in dashboard.statCards" :key="item.label" :span="8">
              <a-space>
                <a-avatar :size="48" style="color: #fff; background-color: rgb(var(--primary-6))">
                  <sa-icon :icon="item.icon || 'ri:dashboard-line'" :size="22" />
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

        <div class="ma-content-block p-3">
          <a-card title="快捷入口" :bordered="false">
            <a-space wrap>
              <a-button
                v-for="action in quickActions"
                :key="action.label"
                :type="action.tone === 'primary' ? 'primary' : 'outline'"
                @click="router.push(action.route)"
              >
                <template #icon><sa-icon :icon="action.icon" :size="16" /></template>
                {{ action.label }}
              </a-button>
            </a-space>
          </a-card>
        </div>

        <div class="ma-content-block p-3">
          <a-card title="近 7 天服药趋势" :bordered="false">
            <template #extra>
              <a-button @click="router.push('/doctor/tasks')">
                <template #icon><sa-icon icon="ri:checkbox-circle-line" :size="16" /></template>
                服药任务
              </a-button>
            </template>
            <sa-chart height="220px" :options="trendChartOptions" />
          </a-card>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '@/views/plugin/smart-pillbox/api/doctor'

const router = useRouter()
const loading = ref(false)
const dashboard = reactive({
  statCards: [],
  trendBars: [],
  sidePanel: {
    actions: []
  }
})

const quickActions = computed(() => dashboard.sidePanel?.actions || [])

const trendChartOptions = computed(() => {
  const labels = dashboard.trendBars.map((item) => item.label)
  return {
    color: ['#165dff', '#f53f3f'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['完成任务', '漏服任务'], bottom: 0 },
    grid: { left: 32, right: 20, top: 20, bottom: 44 },
    xAxis: { type: 'category', data: labels },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '完成任务',
        type: 'bar',
        data: dashboard.trendBars.map((item) => item.done),
        barMaxWidth: 18
      },
      {
        name: '漏服任务',
        type: 'bar',
        data: dashboard.trendBars.map((item) => item.miss),
        barMaxWidth: 18
      }
    ]
  }
})

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
