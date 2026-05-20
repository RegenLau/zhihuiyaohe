<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>对话记录</h2>
        <p>先选择患者，再查看患者与小智设备的提醒、聊天和未响应记录</p>
      </div>
    </div>

    <div class="patient-layout">
      <ElCard class="patient-list-card" shadow="never">
        <template #header><b>选择患者</b></template>
        <ElInput v-model="keyword" placeholder="搜索姓名、处方编号、设备号" clearable>
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>
        <ElScrollbar v-loading="patientLoading" height="calc(100vh - 250px)">
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

      <div class="detail-stack">
        <ElCard shadow="never">
          <div class="detail-hero">
            <div>
              <h2>{{ currentPatient.name }} 的对话记录</h2>
              <p class="muted mt-1">患者与小智设备的提醒、患者聊天、未响应记录统一按时间回看。</p>
            </div>
            <ElSpace wrap>
              <ElButton @click="router.push('/doctor/devices')">
                <template #icon><ArtSvgIcon icon="ri:computer-line" /></template>
                设备摘要
              </ElButton>
              <ElButton type="primary" @click="exportConversation">
                <template #icon><ArtSvgIcon icon="ri:file-download-line" /></template>
                导出记录
              </ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <div class="summary-grid">
          <div class="summary-item"><span class="summary-number">{{ conversations.length }} 条</span><span class="muted">近7天互动</span></div>
          <div class="summary-item"><span class="summary-number">{{ respondedCount }} 次</span><span class="muted">患者响应</span></div>
          <div class="summary-item"><span class="summary-number">{{ pendingCount }} 项</span><span class="muted">待人工跟进</span></div>
          <div class="summary-item"><span class="summary-number">{{ currentPatient.recentInteraction }}</span><span class="muted">最近一次互动</span></div>
        </div>

        <ElCard v-loading="conversationLoading" shadow="never">
          <template #header>
            <div class="flex justify-between items-start gap-3">
              <div>
                <b>对话时间线</b>
                <div class="muted text-sm mt-1">按时间回看患者与小智设备的提醒、患者聊天及未响应记录。</div>
              </div>
              <ElTag type="primary">最近 {{ conversations.length }} 条</ElTag>
            </div>
          </template>
          <ElSegmented v-model="conversationFilter" :options="['全部 3', '小智提醒 1', '患者聊天 2', '未响应 1']" class="mb-4" />
          <div class="detail-stack">
            <div v-for="item in conversations" :key="item.id" class="timeline-card">
              <div class="flex justify-between items-center mb-3">
                <b>{{ item.time }}</b>
                <ElTag :type="item.statusType">{{ item.status }}</ElTag>
              </div>
              <div class="conversation-flow">
                <div v-if="item.deviceText" class="bubble">{{ item.deviceText }}</div>
                <div v-if="item.patientText" class="bubble right">{{ item.patientText }}</div>
                <ElAlert v-if="item.note" :title="item.note" type="warning" show-icon :closable="false" />
              </div>
            </div>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import conversationApi from '@/views/plugin/smart-pillbox/api/doctor/conversation'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type { Conversation, Patient } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxConversationRecord' })

  const router = useRouter()
  const keyword = ref('')
  const selectedPatientId = ref(1)
  const conversationFilter = ref('全部 3')
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
    patients.value.filter((patient) => !keyword.value || patient.name.includes(keyword.value))
  )
  const currentPatient = computed(
    () => patients.value.find((item) => item.id === selectedPatientId.value) || patients.value[0] || emptyPatient
  )
  const respondedCount = computed(() => conversations.value.filter((item) => item.patientText).length)
  const pendingCount = computed(() => conversations.value.filter((item) => item.status.includes('待')).length)
  const conversationType = computed(() => {
    if (conversationFilter.value.includes('小智提醒')) return '小智提醒'
    if (conversationFilter.value.includes('患者聊天')) return '患者聊天'
    return ''
  })
  const conversationStatus = computed(() => {
    if (conversationFilter.value.includes('未响应')) return '待人工跟进'
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

  const exportConversation = async () => {
    await conversationApi.export({ patientId: selectedPatientId.value })
    ElMessage.success('已导出当前患者对话记录')
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
  @use '../../style.scss';
</style>
