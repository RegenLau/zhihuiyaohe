<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>服药任务</h2>
        <p>先选择患者，再处理当天服药执行、异常提醒和临时调整</p>
      </div>
      <ElButton @click="exportDaily">
        <template #icon><ArtSvgIcon icon="ri:download-2-line" /></template>
        导出日报
      </ElButton>
    </div>

    <div class="patient-layout">
      <ElCard class="patient-list-card" shadow="never">
        <template #header><b>选择患者</b></template>
        <ElInput v-model="keyword" placeholder="搜索姓名、处方编号、设备号" clearable>
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>
        <ElScrollbar v-loading="patientLoading" height="calc(100vh - 260px)">
          <button
            v-for="patient in patientOptions"
            :key="patient.id"
            class="patient-option"
            :class="{ 'is-active': patient.id === selectedPatientId }"
            @click="selectedPatientId = patient.id"
          >
            <div class="flex justify-between gap-3">
              <div>
                <b>{{ patient.name }}</b>
                <div class="muted text-xs mt-1">今日药品 {{ patient.todayDrugs }} 种</div>
              </div>
              <ElTag :type="patient.deviceStatusType">{{ patient.deviceStatus }}</ElTag>
            </div>
            <div class="muted mt-2">下一提醒：{{ patient.nextReminder }}</div>
            <div class="chip-row mt-2">
              <ElTag effect="plain">{{ patient.taskRisk }}</ElTag>
            </div>
          </button>
        </ElScrollbar>
      </ElCard>

      <div class="detail-stack">
        <ElCard v-loading="taskLoading" shadow="never">
          <div class="detail-hero">
            <div>
              <h3>{{ currentPatient.name }} · 今日提醒计划</h3>
              <p class="muted mt-1"
                >可继续处理今日执行、异常提醒和临时调整；长期处方变更请进入用药计划。</p
              >
            </div>
            <ElSpace wrap>
              <ElButton @click="router.push('/doctor/plans')">
                <template #icon><ArtSvgIcon icon="ri:calendar-check-line" /></template>
                查看计划
              </ElButton>
              <ElButton type="primary" @click="saveDailyAdjustment">
                <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                保存今日调整
              </ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-number">{{ taskSummary.pending }} 条</span>
            <span class="muted">待执行</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ taskSummary.done }} 条</span>
            <span class="muted">已完成</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ taskSummary.risk }} 条</span>
            <span class="muted">异常 / 未打卡</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ currentPatient.nextReminder }}</span>
            <span class="muted">下一提醒</span>
          </div>
        </div>

        <ElCard shadow="never">
          <div class="flex justify-between items-center gap-3 flex-wrap">
            <ElSegmented v-model="taskView" :options="['今日任务', '整体方案', '异常记录']" />
            <ElDatePicker v-model="taskDate" type="date" value-format="YYYY-MM-DD" />
          </div>
        </ElCard>

        <ElCard shadow="never">
          <template #header>
            <div class="flex justify-between items-start gap-3">
              <div>
                <b>今日提醒时间表</b>
                <div class="muted text-sm mt-1"
                  >任务由生效用药计划生成；本页只处理当天执行和临时调整。</div
                >
              </div>
              <ElTag type="warning">异常 {{ taskSummary.risk }} 条</ElTag>
            </div>
          </template>
          <ElSegmented
            v-model="drugFilter"
            :options="['全部用药', '硝苯地平控释片', '二甲双胍片']"
            class="mb-4"
          />
          <ElEmpty v-if="displayedTasks.length === 0" description="当前筛选条件下暂无服药任务" />
          <div v-else class="detail-stack">
            <div v-for="task in displayedTasks" :key="task.id" class="timeline-card">
              <ElRow :gutter="12" align="middle">
                <ElCol :xs="24" :md="4">
                  <div class="muted">系统建议时间</div>
                  <div class="task-time">{{ task.time }}</div>
                  <div class="muted">{{ task.period }}</div>
                </ElCol>
                <ElCol :xs="24" :md="14">
                  <b>{{ task.drug }}</b>
                  <div class="chip-row mt-2">
                    <ElTag>{{ task.dose }}</ElTag>
                    <ElTag>{{ task.source }}</ElTag>
                  </div>
                  <div class="muted mt-2">{{ task.suggestion }}</div>
                </ElCol>
                <ElCol :xs="24" :md="6" class="text-right">
                  <ElButton
                    v-if="task.statusType === 'danger'"
                    type="primary"
                    link
                    @click="router.push('/doctor/messages')"
                  >
                    <template #icon><ArtSvgIcon icon="ri:notification-3-line" /></template>
                    通知子女
                  </ElButton>
                  <ElButton v-else-if="task.statusType === 'warning'" type="primary" link>
                    <template #icon><ArtSvgIcon icon="ri:edit-line" /></template>
                    修改剂量
                  </ElButton>
                  <ElTag :type="task.statusType">{{ task.status }}</ElTag>
                </ElCol>
              </ElRow>
            </div>
          </div>
          <ElAlert
            class="mt-4"
            show-icon
            :closable="false"
            type="info"
            :title="`今日临时调整只影响 ${taskDate || '所选日期'} 的任务；需要长期变更时，请在用药计划中修改当前方案并重新下发药盒。`"
          />
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import taskApi from '@/views/plugin/smart-pillbox/api/doctor/task'
  import type { MedicationTask, Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxTask' })

  const router = useRouter()
  const keyword = ref('')
  const selectedPatientId = ref(1)
  const taskView = ref('今日任务')
  const drugFilter = ref('全部用药')
  const taskDate = ref('2026-05-20')
  const patients = ref<Patient[]>([])
  const taskRecords = ref<MedicationTask[]>([])
  const patientLoading = ref(false)
  const taskLoading = ref(false)

  const emptyPatient: Patient = {
    id: 0,
    name: '-',
    gender: '-',
    age: 0,
    recordNo: '-',
    phone: '-',
    diseases: [],
    deviceNo: '-',
    deviceStatus: '未绑定',
    deviceStatusType: 'info',
    consent: '未同意',
    child: '-',
    nextReminder: '-',
    todayDrugs: 0,
    recentInteraction: '-',
    completionRate: 0,
    taskRisk: '-'
  }

  const patientOptions = computed(() =>
    patients.value.filter((patient) => !keyword.value || patient.name.includes(keyword.value))
  )
  const currentPatient = computed(
    () =>
      patients.value.find((item) => item.id === selectedPatientId.value) ||
      patients.value[0] ||
      emptyPatient
  )
  const taskSummary = computed(() => ({
    pending: taskRecords.value.filter((item) => item.status === '待执行').length,
    done: taskRecords.value.filter((item) => item.status === '已完成').length,
    risk: taskRecords.value.filter((item) => item.statusType === 'danger').length
  }))
  const displayedTasks = computed(() => {
    if (taskView.value === '异常记录') {
      return taskRecords.value.filter((item) => item.statusType === 'danger')
    }
    return taskRecords.value
  })

  const loadPatients = async () => {
    patientLoading.value = true
    try {
      const result = await patientApi.list({ page: 1, limit: 100, keyword: keyword.value })
      patients.value = result.records
      if (!patients.value.some((item) => item.id === selectedPatientId.value)) {
        selectedPatientId.value = patients.value[0]?.id || 0
      }
    } finally {
      patientLoading.value = false
    }
  }

  const loadTasks = async () => {
    if (!selectedPatientId.value) return
    taskLoading.value = true
    try {
      const result = await taskApi.list({
        page: 1,
        limit: 50,
        patientId: selectedPatientId.value,
        taskDate: taskDate.value,
        drug: drugFilter.value
      })
      taskRecords.value = result.records
    } finally {
      taskLoading.value = false
    }
  }

  const exportDaily = async () => {
    await taskApi.exportDaily({ patientId: selectedPatientId.value, taskDate: taskDate.value })
    ElMessage.success('已生成今日服药任务日报')
  }

  const saveDailyAdjustment = () => {
    ElMessage.success('今日调整已保存')
  }

  watch([selectedPatientId, drugFilter, taskDate], () => {
    loadTasks()
  })

  onMounted(async () => {
    await loadPatients()
    await loadTasks()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
