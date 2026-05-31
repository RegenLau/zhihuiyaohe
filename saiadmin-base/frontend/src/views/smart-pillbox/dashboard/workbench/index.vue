<template>
  <div class="smart-page dashboard-workbench">
    <a-spin :loading="loading">
      <div class="dashboard-content">
        <div class="dashboard-top-grid">
          <div class="ma-content-block p-3">
            <a-card title="今日概览" :bordered="false">
              <a-grid :cols="{ xs: 1, sm: 2, xl: 4 }" :col-gap="16" :row-gap="16">
                <a-grid-item v-for="item in overviewCards" :key="item.label">
                  <div class="dashboard-stat-card">
                    <a-avatar :size="44" :style="statIconStyle(item)">
                      <sa-icon :icon="item.icon || 'ri:dashboard-line'" :size="20" />
                    </a-avatar>
                    <div class="dashboard-stat-body">
                      <span class="smart-muted">{{ item.label }}</span>
                      <strong>{{ item.value }}</strong>
                      <span class="smart-muted">{{ item.note }}</span>
                    </div>
                  </div>
                </a-grid-item>
              </a-grid>
            </a-card>
          </div>

          <div class="ma-content-block p-3">
            <a-card title="快捷入口" :bordered="false">
              <div class="quick-action-grid">
                <a-button
                  v-for="action in quickActions"
                  :key="action.label"
                  :type="action.tone === 'primary' ? 'primary' : 'outline'"
                  @click="router.push(action.route)"
                >
                  <template #icon><sa-icon :icon="action.icon" :size="16" /></template>
                  {{ action.label }}
                </a-button>
              </div>
            </a-card>
          </div>
        </div>

        <a-grid :cols="{ xs: 1, lg: 24 }" :col-gap="16" :row-gap="16">
          <a-grid-item :span="{ xs: 1, lg: 14 }">
            <div class="ma-content-block p-3">
              <a-card title="今日优先处理" :bordered="false">
                <template #extra>
                  <a-button type="text" @click="router.push('/doctor/tasks')">
                    <template #icon><sa-icon icon="ri:arrow-right-line" :size="16" /></template>
                    进入任务
                  </a-button>
                </template>
                <div class="priority-list">
                  <div v-for="item in priorityItems" :key="item.title" class="priority-item">
                    <a-tag :color="item.color">{{ item.level }}</a-tag>
                    <div class="priority-main">
                      <a-typography-text bold>{{ item.title }}</a-typography-text>
                      <span class="smart-muted">{{ item.desc }}</span>
                    </div>
                    <a-button size="mini" @click="router.push(item.route)">处理</a-button>
                  </div>
                </div>
              </a-card>
            </div>
          </a-grid-item>

          <a-grid-item :span="{ xs: 1, lg: 10 }">
            <div class="ma-content-block p-3">
              <a-card title="下一批提醒" :bordered="false">
                <template #extra>
                  <a-tag color="arcoblue">未来 2 小时</a-tag>
                </template>
                <div class="reminder-list">
                  <div v-for="item in reminderItems" :key="`${item.time}-${item.patient}`" class="reminder-item">
                    <div class="reminder-time">{{ item.time }}</div>
                    <div class="reminder-main">
                      <a-typography-text bold>{{ item.patient }}</a-typography-text>
                      <span class="smart-muted">{{ item.drug }} · {{ item.dose }}</span>
                    </div>
                    <a-tag :color="item.color">{{ item.status }}</a-tag>
                  </div>
                </div>
              </a-card>
            </div>
          </a-grid-item>
        </a-grid>

        <a-grid :cols="{ xs: 1, lg: 24 }" :col-gap="16" :row-gap="16">
          <a-grid-item :span="{ xs: 1, lg: 16 }">
            <div class="ma-content-block p-3">
              <a-card title="近 7 天服药趋势" :bordered="false">
                <template #extra>
                  <a-button @click="router.push('/doctor/tasks')">
                    <template #icon><sa-icon icon="ri:checkbox-circle-line" :size="16" /></template>
                    服药任务
                  </a-button>
                </template>
                <sa-chart height="260px" :options="trendChartOptions" />
              </a-card>
            </div>
          </a-grid-item>

          <a-grid-item :span="{ xs: 1, lg: 8 }">
            <div class="ma-content-block p-3">
              <a-card title="设备与服务状态" :bordered="false">
                <div class="device-summary">
                  <div v-for="item in deviceSummary" :key="item.label" class="device-summary-item">
                    <div>
                      <a-typography-text bold>{{ item.value }}</a-typography-text>
                      <div class="smart-muted">{{ item.label }}</div>
                    </div>
                    <a-progress :percent="item.percent" size="small" :show-text="false" />
                  </div>
                </div>
              </a-card>
            </div>
          </a-grid-item>
        </a-grid>

        <a-grid :cols="{ xs: 1, lg: 24 }" :col-gap="16" :row-gap="16">
          <a-grid-item :span="{ xs: 1, lg: 12 }">
            <div class="ma-content-block p-3">
              <a-card title="重点患者关注" :bordered="false">
                <a-table row-key="name" :data="focusPatients" :pagination="false" size="small" table-layout-fixed>
                  <template #columns>
                    <a-table-column title="患者" data-index="name" :width="120" />
                    <a-table-column title="关注点">
                      <template #cell="{ record }">
                        <span>{{ record.reason }}</span>
                      </template>
                    </a-table-column>
                    <a-table-column title="状态" :width="100">
                      <template #cell="{ record }">
                        <a-tag :color="record.color">{{ record.status }}</a-tag>
                      </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="88">
                      <template #cell="{ record }">
                        <a-button size="mini" type="primary" @click="router.push(record.route)">查看</a-button>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>
              </a-card>
            </div>
          </a-grid-item>

          <a-grid-item :span="{ xs: 1, lg: 12 }">
            <div class="ma-content-block p-3">
              <a-card title="今日运营节奏" :bordered="false">
                <div class="stage-list">
                  <div v-for="item in operationStages" :key="item.title" class="stage-item">
                    <a-avatar :size="32" :style="{ backgroundColor: item.color }">
                      <sa-icon :icon="item.icon" :size="16" />
                    </a-avatar>
                    <div class="stage-main">
                      <a-typography-text bold>{{ item.title }}</a-typography-text>
                      <span class="smart-muted">{{ item.desc }}</span>
                    </div>
                    <a-tag :color="item.tagColor">{{ item.state }}</a-tag>
                  </div>
                </div>
              </a-card>
            </div>
          </a-grid-item>
        </a-grid>
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

