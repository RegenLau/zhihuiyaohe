<template>
  <div class="smart-page">
    <div class="official-two-column">
      <div class="ma-content-block p-3">
      <a-card title="选择患者" :bordered="false">
        <a-input-search v-model="keyword" placeholder="搜索姓名、处方编号、设备号" allow-clear />
        <a-table row-key="id" :data="patientOptions" :pagination="false" size="small" style="margin-top: 12px">
          <template #columns>
            <a-table-column title="患者" data-index="name">
              <template #cell="{ record }">
                <a-space direction="vertical" :size="2" fill>
                  <a-space wrap>
                    <a-link @click="selectedPatientId = record.id">{{ record.name }}</a-link>
                    <a-tag :color="statusColor(record.deviceStatus)">{{ record.deviceStatus }}</a-tag>
                  </a-space>
                  <span class="smart-muted">今日药品 {{ record.todayDrugs }} 种</span>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
      </div>

      <div class="detail-stack">
        <div class="ma-content-block p-3">
        <a-card :loading="taskLoading" :bordered="false">
          <div class="detail-hero">
            <div>
              <h3>{{ currentPatient.name }} · 今日提醒计划</h3>
              <p class="smart-muted" style="margin: 6px 0 0">可继续处理今日执行、异常提醒和临时调整；长期处方变更请进入用药计划。</p>
              <p class="smart-muted" style="margin: 4px 0 0">知情同意状态：{{ currentPatient.consent || '未同意' }}</p>
            </div>
            <a-space wrap>
              <a-button @click="router.push('/doctor/plans')">
                <template #icon><sa-icon icon="ri:calendar-check-line" :size="16" /></template>
                查看计划
              </a-button>
              <a-button type="primary" @click="saveDailyAdjustment">
                <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
                保存今日调整
              </a-button>
            </a-space>
          </div>
        </a-card>
        </div>

        <div class="ma-content-block p-4">
          <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16">
            <a-grid-item :span="6">
              <a-space direction="vertical" :size="2"><a-typography-text type="secondary">待执行</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ taskSummary.pending }} 条</a-typography-title></a-space>
            </a-grid-item>
            <a-grid-item :span="6">
              <a-space direction="vertical" :size="2"><a-typography-text type="secondary">已完成</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ taskSummary.done }} 条</a-typography-title></a-space>
            </a-grid-item>
            <a-grid-item :span="6">
              <a-space direction="vertical" :size="2"><a-typography-text type="secondary">异常 / 未打卡</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ taskSummary.risk }} 条</a-typography-title></a-space>
            </a-grid-item>
            <a-grid-item :span="6">
              <a-space direction="vertical" :size="2"><a-typography-text type="secondary">下一提醒</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ currentPatient.nextReminder }}</a-typography-title></a-space>
            </a-grid-item>
          </a-grid>
        </div>

        <div class="ma-content-block p-3">
        <a-card :bordered="false">
          <div class="smart-toolbar">
            <a-radio-group v-model="taskView" type="button">
              <a-radio value="今日任务">今日任务</a-radio>
              <a-radio value="异常记录">异常记录</a-radio>
            </a-radio-group>
            <a-radio-group v-model="statusFilter" type="button">
              <a-radio value="全部状态">全部状态</a-radio>
              <a-radio value="待执行">待执行</a-radio>
              <a-radio value="已完成">已完成</a-radio>
              <a-radio value="漏服">漏服</a-radio>
            </a-radio-group>
            <a-date-picker v-model="taskDate" class="task-filter-date" />
          </div>
        </a-card>
        </div>

        <div class="ma-content-block p-3">
        <a-card title="今日提醒时间表" :loading="taskLoading" :bordered="false">
          <template #extra><a-tag color="orange">异常 {{ taskSummary.risk }} 条</a-tag></template>
          <a-radio-group v-model="drugFilter" type="button" class="task-drug-filter">
            <a-radio v-for="option in drugFilterOptions" :key="option" :value="option">{{ option }}</a-radio>
          </a-radio-group>
          <a-table row-key="id" :data="displayedTasks" :pagination="false" class="task-table">
            <template #columns>
              <a-table-column title="建议时间" data-index="time" :width="112">
                <template #cell="{ record }">
                  {{ record.time }}
                  <div class="smart-muted">{{ record.period }}</div>
                </template>
              </a-table-column>
              <a-table-column title="药品" data-index="drug" :width="132">
                <template #cell="{ record }">
                  <a-typography-text :ellipsis="{ rows: 2 }">{{ record.drug }}</a-typography-text>
                </template>
              </a-table-column>
              <a-table-column title="剂量" data-index="dose" :width="86" />
              <a-table-column title="来源" data-index="source" :width="96" />
              <a-table-column title="建议" data-index="suggestion" />
              <a-table-column title="状态" data-index="status" :width="90">
                <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
              </a-table-column>
              <a-table-column title="操作" :width="150">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button v-if="record.statusType === 'danger'" size="mini" @click="notifyFamily(record)">通知</a-button>
                    <a-button v-if="record.status !== '已完成'" size="mini" type="primary" @click="markDone(record)">完成</a-button>
                    <a-button v-if="record.status === '待执行'" size="mini" status="danger" @click="markMissed(record)">漏服</a-button>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
          <a-alert class="task-tip" type="info">
            今日临时调整只影响 {{ taskDate || '所选日期' }} 的任务；需要长期变更时，请在用药计划中修改当前方案并重新下发药盒。
          </a-alert>
        </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { patientApi, taskApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const selectedPatientId = ref(pickQueryValue(route.query.patientId) || 1)
const taskView = ref('今日任务')
const drugFilter = ref('全部用药')
const statusFilter = ref('全部状态')
const taskDate = ref('2026-05-21')
const patients = ref([])
const taskRecords = ref([])
const taskLoading = ref(false)

const emptyPatient = { id: 0, name: '-', deviceStatus: '未绑定', todayDrugs: 0, nextReminder: '-', taskRisk: '-' }
const patientOptions = computed(() => {
  const value = keyword.value.trim()
  if (!value) return patients.value
  return patients.value.filter((patient) => [patient.name, patient.recordNo, patient.deviceNo].some((item) => String(item || '').includes(value)))
})
const currentPatient = computed(() => patients.value.find((item) => String(item.id) === String(selectedPatientId.value)) || patients.value[0] || emptyPatient)
const taskSummary = computed(() => ({
  pending: taskRecords.value.filter((item) => item.status === '待执行').length,
  done: taskRecords.value.filter((item) => item.status === '已完成').length,
  risk: taskRecords.value.filter((item) => item.statusType === 'danger').length
}))
const displayedTasks = computed(() => {
  let records = taskRecords.value
  if (taskView.value === '异常记录') records = records.filter((item) => item.statusType === 'danger')
  if (drugFilter.value !== '全部用药') records = records.filter((item) => item.drug === drugFilter.value)
  return records
})
const drugFilterOptions = computed(() => ['全部用药', ...Array.from(new Set(taskRecords.value.map((item) => item.drug)))])

const loadPatients = async () => {
  const response = await patientApi.list({ page: 1, limit: 100, keyword: keyword.value })
  patients.value = getRecords(response)
  if (!patients.value.some((item) => String(item.id) === String(selectedPatientId.value))) {
    selectedPatientId.value = patients.value[0]?.id || 0
  }
}

const loadTasks = async () => {
  if (!selectedPatientId.value) return
  taskLoading.value = true
  try {
    const response = await taskApi.list({
      page: 1,
      limit: 80,
      patientId: selectedPatientId.value,
      taskDate: taskDate.value,
      status: statusFilter.value
    })
    taskRecords.value = getRecords(response)
  } finally {
    taskLoading.value = false
  }
}

const saveDailyAdjustment = () => Message.success('今日调整已保存')
const markDone = async (task) => {
  await taskApi.update({ ...task, status: '已完成', statusType: 'success', source: '后台补录', completedAt: `${taskDate.value} ${task.time}` })
  Message.success('已标记为完成')
  loadTasks()
}
const markMissed = async (task) => {
  await taskApi.update({ ...task, status: '漏服', statusType: 'danger', source: '后台标记', abnormalLevel: '高风险' })
  Message.warning('已标记为漏服')
  loadTasks()
}
const notifyFamily = (task) => {
  router.push({
    path: '/doctor/messages',
    query: {
      action: 'create',
      patient: currentPatient.value.name,
      type: '子女提醒',
      receiver: currentPatient.value.child || '患者 / 子女',
      title: `${currentPatient.value.name}${task.drug}服药异常提醒`,
      content: `${task.time} ${task.drug} ${task.status}，请联系患者确认实际服药情况。`
    }
  })
  Message.success(`${task.drug} 异常提醒已进入创建流程`)
}

watch([selectedPatientId, statusFilter, taskDate], loadTasks)
onMounted(async () => {
  await loadPatients()
  await loadTasks()
})
</script>
