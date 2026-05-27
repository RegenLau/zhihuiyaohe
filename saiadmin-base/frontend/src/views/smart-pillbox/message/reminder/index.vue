<template>
  <div class="smart-page">
    <sa-table
      ref="crudRef"
      :options="tableOptions"
      :columns="columns"
      :searchForm="searchForm"
      @resetSearch="handleResetSearch">
      <template #tableSearch>
        <a-col :xs="24" :md="6">
          <a-form-item field="patient" label="患者">
            <a-input v-model="searchForm.patient" placeholder="患者或接收人" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="7">
          <a-form-item field="keyword" label="关键词">
            <a-input v-model="searchForm.keyword" placeholder="关键词：标题或规则来源" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="5">
          <a-form-item field="type" label="提醒类型">
            <a-select v-model="searchForm.type" placeholder="提醒类型" allow-clear>
              <a-option value="子女提醒">子女提醒</a-option>
              <a-option value="复诊提醒">复诊提醒</a-option>
              <a-option value="系统提醒">系统提醒</a-option>
              <a-option value="缺药提醒">缺药提醒</a-option>
              <a-option value="慢病指标异常提醒">慢病指标异常提醒</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-form-item field="status" label="发送状态">
            <a-select v-model="searchForm.status" placeholder="发送状态" allow-clear>
              <a-option value="待处理">待处理</a-option>
              <a-option value="已处理">已处理</a-option>
              <a-option value="已创建">已创建</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </template>

      <template #tableBeforeButtons>
        <a-button type="primary" @click="showDialog('add')">
          <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
          创建提醒
        </a-button>
      </template>

      <template #tableAfterButtons>
        <span class="smart-muted">共 {{ messages.length }} 条</span>
        <a-button :loading="loading" @click="refreshMessages">
          <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
          刷新
        </a-button>
      </template>

      <template #message="{ record }">
        <strong>{{ record.title }}</strong>
        <div class="smart-muted">{{ record.content }}</div>
        <div class="smart-muted">{{ record.triggerSource || '手动创建' }}</div>
      </template>
      <template #type="{ record }"><a-tag>{{ record.type }}</a-tag></template>
      <template #status="{ record }">
        <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
      </template>
      <template #operationCell="{ record }">
        <a-space size="mini">
          <a-tooltip content="查看">
            <a-button size="mini" @click="viewMessage(record)">
              <template #icon><sa-icon icon="ri:eye-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="编辑">
            <a-button size="mini" @click="showDialog('edit', record)">
              <template #icon><sa-icon icon="ri:edit-2-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="处理">
            <a-button size="mini" type="primary" @click="markHandled(record)">
              <template #icon><sa-icon icon="ri:check-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
    </sa-table>

    <a-modal v-model:visible="dialogVisible" :title="dialogType === 'add' ? '创建提醒' : '编辑提醒'" width="min(760px, calc(100vw - 32px))" @ok="saveMessage">
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="提醒类型" required>
              <a-select v-model="formData.type" placeholder="请选择提醒类型">
                <a-option value="子女提醒">子女提醒</a-option>
                <a-option value="复诊提醒">复诊提醒</a-option>
                <a-option value="系统提醒">系统提醒</a-option>
                <a-option value="缺药提醒">缺药提醒</a-option>
                <a-option value="慢病指标异常提醒">慢病指标异常提醒</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12"><a-form-item label="患者" required><a-input v-model="formData.patient" placeholder="请输入患者姓名" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="接收方" required><a-input v-model="formData.receiver" placeholder="请输入接收方" /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="渠道"><a-input v-model="formData.channel" placeholder="请输入消息渠道" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="消息标题" required><a-input v-model="formData.title" placeholder="请输入消息标题" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="消息正文" required><a-textarea v-model="formData.content" placeholder="请输入消息正文" :auto-size="{ minRows: 4, maxRows: 6 }" /></a-form-item></a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-button @click="dialogVisible = false">取消</a-button>
        <a-button type="primary" @click="saveMessage">
          <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
          保存
        </a-button>
      </template>
    </a-modal>

    <a-modal v-model:visible="viewVisible" title="提醒消息详情" width="min(640px, calc(100vw - 32px))" :footer="false">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="标题">{{ currentMessage.title }}</a-descriptions-item>
        <a-descriptions-item label="内容">{{ currentMessage.content }}</a-descriptions-item>
        <a-descriptions-item label="患者">{{ currentMessage.patient }}</a-descriptions-item>
        <a-descriptions-item label="接收方">{{ currentMessage.receiver }}</a-descriptions-item>
        <a-descriptions-item label="渠道">{{ currentMessage.channel }}</a-descriptions-item>
        <a-descriptions-item label="状态"><a-tag :color="statusColor(currentMessage.status)">{{ currentMessage.status }}</a-tag></a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { messageApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const loading = ref(false)
const crudRef = ref()
const messages = ref([])
const dialogVisible = ref(false)
const viewVisible = ref(false)
const dialogType = ref('add')
const currentMessage = reactive({})
const searchForm = reactive({
  type: String(pickQueryValue(route.query.type)),
  patient: String(pickQueryValue(route.query.patient)),
  status: String(pickQueryValue(route.query.status)),
  keyword: ''
})
const tableOptions = reactive({
  api: loadMessages,
  pageLayout: 'normal',
  showTools: true,
  showIndex: false,
  singleLine: true,
  operationColumn: true,
  operationColumnText: '操作',
  operationColumnWidth: 118,
  operationColumnFixed: false,
  add: { show: false },
  edit: { show: false },
  delete: { show: false }
})
const columns = reactive([
  { title: '消息', dataIndex: 'message', minWidth: 260 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '患者', dataIndex: 'patient', width: 100 },
  { title: '接收方', dataIndex: 'receiver', width: 120 },
  { title: '渠道', dataIndex: 'channel', width: 130 },
  { title: '状态', dataIndex: 'status', width: 92 },
  { title: '创建时间', dataIndex: 'createTime', width: 118 }
])
const formData = reactive({
  id: undefined,
  type: '子女提醒',
  patient: '',
  receiver: '',
  channel: '小程序消息中心',
  title: '',
  content: '',
  status: '已创建',
  statusType: 'success',
  createTime: '今日'
})

async function loadMessages(params = {}) {
  loading.value = true
  try {
    const response = await messageApi.list(params)
    const rows = getRecords(response)
    const payload = getPayload(response)
    messages.value = rows
    return { data: { data: rows, total: payload?.total || rows.length } }
  } finally {
    loading.value = false
  }
}
const resetSearch = () => {
  Object.assign(searchForm, { type: '', patient: '', status: '', keyword: '' })
  refreshMessages()
}
const handleResetSearch = () => {
  Object.assign(searchForm, { type: '', patient: '', status: '', keyword: '' })
}
const refreshMessages = () => {
  crudRef.value?.refresh()
}

const routeDraft = () => {
  return {
    type: String(pickQueryValue(route.query.type) || '系统提醒'),
    patient: String(pickQueryValue(route.query.patient)),
    receiver: String(pickQueryValue(route.query.receiver) || '患者 / 子女'),
    channel: String(pickQueryValue(route.query.channel) || '小程序消息中心'),
    title: String(pickQueryValue(route.query.title) || '用药风险跟进提醒'),
    content: String(pickQueryValue(route.query.content) || '请根据当前风险记录完成确认和跟进。'),
    status: '已创建',
    statusType: 'success',
    createTime: '今日'
  }
}

const showDialog = (type, record = {}) => {
  dialogType.value = type
  Object.assign(formData, {
    id: record.id,
    type: record.type || '子女提醒',
    patient: record.patient || '',
    receiver: record.receiver || '',
    channel: record.channel || '小程序消息中心',
    title: record.title || '',
    content: record.content || '',
    status: record.status || '已创建',
    statusType: record.statusType || 'success',
    createTime: record.createTime || '今日'
  })
  dialogVisible.value = true
}
const saveMessage = async () => {
  if (!formData.patient || !formData.receiver || !formData.title || !formData.content) {
    Message.warning('请输入患者、接收方、标题和正文')
    return false
  }
  const payload = {
    ...formData,
    status: formData.status || '已创建',
    statusType: formData.statusType || 'success',
    createTime: formData.createTime || '今日'
  }
  if (dialogType.value === 'add') await messageApi.save(payload)
  else await messageApi.update(payload)
  Message.success('提醒消息已保存')
  refreshMessages()
  dialogVisible.value = false
}
const viewMessage = (record) => {
  Object.assign(currentMessage, record)
  viewVisible.value = true
  Message.success(`${record.title} 已打开`)
}
const markHandled = async (record) => {
  const response = await messageApi.update({ ...record, status: '已处理', statusType: 'success' })
  Object.assign(record, getPayload(response))
  Message.success('提醒消息已处理')
  refreshMessages()
}

onMounted(() => {
  refreshMessages()
  if (pickQueryValue(route.query.action) === 'create') {
    showDialog('add', routeDraft())
  }
})
</script>