const overviewCards = computed(() => [
  ...dashboard.statCards,
  {
    label: '完成率',
    value: `${completionRate.value}%`,
    note: '今日任务闭环效率',
    icon: 'ri:line-chart-line'
  }
])

const completionRate = computed(() => {
  const taskCard = dashboard.statCards.find((item) => item.label === '今日任务')
  const total = Number(taskCard?.value || 0)
  const done = Number(String(taskCard?.note || '').match(/\d+/)?.[0] || 0)
  return total ? Math.round((done / total) * 100) : 0
})

const priorityItems = [
  {
    level: '高',
    title: '5 条未打卡需确认',
    desc: '优先核实患者是否实际服药，必要时补记或转为漏服。',
    color: 'red',
    route: '/doctor/tasks'
  },
  {
    level: '高',
    title: '3 台药盒存在缺药风险',
    desc: '检查剩余药量和补药时间，避免影响下一轮服药。',
    color: 'orange',
    route: '/doctor/health-data?tab=shortage'
  },
  {
    level: '中',
    title: '2 台设备离线超过 30 分钟',
    desc: '联系家属或患者确认电量、网络和设备摆放。',
    color: 'arcoblue',
    route: '/doctor/devices'
  },
  {
    level: '中',
    title: '1 份知情同意待确认',
    desc: '建档后补齐授权，保证后续提醒和问答服务可用。',
    color: 'green',
    route: '/doctor/settings'
  }
]

