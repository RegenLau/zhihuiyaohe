<template>
  <div class="pillbox-page page-content conversation-page">
    <div class="page-header">
      <div>
        <h2>对话记录</h2>
        <p>先选择患者，再查看患者与小智设备的提醒、聊天和未响应记录</p>
      </div>
    </div>

    <div class="patient-layout conversation-layout">
      <ElCard class="patient-list-card conversation-patient-card" shadow="never">
        <template #header><b>选择患者</b></template>
        <ElInput v-model="keyword" placeholder="搜索姓名、处方编号、设备号" clearable>
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>
        <ElScrollbar v-loading="patientLoading" class="patient-scrollbar">
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
                <div class="muted text-xs mt-1">{{ patient.recordNo }} · {{ patient.age }}岁</div>
              </div>
              <ElTag :type="patient.deviceStatusType">{{ patient.deviceStatus }}</ElTag>
            </div>
            <div class="muted mt-2">最近互动：{{ patient.recentInteraction }}</div>
          </button>
        </ElScrollbar>
      </ElCard>

      <div class="detail-stack conversation-detail">
        <ElCard v-loading="conversationLoading" class="timeline-card-shell" shadow="never">
          <template #header>
            <div class="timeline-header">
              <ElTabs v-model="conversationFilter" class="timeline-tabs">
                <ElTabPane
                  v-for="option in conversationFilterOptions"
                  :key="option"
                  :label="option"
                  :name="option"
                />
              </ElTabs>
              <ElTag type="primary">最近 {{ conversations.length }} 条</ElTag>
            </div>
          </template>
          <ElScrollbar class="conversation-scrollbar">
            <div class="conversation-scroll-content">
              <div v-if="conversationFilter === '全部'" class="summary-grid conversation-summary">
                <div class="summary-item">
                  <span class="summary-number">{{ conversations.length }} 条</span>
                  <span class="muted">近7天互动</span>
                </div>
                <div class="summary-item">
                  <span class="summary-number">{{ respondedCount }} 次</span>
                  <span class="muted">患者响应</span>
                </div>
                <div class="summary-item">
                  <span class="summary-number">{{ pendingCount }} 项</span>
                  <span class="muted">待人工跟进</span>
                </div>
                <div class="summary-item">
                  <span class="summary-number">{{ currentPatient.recentInteraction }}</span>
                  <span class="muted">最近一次互动</span>
                </div>
              </div>
              <ElEmpty v-if="conversations.length === 0" description="当前筛选条件下暂无对话记录" />
              <div v-else class="detail-stack timeline-list">
                <div v-for="item in conversations" :key="item.id" class="timeline-card">
                  <div class="flex justify-between items-center mb-3">
                    <b>{{ item.time }}</b>
                    <ElTag :type="item.statusType">{{ item.status }}</ElTag>
                  </div>
                  <div class="conversation-flow">
                    <div v-if="item.deviceText" class="bubble">{{ item.deviceText }}</div>
                    <div v-if="item.patientText" class="bubble right">{{ item.patientText }}</div>
                  </div>
                </div>
              </div>
            </div>
          </ElScrollbar>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import conversationApi from '@/views/plugin/smart-pillbox/api/doctor/conversation'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type { Conversation, Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxConversationRecord' })

  const route = useRoute()
  const keyword = ref('')
  const selectedPatientId = ref(Number(route.query.patientId || 1))
  const conversationFilter = ref('全部')
  const conversationFilterOptions = ['全部', '小智提醒', '患者聊天', '设备事件', '未响应']
  const patients = ref<Patient[]>([])
  const conversations = ref<Conversation[]>([])
  const patientLoading = ref(false)
  const conversationLoading = ref(false)

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
    patients.value.filter(
      (patient) =>
        !keyword.value ||
        [patient.name, patient.recordNo, patient.deviceNo].some((value) => value.includes(keyword.value))
    )
  )
  const currentPatient = computed(
    () =>
      patients.value.find((item) => item.id === selectedPatientId.value) ||
      patients.value[0] ||
      emptyPatient
  )
  const pendingCount = computed(
    () => conversations.value.filter((item) => item.status.includes('待')).length
  )
  const respondedCount = computed(
    () => conversations.value.filter((item) => item.patientText).length
  )
  const conversationType = computed(() => {
    if (conversationFilter.value === '小智提醒') return '小智提醒'
    if (conversationFilter.value === '患者聊天') return '患者聊天'
    if (conversationFilter.value === '设备事件') return '设备事件'
    return ''
  })
  const conversationStatus = computed(() => {
    if (conversationFilter.value === '未响应') return '未响应'
    return ''
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

  const loadConversations = async () => {
    if (!selectedPatientId.value) return
    conversationLoading.value = true
    try {
      const result = await conversationApi.list({
        page: 1,
        limit: 50,
        patientId: selectedPatientId.value,
        type: conversationType.value,
        status: conversationStatus.value
      })
      conversations.value = result.records
    } finally {
      conversationLoading.value = false
    }
  }

  watch([selectedPatientId, conversationFilter], () => {
    loadConversations()
  })

  onMounted(async () => {
    await loadPatients()
    await loadConversations()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';

  .conversation-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 118px);
    min-height: 560px;
    overflow: hidden;
  }

  .conversation-layout {
    flex: 1;
    min-height: 0;
    align-items: stretch;
  }

  .conversation-patient-card {
    position: static;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
    }
  }

  .patient-scrollbar {
    flex: 1;
    min-height: 0;
    margin-top: 10px;

    :deep(.el-scrollbar__bar) {
      display: none;
    }

    :deep(.el-scrollbar__wrap) {
      scrollbar-width: none;
    }

    :deep(.el-scrollbar__wrap::-webkit-scrollbar) {
      display: none;
    }
  }

  .conversation-detail {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .timeline-card-shell {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
  }

  .conversation-scrollbar {
    flex: 1;
    min-height: 0;
  }

  .conversation-scroll-content {
    min-height: 100%;
  }

  .conversation-summary {
    margin-bottom: 14px;
  }

  .timeline-list {
    gap: 12px;
    padding-right: 4px;
  }

  .timeline-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .timeline-tabs {
    flex: 1;
    min-width: 0;

    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__item) {
      height: 32px;
      font-size: 14px;
      line-height: 32px;
    }
  }
</style>
