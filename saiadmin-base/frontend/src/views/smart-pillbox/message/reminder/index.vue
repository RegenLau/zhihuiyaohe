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
            <a-input v-model="searchForm.keyword" placeholder="关键词：标题或触发场景" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="5">
          <a-form-item field="type" label="消息类型">
            <a-select v-model="searchForm.type" placeholder="消息类型" allow-clear>
              <a-option value="子女提醒">子女提醒</a-option>
              <a-option value="复诊提醒">复诊提醒</a-option>
              <a-option value="系统提醒">系统提醒</a-option>
              <a-option value="缺药提醒">缺药提醒</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-form-item field="status" label="推送状态">
            <a-select v-model="searchForm.status" placeholder="推送状态" allow-clear>
              <a-option value="待推送">待推送</a-option>
              <a-option value="已推送">已推送</a-option>
              <a-option value="已取消">已取消</a-option>
              <a-option value="失败">失败</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </template>

      <template #tableBeforeButtons>
        <a-button type="primary" @click="showDialog('add')">
          <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
          创建消息
        </a-button>
      </template>

      <template #tableAfterButtons>
        <span class="smart-muted">共 {{ messages.length }} 条</span>
        <a-button :loading="loading" @click="refreshMessages">
          <template #icon><sa-icon icon="ri:refresh-line" :size="16" /></template>
          刷新
        </a-button>
      </template>

      <template #messageNo="{ record }">{{ formatMessageNo(record) }}</template>
      <template #type="{ record }"><a-tag>{{ record.type }}</a-tag></template>
      <template #receiver="{ record }">
        <a-space size="mini" wrap>
          <a-tag v-for="item in getReceiverLabels(record)" :key="item">{{ item }}</a-tag>
        </a-space>
      </template>
      <template #channel="{ record }">
        <a-space size="mini" wrap>
          <a-tag v-for="item in getChannelLabels(record)" :key="item" :color="getChannelColor(item)">{{ item }}</a-tag>
        </a-space>
      </template>
      <template #creationMode="{ record }"><a-tag>{{ getCreationMode(record) }}</a-tag></template>
      <template #status="{ record }">
        <a-space direction="vertical" :size="2" fill>
          <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          <span class="smart-muted">{{ record.createTime }}</span>
        </a-space>
      </template>
      <template #operationCell="{ record }">
        <a-space size="mini">
          <a-tooltip content="查看">
            <a-button size="mini" @click="viewMessage(record)">
              <template #icon><sa-icon icon="ri:eye-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="canChange(record)" content="编辑">
            <a-button size="mini" @click="showDialog('edit', record)">
              <template #icon><sa-icon icon="ri:edit-2-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="canChange(record)" content="推送">
            <a-button size="mini" type="primary" @click="pushMessage(record)">
              <template #icon><sa-icon icon="ri:send-plane-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip v-if="canChange(record)" content="取消">
            <a-button size="mini" status="danger" @click="cancelMessage(record)">
              <template #icon><sa-icon icon="ri:close-line" :size="14" /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
    </sa-table>

    <a-modal v-model:visible="dialogVisible" :title="dialogType === 'add' ? '创建消息' : '编辑消息'" width="min(760px, calc(100vw - 32px))" @ok="saveMessage">
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="消息类型" required>
              <a-select v-model="formData.type" placeholder="请选择消息类型">
                <a-option value="子女提醒">子女提醒</a-option>
                <a-option value="复诊提醒">复诊提醒</a-option>
                <a-option value="系统提醒">系统提醒</a-option>
                <a-option value="缺药提醒">缺药提醒</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="患者" required>
              <a-select v-model="formData.patientId" placeholder="请选择患者" allow-search @change="syncSelectedPatient">
                <a-option v-for="patient in patientOptions" :key="patient.id" :value="String(patient.id)">
                  {{ patient.name }} · {{ patient.recordNo }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="接收方" required>
              <a-checkbox-group v-model="formData.receiverTargets">
                <a-checkbox value="patient">患者本人</a-checkbox>
                <a-checkbox value="family">{{ formData.patient || '患者' }} 家属</a-checkbox>
                <a-checkbox value="doctor">医药师</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="渠道" required>
              <a-checkbox-group v-model="formData.channels">
                <a-checkbox value="药盒">药盒</a-checkbox>
                <a-checkbox value="患者端">患者端</a-checkbox>
                <a-checkbox value="家属端">家属端</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12"><a-form-item label="创建方式"><a-input model-value="后台创建" readonly /></a-form-item></a-col>
          <a-col :xs="24" :md="12"><a-form-item label="创建人"><a-input model-value="医药师" readonly /></a-form-item></a-col>
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

    <a-modal v-model:visible="viewVisible" title="消息推送详情" width="min(640px, calc(100vw - 32px))" :footer="false">
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="标题">{{ currentMessage.title }}</a-descriptions-item>
        <a-descriptions-item label="内容">{{ currentMessage.content }}</a-descriptions-item>
        <a-descriptions-item label="患者">{{ currentMessage.patient }}</a-descriptions-item>
        <a-descriptions-item label="接收方">
          <a-space size="mini" wrap><a-tag v-for="item in getReceiverLabels(currentMessage)" :key="item">{{ item }}</a-tag></a-space>
        </a-descriptions-item>
        <a-descriptions-item label="渠道">
          <a-space size="mini" wrap><a-tag v-for="item in getChannelLabels(currentMessage)" :key="item" :color="getChannelColor(item)">{{ item }}</a-tag></a-space>
        </a-descriptions-item>
        <a-descriptions-item label="触发场景">{{ currentMessage.triggerScene || currentMessage.triggerSource || '手动创建' }}</a-descriptions-item>
        <a-descriptions-item label="创建方式">{{ getCreationMode(currentMessage) }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ currentMessage.creator || (getCreationMode(currentMessage) === '系统推送' ? '系统' : '医药师') }}</a-descriptions-item>
        <a-descriptions-item label="推送状态"><a-tag :color="statusColor(currentMessage.status)">{{ currentMessage.status }}</a-tag></a-descriptions-item>
        <a-descriptions-item v-if="currentMessage.sendTime" label="推送时间">{{ currentMessage.sendTime }}</a-descriptions-item>
        <a-descriptions-item v-if="currentMessage.cancelTime" label="取消时间">{{ currentMessage.cancelTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { messageApi, patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { formatDateTime, getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const loading = ref(false)
const crudRef = ref()
const messages = ref([])
const patientOptions = ref([])
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
  operationColumnWidth: 120,
  operationColumnFixed: 'right',
  add: { show: false },
  edit: { show: false },
  delete: { show: false }
})
const columns = reactive([
  { title: '消息编号', dataIndex: 'messageNo', width: 100 },
  { title: '类型', dataIndex: 'type', width: 90 },
  { title: '患者', dataIndex: 'patient', width: 74 },
  { title: '接收方', dataIndex: 'receiver', width: 100 },
  { title: '渠道', dataIndex: 'channel', width: 108 },
  { title: '创建方式', dataIndex: 'creationMode', width: 92 },
  { title: '推送状态', dataIndex: 'status', width: 100 }
])
const formData = reactive({
  id: undefined,
  patientId: '',
  type: '子女提醒',
  patient: '',
  receiverTargets: [],
  channels: [],
  title: '',
  content: '',
  status: '待推送',
  statusType: 'warning',
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
const loadPatients = async () => {
  const response = await patientApi.list({ page: 1, limit: 100 })
  patientOptions.value = getRecords(response)
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
const formatMessageNo = (record) => `MSG-${String(record?.id || 0).padStart(3, '0')}`

const canChange = (record) => record.status === '待推送'
const getCreationMode = (record) => record.creationMode || (record.creator === '医药师' ? '后台创建' : '系统推送')
const normalizeChannelLabels = (record) => {
  const value = String(record?.channel || '')
  const receiver = String(record?.receiver || '')
  const labels = []
  const push = (label) => {
    if (!labels.includes(label)) labels.push(label)
  }
  value.split(/[、,，+]/).map((item) => item.trim()).filter(Boolean).forEach((item) => {
    if (['药盒', '患者端', '家属端', '后台'].includes(item)) push(item)
  })
  if (value.includes('药盒')) push('药盒')
  if (value.includes('后台')) push('后台')
  if (value.includes('小程序')) {
    if (receiver.includes('患者')) push('患者端')
    if (receiver.includes('子女') || receiver.includes('家属')) push('家属端')
  }
  return labels.length ? labels : ['患者端']
}
const getChannelLabels = (record) => normalizeChannelLabels(record)
const getChannelColor = (channel) => {
  const colorMap = {
    药盒: 'orange',
    患者端: 'green',
    家属端: 'purple',
    后台: 'gray'
  }
  return colorMap[channel] || 'gray'
}
const getReceiverLabels = (record) => {
  const value = String(record?.receiver || '')
  const patient = record?.patient || '患者'
  const labels = []
  const push = (label) => {
    if (!labels.includes(label)) labels.push(label)
  }
  if (value.includes('患者')) push('患者本人')
  if (value.includes('子女') || value.includes('家属')) push(`${patient} 家属`)
  if (value.includes('医药师')) push('医药师')
  return labels.length ? labels : [value || '患者本人']
}
const receiverCodesFromRecord = (record = {}) => {
  const labels = getReceiverLabels(record)
  return [
    labels.includes('患者本人') ? 'patient' : '',
    labels.includes(`${record.patient || '患者'} 家属`) ? 'family' : '',
    labels.includes('医药师') ? 'doctor' : ''
  ].filter(Boolean)
}
const receiverTextFromCodes = () => {
  return formData.receiverTargets.map((code) => {
    if (code === 'patient') return '患者本人'
    if (code === 'family') return `${formData.patient || '患者'} 家属`
    return '医药师'
  }).join('、')
}
const findPatientId = (record = {}) => {
  if (record.patientId) return String(record.patientId)
  const patient = patientOptions.value.find((item) => item.name === record.patient)
  return patient ? String(patient.id) : ''
}
const syncSelectedPatient = (patientId) => {
  const patient = patientOptions.value.find((item) => String(item.id) === String(patientId))
  formData.patient = patient?.name || ''
}

const showDialog = (type, record = {}) => {
  dialogType.value = type
  Object.assign(formData, {
    id: record.id,
    patientId: type === 'add' ? '' : findPatientId(record),
    type: record.type || '子女提醒',
    patient: record.patient || '',
    receiverTargets: type === 'add' ? [] : receiverCodesFromRecord(record),
    channels: type === 'add' ? [] : getChannelLabels(record).filter((item) => item !== '后台'),
    title: record.title || '',
    content: record.content || '',
    status: record.status || '待推送',
    statusType: record.statusType || 'warning',
    createTime: record.createTime || formatDateTime()
  })
  dialogVisible.value = true
}
const saveMessage = async () => {
  if (!formData.patientId || !formData.patient || !formData.receiverTargets.length || !formData.channels.length || !formData.title || !formData.content) {
    Message.warning('请输入患者、接收方、渠道、标题和正文')
    return false
  }
  const payload = {
    id: formData.id,
    patientId: formData.patientId,
    type: formData.type,
    patient: formData.patient,
    receiver: receiverTextFromCodes(),
    channel: formData.channels.join('、'),
    title: formData.title,
    content: formData.content,
    status: formData.status || '待推送',
    statusType: formData.statusType || 'warning',
    creationMode: '后台创建',
    creator: '医药师',
    triggerScene: '手动创建',
    createTime: formData.createTime || formatDateTime()
  }
  if (dialogType.value === 'add') await messageApi.save(payload)
  else await messageApi.update(payload)
  Message.success('消息已保存')
  refreshMessages()
  dialogVisible.value = false
}
const viewMessage = (record) => {
  Object.assign(currentMessage, record)
  viewVisible.value = true
}
const pushMessage = async (record) => {
  const response = await messageApi.update({ ...record, status: '已推送', statusType: 'success', sendTime: formatDateTime() })
  Object.assign(record, getPayload(response))
  Message.success('消息已推送')
  refreshMessages()
}
const cancelMessage = async (record) => {
  const response = await messageApi.update({ ...record, status: '已取消', statusType: 'info', cancelTime: formatDateTime() })
  Object.assign(record, getPayload(response))
  Message.success('消息已取消')
  refreshMessages()
}

onMounted(async () => {
  await loadPatients()
  refreshMessages()
})
</script>
