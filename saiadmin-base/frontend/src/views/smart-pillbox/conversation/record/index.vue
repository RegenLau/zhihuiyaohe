<template>
  <div class="smart-page conversation-page">
    <a-spin :loading="loading">
      <div class="conversation-shell">
        <div class="ma-content-block p-3 conversation-patient-panel">
          <a-card title="选择患者" :bordered="false">
            <a-input-search v-model="filters.keyword" placeholder="搜索姓名、设备号" allow-clear />

            <a-tabs v-model:active-key="filters.follow" type="rounded" class="conversation-filter-tabs smart-block-gap-xs">
              <a-tab-pane key="" title="全部" />
              <a-tab-pane key="pending" title="待跟进" />
            </a-tabs>

            <a-empty v-if="!patientGroups.length" class="smart-block-gap-sm" description="暂无患者对话" />
            <a-list v-else class="conversation-patient-list smart-block-gap-sm" :bordered="false" :split="false" :data="patientGroups">
              <template #item="{ item }">
                <a-list-item class="conversation-patient-item">
                  <a-card
                    class="conversation-patient-card"
                    :class="{ 'is-active': String(item.patientId) === String(activePatientId) }"
                    :bordered="true"
                    @click="selectPatient(item.patientId)"
                  >
                    <div class="conversation-patient-top">
                      <a-space :size="6" wrap>
                        <a-typography-text bold>{{ item.patient }}</a-typography-text>
                        <span v-if="item.age" class="smart-muted">{{ item.age }} 岁</span>
                      </a-space>
                      <a-tag v-if="item.deviceStatus" :color="statusColor(item.deviceStatus)">{{ item.deviceStatus }}</a-tag>
                    </div>
                    <a-space direction="vertical" :size="4" fill>
                      <span class="smart-muted">设备：{{ item.deviceNo || '-' }}</span>
                      <span>最近互动：{{ item.latestTime || '-' }}</span>
                    </a-space>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </div>

        <div class="conversation-message-list">
          <div class="ma-content-block p-4 conversation-timeline-panel">
            <div class="tab-toolbar">
              <div>
                <h4>对话时间线</h4>
                <p>按时间查看患者与小智设备的提醒、患者聊天及未响应记录。</p>
              </div>
              <a-tag color="arcoblue">最近 {{ timelineMessages.length }} 条</a-tag>
            </div>

            <a-tabs v-model:active-key="timelineType" type="rounded" class="conversation-timeline-tabs smart-block-gap-sm">
              <a-tab-pane v-for="item in timelineTabs" :key="item.value" :title="`${item.label} ${item.count}`" />
            </a-tabs>

            <a-empty v-if="!timelineMessages.length" class="smart-block-gap-sm" description="暂无对话记录" />
            <a-list v-else class="conversation-timeline-list smart-block-gap-sm" :bordered="false" :data="timelineMessages">
              <template #item="{ item }">
                <a-list-item>
                  <div class="conversation-timeline-item">
                    <div class="smart-row is-between">
                      <a-space wrap>
                        <a-typography-text bold>{{ item.time }}</a-typography-text>
                        <a-tag :color="typeColor(item.type)">{{ item.type }}</a-tag>
                        <a-tag :color="statusColor(item.status)">{{ item.status }}</a-tag>
                        <a-tag v-if="item.riskLevel" :color="statusColor(item.riskLevel)">{{ item.riskLevel }}</a-tag>
                      </a-space>
                    </div>
                    <div class="conversation-chat-flow">
                      <div v-if="item.patientText" class="conversation-chat-row is-patient">
                        <a-avatar :size="32">{{ item.patient?.slice(0, 1) || '患' }}</a-avatar>
                        <div class="conversation-chat-content">
                          <span class="conversation-chat-name">{{ item.patient || '患者' }}</span>
                          <div class="conversation-chat-bubble">{{ item.patientText }}</div>
                        </div>
                      </div>
                      <div v-if="item.deviceText" class="conversation-chat-row is-device">
                        <div class="conversation-chat-content">
                          <span class="conversation-chat-name">小智药盒</span>
                          <div class="conversation-chat-bubble">{{ item.deviceText }}</div>
                        </div>
                        <a-avatar :size="32" :style="summaryIconStyle('primary')">
                          <sa-icon icon="ri:robot-2-line" :size="16" />
                        </a-avatar>
                      </div>
                      <a-alert v-if="item.note" type="warning" :show-icon="false">{{ item.note }}</a-alert>
                    </div>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>
      </div>
    </a-spin>

    <a-drawer v-model:visible="reviewVisible" :width="720" title="对话详情与风险复核" unmount-on-close>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="患者">{{ currentConversation.patient }}</a-descriptions-item>
        <a-descriptions-item label="设备">{{ currentConversation.deviceNo }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ currentConversation.time }}</a-descriptions-item>
        <a-descriptions-item label="风险等级"><a-tag :color="statusColor(currentConversation.riskLevel || '正常')">{{ currentConversation.riskLevel || '正常' }}</a-tag></a-descriptions-item>
        <a-descriptions-item label="患者问题">{{ currentConversation.patientText || '-' }}</a-descriptions-item>
        <a-descriptions-item label="小智答复">{{ currentConversation.deviceText || '-' }}</a-descriptions-item>
        <a-descriptions-item label="系统提示">{{ currentConversation.note || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-card title="知识命中" :bordered="false" class="smart-block-gap-sm">
        <template v-if="currentConversation.knowledgeHit">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="命中标题">{{ currentConversation.knowledgeHit.title }}</a-descriptions-item>
            <a-descriptions-item label="摘要">{{ currentConversation.knowledgeHit.summary }}</a-descriptions-item>
          </a-descriptions>
        </template>
        <a-empty v-else description="当前记录无知识命中" />
      </a-card>

      <a-form :model="reviewForm" layout="vertical" class="smart-block-gap-sm">
        <a-form-item label="复核结论">
          <a-select v-model="reviewForm.reviewStatus">
            <a-option value="已复核">已复核</a-option>
            <a-option value="需继续跟进">需继续跟进</a-option>
            <a-option value="无需复核">无需复核</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理意见">
          <a-textarea v-model="reviewForm.reviewOpinion" :auto-size="{ minRows: 4, maxRows: 6 }" placeholder="请输入医药师复核意见" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="reviewVisible = false">关闭</a-button>
        <a-button type="primary" @click="saveReview">保存复核</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { conversationApi, patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { pickQueryValue } from '@/views/smart-pillbox/utils'

const route = useRoute()
const loading = ref(false)
const conversations = ref([])
const patients = ref([])
const activePatientId = ref(String(pickQueryValue(route.query.patientId)))
const timelineType = ref('全部')
const reviewVisible = ref(false)
const currentConversation = reactive({})
const reviewForm = reactive({ reviewStatus: '已复核', reviewOpinion: '' })

const filters = reactive({
  keyword: '',
  follow: ''
})

const patientMap = computed(() => {
  return new Map(patients.value.map((item) => [String(item.id), item]))
})

const filteredConversations = computed(() => {
  const keyword = filters.keyword.trim()
  return conversations.value.filter((item) => {
    const patientProfile = patientMap.value.get(String(item.patientId)) || {}
    const keywordMatched =
      !keyword ||
      [item.patient, item.deviceNo, item.patientText, item.deviceText, item.note, patientProfile.recordNo]
        .filter(Boolean)
        .some((value) => String(value).includes(keyword))
    return keywordMatched
  })
})

const patientGroups = computed(() => {
  const groupMap = new Map()
  filteredConversations.value.forEach((item) => {
    const key = String(item.patientId)
    const patientProfile = patientMap.value.get(key) || {}
    const group = groupMap.get(key) || {
      patientId: item.patientId,
      patient: item.patient,
      age: patientProfile.age,
      recordNo: patientProfile.recordNo,
      deviceNo: patientProfile.deviceNo || item.deviceNo,
      deviceStatus: patientProfile.deviceStatus,
      latestTime: item.time,
      latestId: Number(item.id || 0),
      pendingCount: 0,
      messages: []
    }
    group.messages.push(item)
    if (Number(item.id || 0) > group.latestId) {
      group.latestId = Number(item.id || 0)
      group.latestTime = item.time
    }
    if (['待人工跟进', '待处理', '未响应'].includes(item.status)) {
      group.pendingCount += 1
    }
    groupMap.set(key, group)
  })
  return Array.from(groupMap.values())
    .filter((item) => filters.follow !== 'pending' || item.pendingCount > 0)
    .sort((a, b) => Number(b.latestId || 0) - Number(a.latestId || 0))
})

const activePatient = computed(() => {
  return patientGroups.value.find((group) => String(group.patientId) === String(activePatientId.value))
})

const activeMessages = computed(() => {
  return [...(activePatient.value?.messages || [])].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
})

const timelineMessages = computed(() => {
  if (timelineType.value === '全部') return activeMessages.value
  return activeMessages.value.filter((item) => item.type === timelineType.value)
})

const timelineTabs = computed(() => {
  const tabs = [
    { label: '全部', value: '全部' },
    { label: '小智提醒', value: '小智提醒' },
    { label: '患者聊天', value: '患者聊天' },
    { label: '设备事件', value: '设备事件' }
  ]
  return tabs.map((tab) => ({
    ...tab,
    count: tab.value === '全部' ? activeMessages.value.length : activeMessages.value.filter((item) => item.type === tab.value).length
  }))
})

const fetchConversations = async () => {
  loading.value = true
  try {
    const [conversationResponse, patientResponse] = await Promise.all([
      conversationApi.list({ limit: 200 }),
      patientApi.list({ limit: 200 })
    ])
    conversations.value = conversationResponse?.data?.data || []
    patients.value = patientResponse?.data?.data || []
  } finally {
    loading.value = false
  }
}

const selectPatient = (patientId) => {
  activePatientId.value = patientId
  timelineType.value = '全部'
}

const isPendingMessage = (message) => ['待人工跟进', '待处理', '未响应'].includes(message.status)

const markMessageClosed = async (message) => {
  await conversationApi.update({ ...message, status: '已闭环', handledAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  Message.success('对话已标记处理')
  await fetchConversations()
}

const openReviewDrawer = (message) => {
  Object.keys(currentConversation).forEach((key) => delete currentConversation[key])
  Object.assign(currentConversation, message)
  Object.assign(reviewForm, {
    reviewStatus: message.reviewStatus === '待复核' ? '已复核' : message.reviewStatus || '已复核',
    reviewOpinion: message.reviewOpinion || message.note || ''
  })
  reviewVisible.value = true
}

const saveReview = async () => {
  if (!currentConversation.id) return
  await conversationApi.review({
    ...currentConversation,
    ...reviewForm,
    handledAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  Message.success('对话复核已保存')
  reviewVisible.value = false
  await fetchConversations()
}

const statusColor = (status) => {
  if (['待人工跟进', '待处理'].includes(status)) return 'orange'
  if (status === '未响应') return 'red'
  if (['已确认', '已恢复', '已处理', '已归档', '已闭环', '在线'].includes(status)) return 'green'
  if (status === '离线') return 'red'
  if (status === '高风险') return 'red'
  if (status === '关注') return 'orange'
  if (status === '正常') return 'green'
  return 'gray'
}

const typeColor = (type) => {
  if (type === '患者聊天') return 'arcoblue'
  if (type === '小智提醒') return 'green'
  if (type === '设备事件') return 'orange'
  return 'gray'
}

const summaryIconStyle = (tone) => {
  const colorMap = {
    primary: 'rgb(var(--primary-6))',
    success: 'rgb(var(--green-6))',
    warning: 'rgb(var(--orange-6))'
  }

  return {
    color: '#fff',
    backgroundColor: colorMap[tone] || 'rgb(var(--primary-6))'
  }
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
