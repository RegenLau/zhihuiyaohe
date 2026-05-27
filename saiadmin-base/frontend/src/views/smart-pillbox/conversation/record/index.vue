<template>
  <div class="smart-page conversation-page">
    <div class="ma-content-block p-4">
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
            <a-button :loading="loading" @click="fetchConversations">
              <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
              刷新
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <a-spin :loading="loading">
      <div class="official-two-column">
        <div class="ma-content-block p-2">
          <a-table row-key="patientId" :data="patientGroups" :pagination="false" size="small">
            <template #columns>
              <a-table-column title="患者" data-index="patient">
                <template #cell="{ record }">
                  <a-space direction="vertical" :size="2" fill>
                    <a-link @click="selectPatient(record.patientId)">{{ record.patient }}</a-link>
                    <span class="smart-muted">{{ record.deviceNo }}</span>
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="待跟进" data-index="pendingCount" :width="82">
                <template #cell="{ record }">
                  <a-tag :color="record.pendingCount ? 'orange' : 'green'">{{ record.pendingCount }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>

        <div class="ma-content-block p-2">
          <a-table row-key="id" :data="activeMessages" :pagination="false" :scroll="{ x: 860 }">
            <template #columns>
              <a-table-column title="时间" data-index="time" :width="150" />
              <a-table-column title="类型" data-index="type" :width="120">
                <template #cell="{ record }">
                  <a-tag color="blue">{{ record.type }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="130">
                <template #cell="{ record }">
                  <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="风险" data-index="riskLevel" :width="110">
                <template #cell="{ record }">
                  <a-tag :color="statusColor(record.riskLevel || '正常')">{{ record.riskLevel || '正常' }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="内容">
                <template #cell="{ record }">
                  <a-space direction="vertical" :size="6" fill>
                    <div v-if="record.patientText">
                      <span class="smart-muted">患者：</span>{{ record.patientText }}
                    </div>
                    <div v-if="record.deviceText">
                      <span class="smart-muted">小智药盒：</span>{{ record.deviceText }}
                    </div>
                    <a-alert v-if="record.note" type="warning">{{ record.note }}</a-alert>
                  </a-space>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="220">
                <template #cell="{ record }">
                  <a-space size="mini">
                    <a-button size="mini" @click="openReviewDrawer(record)">详情</a-button>
                    <a-button v-if="isPendingMessage(record)" size="mini" type="primary" @click="openReviewDrawer(record)">复核</a-button>
                    <a-button v-if="isPendingMessage(record)" size="mini" @click="createReminder(record)">提醒</a-button>
                    <span v-if="!isPendingMessage(record)" class="smart-muted">已归档</span>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
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
        <a-button @click="createReminder(currentConversation)">生成提醒</a-button>
        <a-button type="primary" @click="saveReview">保存复核</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { conversationApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { pickQueryValue } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const conversations = ref([])
const activePatientId = ref(String(pickQueryValue(route.query.patientId)))
const reviewVisible = ref(false)
const currentConversation = reactive({})
const reviewForm = reactive({ reviewStatus: '已复核', reviewOpinion: '' })

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

const isPendingMessage = (message) => ['待人工跟进', '待处理', '未响应'].includes(message.status)

const markMessageClosed = async (message) => {
  await conversationApi.update({ ...message, status: '已闭环', handledAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  Message.success('对话已标记处理')
  await fetchConversations()
}

const createReminder = (message) => {
  router.push({
    path: '/doctor/messages',
    query: {
      action: 'create',
      patient: message.patient,
      type: '系统提醒',
      receiver: '患者 / 子女',
      title: `${message.patient}对话跟进提醒`,
      content: message.note || message.deviceText || message.patientText || '请根据对话记录完成跟进。'
    }
  })
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
  if (['已确认', '已恢复', '已处理', '已归档', '已闭环'].includes(status)) return 'green'
  if (status === '高风险') return 'red'
  if (status === '关注') return 'orange'
  if (status === '正常') return 'green'
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
