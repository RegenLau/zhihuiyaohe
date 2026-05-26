<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <div class="dashboard-content">
        <div class="smart-stat-grid">
        <a-card v-for="item in dashboard.statCards" :key="item.label" class="smart-stat-card" :bordered="false">
          <div class="smart-row" style="justify-content: space-between">
            <span class="smart-muted">{{ item.label }}</span>
            <sa-icon :icon="item.icon || 'ri:dashboard-line'" :size="18" />
          </div>
          <div class="smart-stat-value">{{ item.value }}</div>
          <div class="smart-muted">{{ item.note }}</div>
        </a-card>
        </div>

        <div class="dashboard-layout">
        <div class="dashboard-main">
          <a-card class="smart-panel" :bordered="false">
            <div class="smart-card-heading">
              <div>
                <strong>近 7 天服药完成趋势</strong>
                <div class="smart-section-note">蓝色为完成任务，红色为漏服任务</div>
              </div>
              <a-button @click="router.push('/doctor/tasks')">
                <template #icon><sa-icon icon="ri:checkbox-circle-line" :size="16" /></template>
                查看任务
              </a-button>
            </div>
            <div class="chart-bars">
              <div v-for="bar in dashboard.trendBars" :key="bar.label" class="chart-bar-item">
                <div
                  class="chart-bar-stack"
                  :style="{ '--done-height': `${bar.done}%`, '--miss-height': `${bar.miss}%` }"
                >
                  <div class="chart-bar is-done"></div>
                  <div class="chart-bar is-miss"></div>
                </div>
                <div class="smart-muted" style="margin-top: 8px">{{ bar.label }}</div>
              </div>
            </div>
          </a-card>

          <a-card class="smart-panel" :bordered="false">
            <div class="smart-card-heading">
              <div>
                <strong>待处理风险</strong>
                <div class="smart-section-note">按漏服、离线和复诊规则聚合</div>
              </div>
              <a-button @click="router.push('/doctor/messages')">
                <template #icon><sa-icon icon="ri:notification-3-line" :size="16" /></template>
                查看提醒
              </a-button>
            </div>
            <div class="risk-board">
              <div
                v-for="risk in dashboard.risks"
                :key="risk.title"
                class="risk-board-item"
                :class="`is-${risk.type || 'primary'}`"
              >
                <span class="risk-board-icon" :class="`is-${risk.type || 'primary'}`">
                  <sa-icon :icon="risk.icon || 'ri:alarm-warning-line'" :size="20" />
                </span>
                <span class="risk-board-content">
                  <span class="risk-board-title">
                    <strong>{{ risk.title }}</strong>
                    <a-tag :color="statusColor(risk.type)">{{ risk.level || '待处理' }}</a-tag>
                  </span>
                  <span class="risk-board-note">{{ risk.note }}</span>
                  <span class="risk-board-meta">
                    <span v-if="risk.patient" class="risk-meta-chip">
                      <sa-icon icon="ri:user-heart-line" :size="13" />
                      {{ risk.patient }}
                    </span>
                    <span v-if="risk.source" class="risk-meta-chip">
                      <sa-icon icon="ri:flag-line" :size="13" />
                      {{ risk.source }}
                    </span>
                    <span class="risk-meta-chip">
                      <sa-icon icon="ri:time-line" :size="13" />
                      {{ risk.timestamp }}
                    </span>
                  </span>
                </span>
                <a-button :status="buttonStatus(risk.type)" @click="openRisk(risk)">
                  {{ risk.action || '处理' }}
                </a-button>
              </div>
            </div>
          </a-card>
        </div>

        <aside class="dashboard-side">
          <a-card class="smart-panel" :bordered="false">
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
              <div class="progress-metric-stack">
                <button
                  v-for="metric in dashboard.sidePanel.metrics"
                  :key="metric.label"
                  type="button"
                  class="progress-metric"
                  @click="router.push(metric.route)"
                >
                  <div class="progress-metric-top">
                    <span>{{ metric.label }}</span>
                    <strong>{{ metric.value }}</strong>
                  </div>
                  <a-progress :percent="metric.percent / 100" :show-text="false" size="small" />
                  <div class="smart-muted">{{ metric.note }}</div>
                </button>
              </div>

              <div class="side-action-grid">
                <button
                  v-for="action in dashboard.sidePanel.actions"
                  :key="action.label"
                  type="button"
                  :class="['side-action', `is-${action.tone || 'info'}`]"
                  @click="router.push(action.route)"
                >
                  <sa-icon :icon="action.icon" :size="18" />
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </div>
          </a-card>

          <a-card class="smart-panel" :bordered="false">
            <template #title>
              <div class="side-card-header">
                <strong>本周服药达标</strong>
                <a-tag color="green">7天</a-tag>
              </div>
            </template>
            <div class="weekly-list">
              <div
                v-for="bar in dashboard.sidePanel.weeklyBars"
                :key="bar.label"
                class="weekly-list-row"
                :class="{ 'is-active': bar.active }"
              >
                <span class="weekly-list-day">{{ bar.label }}</span>
                <div class="weekly-list-track">
                  <span class="weekly-list-bar" :style="{ width: `${bar.value}%` }"></span>
                </div>
                <strong>{{ bar.value }}%</strong>
                <span class="smart-muted">{{ bar.count }}</span>
              </div>
              <div class="weekly-list-summary">
                <strong>{{ dashboard.sidePanel.weeklySummary.value }}</strong>
                <span>{{ dashboard.sidePanel.weeklySummary.note }}</span>
              </div>
            </div>
          </a-card>
        </aside>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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