const reminderItems = [
  { time: '18:30', patient: '王秀兰', drug: '二甲双胍缓释片', dose: '1片/次', status: '待提醒', color: 'arcoblue' },
  { time: '19:00', patient: '李桂芳', drug: '阿卡波糖片', dose: '1片/次', status: '需观察', color: 'orange' },
  { time: '20:30', patient: '赵春梅', drug: '硝苯地平控释片', dose: '1片/次', status: '待提醒', color: 'arcoblue' }
]

const deviceSummary = [
  { label: '在线药盒', value: '38 台', percent: 0.86 },
  { label: '低电量设备', value: '4 台', percent: 0.12 },
  { label: '计划已同步', value: '92%', percent: 0.92 }
]

const focusPatients = [
  { name: '张建国', reason: '近 3 天晚间任务连续延迟', status: '待随访', color: 'orange', route: '/doctor/patients/2' },
  { name: '陈德明', reason: '未绑定设备且今日无服药记录', status: '需建档', color: 'red', route: '/doctor/patients/4' },
  { name: '王秀兰', reason: '今日药品 3 种，晚间仍有提醒', status: '跟进中', color: 'arcoblue', route: '/doctor/patients/1' }
]

const operationStages = [
  { title: '早间核查', desc: '确认离线设备、低电量和缺药预警。', state: '已完成', tagColor: 'green', icon: 'ri:sun-line', color: 'rgb(var(--green-6))' },
  { title: '午间复盘', desc: '处理漏服、异常问答和健康数据波动。', state: '进行中', tagColor: 'arcoblue', icon: 'ri:pulse-line', color: 'rgb(var(--primary-6))' },
  { title: '晚间提醒', desc: '重点关注晚餐后和睡前任务闭环。', state: '待开始', tagColor: 'gray', icon: 'ri:moon-line', color: 'rgb(var(--gray-6))' }
]

const statIconStyle = (item) => {
  const colorMap = {
    今日任务: 'rgb(var(--green-6))',
    未打卡: 'rgb(var(--red-6))',
    待处理: 'rgb(var(--orange-6))',
    完成率: 'rgb(var(--primary-6))'
  }

  return {
    color: '#fff',
    backgroundColor: colorMap[item.label] || 'rgb(var(--primary-6))'
  }
}

const trendChartOptions = computed(() => {
  const labels = dashboard.trendBars.map((item) => item.label)
  return {
    color: ['#165dff', '#f53f3f'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['完成任务', '漏服任务'], bottom: 0 },
    grid: { left: 36, right: 20, top: 24, bottom: 44 },
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

<style scoped>
.dashboard-workbench {
  min-height: 100%;
}

.dashboard-content {
  display: grid;
  gap: 16px;
}

.dashboard-top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: stretch;
}

.dashboard-workbench :deep(.arco-grid) {
  align-items: stretch;
}

.dashboard-workbench :deep(.arco-grid-item) {
  display: flex;
  min-width: 0;
}

.dashboard-top-grid > .ma-content-block,
.dashboard-workbench :deep(.arco-grid-item > .ma-content-block) {
  display: flex;
  width: 100%;
  min-width: 0;
}

.dashboard-top-grid > .ma-content-block > :deep(.arco-card),
.dashboard-workbench :deep(.arco-grid-item > .ma-content-block > .arco-card) {
  width: 100%;
  height: 100%;
}

.dashboard-stat-card,
.priority-item,
.reminder-item,
.stage-item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.dashboard-stat-card {
  padding: 4px 0;
}

.dashboard-stat-body,
.priority-main,
.reminder-main,
.stage-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.dashboard-stat-body strong {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.quick-action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.priority-list,
.reminder-list,
.device-summary,
.stage-list {
  display: grid;
  gap: 14px;
}

.priority-item,
.reminder-item,
.stage-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-2);
}

.priority-item:last-child,
.reminder-item:last-child,
.stage-item:last-child {
  border-bottom: 0;
}

.reminder-time {
  width: 56px;
  font-size: 16px;
  font-weight: 600;
}

.device-summary-item {
  display: grid;
  gap: 8px;
}

@media (max-width: 1200px) {
  .dashboard-top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .quick-action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
