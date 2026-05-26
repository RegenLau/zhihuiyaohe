<template>
  <div class="smart-page conversation-page">
    <a-card class="smart-panel" :bordered="false">
      <a-row class="smart-filter-row" :gutter="[12, 12]" align="center">
        <a-col :xs="24" :md="8">
          <a-input-search
            v-model="filters.keyword"
            placeholder="搜索姓名、处方编号、设备号"
            allow-clear
          />
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-select v-model="filters.type" placeholder="全部" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="患者聊天">患者聊天</a-option>
            <a-option value="小智提醒">小智提醒</a-option>
            <a-option value="设备事件">设备事件</a-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-select v-model="filters.status" placeholder="跟进状态" allow-clear>
            <a-option value="待人工跟进">待人工跟进</a-option>
            <a-option value="待处理">待处理</a-option>
            <a-option value="未响应">未响应</a-option>
            <a-option value="已归档">已归档</a-option>
            <a-option value="已确认">已确认</a-option>
            <a-option value="已闭环">已闭环</a-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="6" class="smart-filter-actions">
          <a-space wrap>
            <a-button type="primary" @click="handleExport">
              <template #icon><sa-icon icon="ri:download-2-line" :size="16" /></template>
              导出记录
            </a-button>
            <a-button :loading="loading" @click="fetchConversations">
              <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
              刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <a-spin :loading="loading">
      <div class="conversation-shell">
        <a-card class="conversation-users" :bordered="false">
          <div class="conversation-users-title">选择患者</div>
          <div v-if="patientGroups.length" class="conversation-user-list">
            <button
              v-for="group in patientGroups"
              :key="group.patientId"
              type="button"
              class="conversation-user-item"
              :class="{ 'is-active': String(group.patientId) === String(activePatientId) }"
              @click="selectPatient(group.patientId)"
            >
              <span class="conversation-user-main">
                <span class="conversation-user-head">
                  <strong>{{ group.patient }}</strong>
                  <span v-if="group.pendingCount" class="conversation-pending-text">待跟进 {{ group.pendingCount }}</span>
                </span>
                <span class="conversation-user-line">
                  <span>{{ group.deviceNo }}</span>
                  <span>最近互动：{{ group.latestTime }}</span>
                </span>
              </span>
            </button>
          </div>
          <a-empty v-else description="暂无患者对话" />
        </a-card>

        <a-card class="conversation-records" :bordered="false">
          <div v-if="activePatient" class="conversation-records-header">
            <div>
              <div class="conversation-records-title">{{ activePatient.patient }}</div>
              <div class="smart-muted">
                {{ activePatient.deviceNo || '未绑定' }}，最近 {{ activeMessages.length }} 条记录
              </div>
              <div class="smart-muted">知情同意：未同意时需先回到患者详情补齐授权</div>
            </div>
            <a-button type="outline" @click="openPatient(activePatient.patientId)">
              <template #icon><sa-icon icon="ri:user-heart-line" :size="16" /></template>
              患者详情
            </a-button>
          </div>

          <div v-if="activeMessages.length" class="conversation-message-list">
            <div class="summary-grid conversation-summary">
              <div class="summary-item"><span class="summary-number">{{ activeMessages.length }} 条</span><span class="smart-muted">近7天互动</span></div>
              <div class="summary-item"><span class="summary-number">{{ respondedCount }} 次</span><span class="smart-muted">患者响应</span></div>
              <div class="summary-item"><span class="summary-number is-warning">{{ pendingCount }} 项</span><span class="smart-muted">待人工跟进</span></div>
              <div class="summary-item"><span class="summary-number">{{ activePatient.latestTime }}</span><span class="smart-muted">最近一次互动</span></div>
            </div>
            <div v-for="message in activeMessages" :key="message.id" class="conversation-message">
              <div class="conversation-message-meta">
                <span>{{ message.time }}</span>
                <a-tag color="blue">{{ message.type }}</a-tag>
                <a-tag :color="statusColor(message.status)">{{ message.status }}</a-tag>
              </div>

              <div v-if="message.patientText" class="conversation-bubble conversation-bubble-patient">
                <div class="conversation-bubble-role">患者</div>
                <div>{{ message.patientText }}</div>
              </div>
              <div v-if="message.deviceText" class="conversation-bubble conversation-bubble-device">
                <div class="conversation-bubble-role">小智药盒</div>
                <div>{{ message.deviceText }}</div>
              </div>
              <div v-if="message.note" class="conversation-note">{{ message.note }}</div>
            </div>
          </div>
          <a-empty v-else description="当前筛选条件下暂无对话记录" />
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { conversationApi } from '@/views/plugin/smart-pillbox/api/doctor'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const conversations = ref([])
const activePatientId = ref(route.query.patientId || '')

const filters = reactive({
  keyword: '',
  type: '',
  status: ''
})

const filteredConversations = computed(() => {
  const keyword = filters.keyword.trim()
  return conversations.value.filter((item) => {
    const keywordMatched =
      !keyword ||
      [item.patient, item.deviceNo, item.patientText, item.deviceText, item.note]
        .filter(Boolean)
        .some((value) => String(value).includes(keyword))
    const typeMatched = !filters.type || item.type === filters.type
    const statusMatched = !filters.status || item.status === filters.status
    return keywordMatched && typeMatched && statusMatched
  })
})

const patientGroups = computed(() => {
  const groupMap = new Map()
  filteredConversations.value.forEach((item) => {
    const key = String(item.patientId)
    const group = groupMap.get(key) || {
      patientId: item.patientId,
      patient: item.patient,
      deviceNo: item.deviceNo,
      latestTime: item.time,
      pendingCount: 0,
      messages: []
    }
    group.messages.push(item)
    if (['待人工跟进', '待处理', '未响应'].includes(item.status)) {
      group.pendingCount += 1
    }
    groupMap.set(key, group)
  })
  return Array.from(groupMap.values()).sort((a, b) => Number(b.messages[0]?.id || 0) - Number(a.messages[0]?.id || 0))
})

const activePatient = computed(() => {
  return patientGroups.value.find((group) => String(group.patientId) === String(activePatientId.value))
})

const activeMessages = computed(() => {
  return [...(activePatient.value?.messages || [])].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
})
const pendingCount = computed(() => activeMessages.value.filter((item) => ['待人工跟进', '待处理', '未响应'].includes(item.status)).length)
const respondedCount = computed(() => activeMessages.value.filter((item) => item.patientText).length)

const fetchConversations = async () => {
  loading.value = true
  try {
    const response = await conversationApi.list({ limit: 200 })
    conversations.value = response?.data?.data || []
  } finally {
    loading.value = false
  }
}

const selectPatient = (patientId) => {
  activePatientId.value = patientId
}

const openPatient = (patientId) => {
  router.push(`/doctor/patient-detail?id=${patientId}`)
}

const statusColor = (status) => {
  if (['待人工跟进', '待处理'].includes(status)) return 'orange'
  if (status === '未响应') return 'red'
  if (['已确认', '已恢复', '已处理', '已归档', '已闭环'].includes(status)) return 'green'
  return 'gray'
}

const handleExport = async () => {
  await conversationApi.export()
  Message.success('导出任务已提交')
}

watch(
  patientGroups,
  (groups) => {
    if (!groups.length) {
      return
    }
    const activeExists = groups.some((group) => String(group.patientId) === String(activePatientId.value))
    if (!activeExists) {
      activePatientId.value = groups[0].patientId
    }
  },
  { immediate: true }
)

onMounted(fetchConversations)
</script>
