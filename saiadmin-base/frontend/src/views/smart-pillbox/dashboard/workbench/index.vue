<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>医药师工作台</h2>
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
          <ElTimeline>
            <ElTimelineItem type="danger" timestamp="今日 14:18">
              <b>王秀兰连续 2 次漏服降压药</b>
              <div class="muted mt-1">建议通知子女，并在下次复诊核对用药依从性</div>
            </ElTimelineItem>
            <ElTimelineItem type="warning" timestamp="今日 09:01">
              <b>张建国药盒离线 6 小时</b>
              <div class="muted mt-1">最近一次上报：今日 08:14</div>
            </ElTimelineItem>
            <ElTimelineItem type="primary" timestamp="今日 10:42">
              <b>李桂芳 5 天后预计用完阿托伐他汀</b>
              <div class="muted mt-1">可创建复诊提醒并下发至药盒</div>
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
          <ArtTable :data="focusPatients" :columns="columns">
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
  import { patients } from '../../data'

  defineOptions({ name: 'SmartPillboxWorkbench' })

  const router = useRouter()
  const focusPatients = patients.slice(0, 3)

  const statCards = [
    { label: '管理患者', value: '24', note: '本周新增 3 人', icon: 'ri:user-heart-line' },
    { label: '绑定药盒', value: '18', note: '在线 15 台，离线 3 台', icon: 'ri:medicine-bottle-line' },
    { label: '今日任务', value: '86', note: '已完成 71 次', icon: 'ri:checkbox-circle-line' },
    { label: '今日漏服', value: '8', note: '连续漏服 2 人', icon: 'ri:alarm-warning-line' },
    { label: '待复诊', value: '5', note: '7 天内到期', icon: 'ri:calendar-check-line' }
  ]

  const trendBars = [
    { label: '周四', done: 72, miss: 16 },
    { label: '周五', done: 80, miss: 10 },
    { label: '周六', done: 68, miss: 20 },
    { label: '周日', done: 76, miss: 14 },
    { label: '周一', done: 82, miss: 11 },
    { label: '周二', done: 78, miss: 12 },
    { label: '今日', done: 86, miss: 16 }
  ]

  const columns = [
    { prop: 'patient', label: '患者', useSlot: true, minWidth: 160 },
    { prop: 'diseases', label: '疾病', useSlot: true, minWidth: 160 },
    { prop: 'completionRate', label: '完成率', useSlot: true, minWidth: 160 },
    { prop: 'deviceStatus', label: '药盒', useSlot: true, width: 100 },
    { prop: 'operation', label: '操作', useSlot: true, width: 80, fixed: 'right' }
  ]
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
