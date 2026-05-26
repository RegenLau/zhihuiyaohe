<template>
  <div class="smart-page">
    <div class="patient-layout">
      <a-card title="选择患者" class="patient-list-card" :bordered="false">
        <a-input-search v-model="keyword" placeholder="搜索姓名、处方编号、设备号" allow-clear />
        <div class="patient-scroll">
          <button
            v-for="patient in patientOptions"
            :key="patient.id"
            class="patient-option"
            :class="{ 'is-active': Number(patient.id) === Number(selectedPatientId) }"
            type="button"
            @click="selectedPatientId = patient.id"
          >
            <div class="smart-row" style="justify-content: space-between">
              <div>
                <strong>{{ patient.name }}</strong>
                <div class="smart-muted" style="margin-top: 4px">今日药品 {{ patient.todayDrugs }} 种</div>
              </div>
              <a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag>
            </div>
            <div class="smart-muted" style="margin-top: 8px">下一提醒：{{ patient.nextReminder }}</div>
            <div class="chip-row" style="margin-top: 8px"><a-tag>{{ patient.taskRisk }}</a-tag></div>
          </button>
        </div>
      </a-card>

      <div class="detail-stack">
        <a-card class="smart-panel" :loading="taskLoading" :bordered="false">
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

        <div class="summary-grid">
          <div class="summary-item"><span class="summary-number">{{ taskSummary.pending }} 条</span><span class="smart-muted">待执行</span></div>
          <div class="summary-item"><span class="summary-number">{{ taskSummary.done }} 条</span><span class="smart-muted">已完成</span></div>
          <div class="summary-item"><span class="summary-number is-danger">{{ taskSummary.risk }} 条</span><span class="smart-muted">异常 / 未打卡</span></div>
          <div class="summary-item"><span class="summary-number">{{ currentPatient.nextReminder }}</span><span class="smart-muted">下一提醒</span></div>
        </div>

        <a-card class="smart-panel" :bordered="false">
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

        <a-card class="smart-panel" :loading="taskLoading" :bordered="false">
          <div class="smart-card-heading">
            <div>
              <strong>今日提醒时间表</strong>
              <div class="smart-section-note">任务由生效用药计划生成；本页只处理当天执行和临时调整。</div>
            </div>
            <a-tag color="orange">异常 {{ taskSummary.risk }} 条</a-tag>
          </div>
          <a-radio-group v-model="drugFilter" type="button" class="task-drug-filter">
            <a-radio v-for="option in drugFilterOptions" :key="option" :value="option">{{ option }}</a-radio>
          </a-radio-group>
          <a-empty v-if="displayedTasks.length === 0" description="当前筛选条件下暂无服药任务" />
          <div v-else class="detail-stack">
            <div v-for="task in displayedTasks" :key="task.id" class="timeline-card">
              <a-row :gutter="12" align="center">
                <a-col :xs="24" :md="4">
                  <div class="smart-muted">系统建议时间</div>
                  <div class="task-time">{{ task.time }}</div>
                  <div class="smart-muted">{{ task.period }}</div>
                </a-col>
                <a-col :xs="24" :md="14">
                  <strong>{{ task.drug }}</strong>
                  <div class="chip-row" style="margin-top: 8px">
                    <a-tag>{{ task.dose }}</a-tag>
                    <a-tag>{{ task.source }}</a-tag>
                  </div>
                  <div class="smart-muted" style="margin-top: 8px">{{ task.suggestion }}</div>
                </a-col>
                <a-col :xs="24" :md="6" class="smart-table-action-cell">
                  <a-space wrap>
                    <a-link v-if="task.statusType === 'danger'" @click="notifyFamily(task)">
                      <sa-icon icon="ri:notification-3-line" :size="15" /> 通知子女
                    </a-link>
                    <a-link v-if="task.status !== '已完成'" status="success" @click="markDone(task)">
                      <sa-icon icon="ri:check-line" :size="15" /> 标记完成
                    </a-link>
                    <a-link v-if="task.status === '待执行'" status="danger" @click="markMissed(task)">
                      <sa-icon icon="ri:close-circle-line" :size="15" /> 标记漏服
                    </a-link>
                    <a-tag :color="statusColor(task.status)">{{ task.status }}</a-tag>
                  </a-space>
                </a-col>
              </a-row>
            </div>
          </div>
          <a-alert class="task-tip" type="info">
            今日临时调整只影响 {{ taskDate || '所选日期' }} 的任务；需要长期变更时，请在用药计划中修改当前方案并重新下发药盒。
          </a-alert>
        </a-card>
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
  router.push(`/doctor/messages?patient=${currentPatient.value.name}&type=子女提醒`)
  Message.success(`${task.drug} 异常提醒已进入消息处理`)
}

watch([selectedPatientId, statusFilter, taskDate], loadTasks)
onMounted(async () => {
  await loadPatients()
  await loadTasks()
})
</script>
