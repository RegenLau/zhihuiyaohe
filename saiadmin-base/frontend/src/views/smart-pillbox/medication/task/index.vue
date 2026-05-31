<template>
  <div class="smart-page medication-workbench">
    <div class="official-two-column medication-layout">
      <div class="ma-content-block p-3 conversation-patient-panel medication-patient-panel">
        <a-card title="选择患者" :bordered="false">
          <a-input-search v-model="keyword" placeholder="搜索姓名、处方编号、设备号" allow-clear />
          <a-empty v-if="!patientOptions.length" class="smart-block-gap-sm" description="暂无患者" />
          <a-list v-else class="conversation-patient-list smart-block-gap-sm" :data="patientOptions" :bordered="false" :split="false" :pagination="false">
            <template #item="{ item }">
              <a-list-item class="conversation-patient-item">
                <a-card
                  class="conversation-patient-card"
                  :class="{ 'is-active': String(item.id) === String(selectedPatientId) }"
                  :bordered="true"
                  @click="selectPatient(item.id)"
                >
                  <div class="conversation-patient-top">
                    <a-space :size="6" wrap>
                      <a-typography-text bold>{{ item.name }}</a-typography-text>
                      <span class="smart-muted">{{ item.age }} 岁</span>
                    </a-space>
                    <a-tag v-if="item.deviceStatus" :color="statusColor(item.deviceStatus)">{{ item.deviceStatus }}</a-tag>
                  </div>
                  <a-space direction="vertical" :size="4" fill>
                    <span class="smart-muted">设备编号：{{ item.deviceNo || '未绑定' }}</span>
                    <span>今日药品 {{ item.todayDrugs }} 种 · 下一提醒 {{ item.nextReminder }}</span>
                  </a-space>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>

      <div class="detail-stack medication-main-panel">
        <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <a-tabs v-model:active-key="activeTab" lazy-load>
              <a-tab-pane key="today" title="今日任务">
                <div class="task-filter-panel">
                  <div class="task-filter-main">
                    <a-radio-group v-model="statusFilter" type="button">
                      <a-radio value="全部状态">全部状态</a-radio>
                      <a-radio value="待打卡">待打卡</a-radio>
                      <a-radio value="已打卡">已打卡</a-radio>
                      <a-radio value="漏服">漏服</a-radio>
                      <a-radio value="已取消">已取消</a-radio>
                    </a-radio-group>
                    <a-radio-group v-model="drugFilter" type="button" class="task-drug-filter">
                      <a-radio v-for="option in drugFilterOptions" :key="option" :value="option">{{ option }}</a-radio>
                    </a-radio-group>
                  </div>
                  <div class="task-filter-side">
                    <a-date-picker v-model="taskDate" class="task-filter-date" />
                    <span class="smart-muted">本页只处理当天执行调整</span>
                  </div>
                </div>

                <a-spin :loading="taskLoading" class="task-spin">
                  <a-empty v-if="!displayedTasks.length" class="smart-block-gap" description="暂无今日任务" />
                  <div v-else class="task-timeline smart-block-gap-sm">
                    <div v-for="record in displayedTasks" :key="record.id" class="task-timeline-item">
                      <div class="task-time-node">
                        <div class="task-time">{{ record.time }}</div>
                        <div class="smart-muted">{{ record.period }}</div>
                      </div>
                      <div class="task-card">
                        <div class="task-card-body">
                          <div class="task-card-main">
                            <div class="task-card-title">
                              <a-typography-text bold class="task-drug-name">{{ record.drug }}</a-typography-text>
                              <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
                            </div>
                            <div class="task-meta-grid">
                              <div>
                                <span class="smart-muted">本次剂量</span>
                                <strong>{{ record.dose }}</strong>
                              </div>
                              <div>
                                <span class="smart-muted">频次</span>
                                <strong>{{ record.frequency }}</strong>
                              </div>
                              <div>
                                <span class="smart-muted">打卡方式</span>
                                <strong>{{ getCheckinMethod(record) }}</strong>
                              </div>
                            </div>
                          </div>
                          <div class="task-card-side">
                            <a-space class="task-card-actions" size="mini">
                              <template v-if="canAdjustTask(record)">
                                <a-button size="mini" type="primary" class="task-action-button" @click="openTaskAdjust('dose', record)">调整剂量</a-button>
                                <a-button size="mini" class="task-action-button" @click="openTaskAdjust('time', record)">调整时间</a-button>
                              </template>
                              <a-button v-else size="mini" class="task-action-button" disabled>查看</a-button>
                            </a-space>
                            <span class="task-execute-wrap">
                              <a-switch
                                class="task-execute-switch"
                                :model-value="isTaskEnabled(record)"
                                :disabled="!canToggleTask(record)"
                                checked-text="执行"
                                unchecked-text="取消"
                                @change="(checked) => toggleTaskEnabled(record, checked)"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-spin>
              </a-tab-pane>

              <a-tab-pane key="plan" title="用药计划">
                <div class="smart-row is-between">
                  <div>
                    <h3 class="scheme-title">{{ currentPatient.name }} · 用药计划</h3>
                    <p class="smart-section-note">维护长期方案，计划变更只影响后续任务。</p>
                  </div>
                  <a-space wrap>
                    <a-button type="primary" @click="openCreatePlan">
                      <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                      创建计划
                    </a-button>
                    <a-button @click="openRoutineDialog">
                      <template #icon><sa-icon icon="ri:time-line" :size="16" /></template>
                      调整作息
                    </a-button>
                  </a-space>
                </div>

                <a-empty v-if="!plans.length" class="smart-block-gap" description="当前患者暂无用药计划">
                  <a-button type="primary" @click="openCreatePlan">创建计划</a-button>
                </a-empty>

                <div v-else class="plan-card-grid smart-block-gap-sm">
                  <a-card v-for="plan in plans" :key="plan.id" class="plan-card" :bordered="true" hoverable @click="openPlanDetail(plan)">
                    <div class="plan-card-head">
                      <a-typography-text bold>{{ plan.title }}</a-typography-text>
                      <a-space size="mini" wrap>
                        <a-tag :color="statusColor(plan.status)">{{ plan.status }}</a-tag>
                        <a-tag>{{ plan.dispatchStatus }}</a-tag>
                      </a-space>
                    </div>
                    <div class="plan-card-meta">
                      <div>
                        <span class="smart-muted">计划周期</span>
                        <strong>{{ plan.period }}</strong>
                      </div>
                      <div>
                        <span class="smart-muted">药品数量</span>
                        <strong>{{ plan.drugs?.length || 0 }} 种</strong>
                      </div>
                      <div>
                        <span class="smart-muted">提醒次数</span>
                        <strong>{{ getPlanReminderCount(plan) }} 个</strong>
                      </div>
                    </div>
                    <div class="plan-card-foot">
                      <span class="smart-muted">{{ plan.generatedTasks }}</span>
                      <a-space size="mini" @click.stop>
                        <a-button size="mini" type="primary" @click="openPlanDetail(plan)">查看详情</a-button>
                        <a-button size="mini" :disabled="!plan.drugs?.length || plan.status === '已停用'" @click="dispatchPlan(plan)">下发药盒</a-button>
                      </a-space>
                    </div>
                  </a-card>
                </div>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </div>
      </div>
    </div>

    <a-drawer v-model:visible="planDetailVisible" :title="currentPlan?.title || '用药计划详情'" width="min(860px, calc(100vw - 32px))" :footer="false" unmount-on-close>
      <template v-if="currentPlan">
        <div class="plan-drug-header">
          <div>
            <span>药品明细</span>
            <div class="smart-muted">长期方案调整后只影响后续任务</div>
          </div>
          <a-space wrap>
            <a-button type="primary" @click="openDrugDialog(currentPlan)">
              <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
              新增药品
            </a-button>
            <a-button :disabled="!currentPlan.drugs?.length || currentPlan.status === '已停用'" @click="dispatchPlan(currentPlan)">
              <template #icon><sa-icon icon="ri:send-plane-line" :size="16" /></template>
              下发药盒
            </a-button>
            <a-popconfirm content="确定停用该计划吗？" @ok="stopPlan(currentPlan)">
              <a-button status="danger" :disabled="currentPlan.status === '已停用'">
                <template #icon><sa-icon icon="ri:pause-circle-line" :size="16" /></template>
                停用
              </a-button>
            </a-popconfirm>
          </a-space>
        </div>
        <a-table row-key="name" :data="currentPlan.drugs || []" :pagination="false" class="smart-block-gap-sm plan-drug-table" table-layout-fixed>
          <template #columns>
            <a-table-column title="药品" data-index="name">
              <template #cell="{ record }">
                {{ record.name }}
                <div v-if="drugMetaText(record)" class="smart-muted">{{ drugMetaText(record) }}</div>
              </template>
            </a-table-column>
            <a-table-column title="用法用量" :width="150">
              <template #cell="{ record }">{{ record.dose }} {{ record.frequency }}</template>
            </a-table-column>
            <a-table-column title="提醒时间" :width="190">
              <template #cell="{ record }">
                <a-space wrap size="mini">
                  <a-tag v-for="node in getDrugReminderLabels(record)" :key="node" color="arcoblue">{{ node }}</a-tag>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="88">
              <template #cell="{ record, rowIndex }">
                <a-button size="mini" type="primary" @click="openDrugDialog(currentPlan, record, rowIndex)">编辑</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </template>
    </a-drawer>

    <a-modal v-model:visible="planVisible" title="创建用药计划" width="min(760px, calc(100vw - 32px))" @ok="saveCreatePlan">
      <a-form :model="planForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12"><a-form-item label="计划名称"><a-input v-model="planForm.title" placeholder="请输入计划名称" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="计划状态">
              <a-select v-model="planForm.status">
                <a-option value="已生效">已生效</a-option>
                <a-option value="草稿">草稿</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="开始日期"><a-date-picker v-model="planForm.startDate" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="结束日期"><a-date-picker v-model="planForm.endDate" style="width: 100%" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="drugVisible" :title="drugDialogMode === 'add' ? '新增药品' : '编辑药品'" width="min(760px, calc(100vw - 32px))" @ok="saveDrugEdit">
      <a-form :model="drugForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12"><a-form-item label="药品名称"><a-input v-model="drugForm.name" placeholder="请输入药品名称" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="规格 / 剩余量"><a-input v-model="drugForm.quantity" placeholder="如 18片" /></a-form-item></a-col>
          <a-col :xs="24" :sm="8"><a-form-item label="单次剂量"><a-input v-model="drugForm.dose" placeholder="如 1片/次" /></a-form-item></a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="频次">
              <a-select v-model="drugForm.frequency">
                <a-option value="每日1次">每日1次</a-option>
                <a-option value="每日2次">每日2次</a-option>
                <a-option value="每日3次">每日3次</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8"><a-form-item label="疗程"><a-input-number v-model="drugForm.durationDays" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="服药时段"><a-input v-model="drugForm.time" placeholder="早餐后/晚餐时/睡前" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="提醒时间"><a-input v-model="drugForm.reminderTime" placeholder="如 07:30" /></a-form-item></a-col>
          <a-col :xs="24"><a-form-item label="用药说明"><a-textarea v-model="drugForm.guide" placeholder="请输入服药说明" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="routineVisible" title="调整作息时间" width="min(640px, calc(100vw - 32px))" @ok="saveRoutine">
      <a-form :model="routineForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12"><a-form-item label="早餐时间"><a-time-picker v-model="routineForm.breakfastTime" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="午餐时间"><a-time-picker v-model="routineForm.lunchTime" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="晚餐时间"><a-time-picker v-model="routineForm.dinnerTime" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="睡眠时间"><a-time-picker v-model="routineForm.sleepTime" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="taskAdjustVisible" :title="taskAdjustTitle" width="min(520px, calc(100vw - 32px))" @ok="saveTaskAdjust">
      <a-form :model="taskAdjustForm" layout="vertical">
        <a-form-item label="药品"><a-input :model-value="editingTask?.drug || '-'" readonly /></a-form-item>
        <a-form-item v-if="taskAdjustType === 'dose'" label="本次剂量">
          <a-input v-model="taskAdjustForm.dose" placeholder="如 1片/次" />
        </a-form-item>
        <a-form-item v-if="taskAdjustType === 'time'" label="提醒时间">
          <a-time-picker v-model="taskAdjustForm.time" format="HH:mm" style="width: 100%" />
        </a-form-item>
        <a-alert type="info">本次调整只影响今天这一条任务，不修改长期用药计划。</a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { deviceApi, patientApi, planApi, taskApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { formatDateTime, getPayload, getRecords, pickQueryValue, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()

const keyword = ref('')
const selectedPatientId = ref(pickQueryValue(route.query.patientId) || 1)
const getRouteTab = () => (route.path === '/doctor/plans' || pickQueryValue(route.query.tab) === 'plan' || pickQueryValue(route.query.action) ? 'plan' : 'today')
const activeTab = ref(getRouteTab())
const activePlanId = ref('')
const drugFilter = ref('全部用药')
const statusFilter = ref('全部状态')
const taskDate = ref('2026-05-21')
const patients = ref([])
const taskRecords = ref([])
const plans = ref([])
const taskLoading = ref(false)
const planLoading = ref(false)
const planVisible = ref(false)
const drugVisible = ref(false)
const routineVisible = ref(false)
const planDetailVisible = ref(false)
const taskAdjustVisible = ref(false)
const taskAdjustType = ref('dose')
const drugDialogMode = ref('add')
const editingPlan = ref(null)
const editingDrugIndex = ref(-1)
const editingTask = ref(null)

const emptyPatient = { id: 0, name: '-', age: '-', deviceStatus: '未绑定', todayDrugs: 0, nextReminder: '-', taskRisk: '-' }
const planForm = reactive({
  title: '日常用药计划',
  status: '已生效',
  startDate: '2026-05-20',
  endDate: '2026-06-18'
})
const drugForm = reactive({
  name: '',
  quantity: '',
  dose: '1片/次',
  frequency: '每日1次',
  durationDays: 30,
  time: '早餐后',
  reminderTime: '',
  guide: '按处方执行'
})
const routineForm = reactive({
  breakfastTime: '',
  lunchTime: '',
  dinnerTime: '',
  sleepTime: ''
})
const taskAdjustForm = reactive({
  dose: '',
  time: ''
})
const timeTextMap = {
  早餐前: '06:30',
  早餐时: '07:00',
  早餐后: '07:30',
  午餐前: '11:30',
  午餐时: '12:00',
  午餐后: '12:30',
  晚餐前: '17:30',
  晚餐时: '18:00',
  晚餐后: '18:30',
  睡前: '21:30'
}

const patientOptions = computed(() => {
  const value = keyword.value.trim()
  if (!value) return patients.value
  return patients.value.filter((patient) => [patient.name, patient.recordNo, patient.deviceNo].some((item) => String(item || '').includes(value)))
})
const currentPatient = computed(() => patients.value.find((item) => String(item.id) === String(selectedPatientId.value)) || patients.value[0] || emptyPatient)
const currentPlan = computed(() => plans.value.find((plan) => String(plan.id) === String(activePlanId.value)) || null)
const taskAdjustTitle = computed(() => (taskAdjustType.value === 'dose' ? '调整本次剂量' : '调整提醒时间'))
const displayedTasks = computed(() => {
  let records = taskRecords.value
  if (drugFilter.value !== '全部用药') records = records.filter((item) => item.drug === drugFilter.value)
  return [...records].sort((prev, next) => String(prev.time || '').localeCompare(String(next.time || '')))
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

const loadPlans = async () => {
  if (!selectedPatientId.value) return
  planLoading.value = true
  try {
    const response = await planApi.list({ patientId: selectedPatientId.value, page: 1, limit: 100 })
    plans.value = getRecords(response)
    activePlanId.value = plans.value.some((plan) => String(plan.id) === String(activePlanId.value)) ? activePlanId.value : String(plans.value[0]?.id || '')
  } finally {
    planLoading.value = false
  }
}

const selectPatient = (id) => {
  selectedPatientId.value = id
}

const openPlanDetail = (plan) => {
  activePlanId.value = String(plan.id)
  planDetailVisible.value = true
}

const getDrugReminderLabels = (drug) => {
  return String(drug.time || '')
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `${item} ${drug.reminderTime || timeTextMap[item] || ''}`.trim())
}
const getPlanReminderCount = (plan) => plan.reminderCount || (plan.drugs || []).reduce((total, drug) => total + getDrugReminderLabels(drug).length, 0)
const drugMetaText = (drug) => [drug.specification, drug.quantity].filter(Boolean).join(' · ')
const canAdjustTask = (task) => task.status === '待打卡'
const isTaskEnabled = (task) => task.status !== '已取消'
const canToggleTask = (task) => ['待打卡', '已取消'].includes(task.status)
const getCheckinMethod = (task) => task.checkinMethod || task.source || '未打卡'

const openCreatePlan = () => {
  Object.assign(planForm, {
    title: '日常用药计划',
    status: '已生效',
    startDate: '2026-05-20',
    endDate: '2026-06-18'
  })
  planVisible.value = true
}

const saveCreatePlan = async () => {
  if (!planForm.title || !selectedPatientId.value) {
    Message.warning('请先选择患者并填写计划名称')
    return false
  }
  const response = await planApi.save({
    ...planForm,
    patientId: selectedPatientId.value,
    patientName: currentPatient.value.name,
    period: `${planForm.startDate || '-'} 至 ${planForm.endDate || '-'}`,
    dispatchStatus: currentPatient.value.deviceNo && currentPatient.value.deviceNo !== '未绑定' ? '待下发' : '未绑定设备',
    generatedTasks: '待录入药品',
    source: '手动录入',
    reminderCount: 0,
    auditSummary: '请按处方和医药师建议执行。',
    drugs: []
  })
  Message.success('用药计划已创建')
  planVisible.value = false
  await loadPlans()
  activePlanId.value = String(getPayload(response).id || activePlanId.value)
}

const openDrugDialog = (plan, drug = null, index = -1) => {
  editingPlan.value = plan
  editingDrugIndex.value = index
  drugDialogMode.value = drug ? 'edit' : 'add'
  Object.assign(drugForm, {
    name: drug?.name || '',
    quantity: drug?.quantity || '',
    dose: drug?.dose || '1片/次',
    frequency: drug?.frequency || '每日1次',
    durationDays: drug?.durationDays || 30,
    time: drug?.time || '早餐后',
    reminderTime: drug?.reminderTime || '',
    guide: drug?.guide || '按处方执行'
  })
  drugVisible.value = true
}

const saveDrugEdit = async () => {
  if (!editingPlan.value || !drugForm.name || !drugForm.dose || !drugForm.time) {
    Message.warning('请补齐药品名称、剂量和服药时段')
    return false
  }
  const nextPlan = { ...editingPlan.value, drugs: [...(editingPlan.value.drugs || [])] }
  if (drugDialogMode.value === 'edit' && editingDrugIndex.value >= 0) nextPlan.drugs[editingDrugIndex.value] = { ...drugForm }
  else nextPlan.drugs.push({ ...drugForm })
  nextPlan.reminderCount = nextPlan.drugs.reduce((total, drug) => total + getDrugReminderLabels(drug).length, 0)
  nextPlan.generatedTasks = `${nextPlan.reminderCount} 条任务待生成`
  await planApi.update(nextPlan)
  Message.success(drugDialogMode.value === 'add' ? '药品已添加' : '药品已更新')
  drugVisible.value = false
  await loadPlans()
}

const dispatchPlan = async (plan) => {
  if (!currentPatient.value.deviceNo || currentPatient.value.deviceNo === '未绑定') {
    Message.warning('当前患者未绑定药盒')
    return
  }
  if (currentPatient.value.deviceStatus !== '在线') {
    Message.warning('当前药盒不在线，请恢复在线后再下发')
    return
  }
  const reminderCount = getPlanReminderCount(plan)
  await planApi.update({
    ...plan,
    dispatchStatus: '已下发药盒',
    generatedTasks: `${reminderCount} 条任务已生成`,
    reminderCount,
    updatedAt: formatDateTime()
  })
  const deviceResponse = await deviceApi.list({ sn: currentPatient.value.deviceNo, limit: 20 })
  const device = getRecords(deviceResponse).find((item) => item.sn === currentPatient.value.deviceNo)
  if (device) await deviceApi.update({ ...device, dispatchStatus: '计划已同步', lastDispatchAt: formatDateTime() })
  Message.success('计划已下发药盒')
  await loadPlans()
}

const stopPlan = async (plan) => {
  await planApi.update({ ...plan, status: '已停用', dispatchStatus: '已停用', stoppedAt: formatDateTime(), stopReason: '医药师手动停用' })
  Message.success('用药计划已停用')
  await loadPlans()
}

const openRoutineDialog = () => {
  Object.assign(routineForm, {
    breakfastTime: currentPatient.value?.breakfastTime || '',
    lunchTime: currentPatient.value?.lunchTime || '',
    dinnerTime: currentPatient.value?.dinnerTime || '',
    sleepTime: currentPatient.value?.sleepTime || ''
  })
  routineVisible.value = true
}

const saveRoutine = async () => {
  if (!currentPatient.value.id) return
  const response = await patientApi.update({ ...currentPatient.value, ...routineForm, updatedAt: formatDateTime() })
  const updated = getPayload(response)
  const index = patients.value.findIndex((patient) => String(patient.id) === String(updated.id))
  if (index >= 0) patients.value[index] = { ...patients.value[index], ...updated }
  routineVisible.value = false
  Message.success('作息时间已保存')
}

const openTaskAdjust = (type, task) => {
  taskAdjustType.value = type
  editingTask.value = task
  Object.assign(taskAdjustForm, {
    dose: task.dose || '',
    time: task.time || ''
  })
  taskAdjustVisible.value = true
}
const saveTaskAdjust = async () => {
  if (!editingTask.value) return
  const payload = {
    ...editingTask.value,
    adjustedAt: formatDateTime(),
    adjustSource: '后台调整'
  }
  if (taskAdjustType.value === 'dose') {
    if (!taskAdjustForm.dose) {
      Message.warning('请输入本次剂量')
      return false
    }
    payload.dose = taskAdjustForm.dose
  } else {
    if (!taskAdjustForm.time) {
      Message.warning('请选择提醒时间')
      return false
    }
    payload.time = taskAdjustForm.time
  }
  await taskApi.update(payload)
  Message.success(taskAdjustType.value === 'dose' ? '本次剂量已调整' : '提醒时间已调整')
  taskAdjustVisible.value = false
  await loadTasks()
}
const toggleTaskEnabled = async (task, checked) => {
  if (!canToggleTask(task)) return
  await taskApi.update({
    ...task,
    status: checked ? '待打卡' : '已取消',
    statusType: checked ? 'warning' : 'info',
    checkinMethod: '未打卡',
    source: '未打卡',
    toggledAt: formatDateTime()
  })
  Message.success(checked ? '本次任务已恢复执行' : '本次任务已取消')
  await loadTasks()
}

watch([selectedPatientId, statusFilter, taskDate], async () => {
  drugFilter.value = '全部用药'
  await Promise.all([loadTasks(), loadPlans()])
})

watch(
  () => [route.path, route.query.patientId, route.query.tab, route.query.action],
  () => {
    const patientId = pickQueryValue(route.query.patientId)
    if (patientId && String(patientId) !== String(selectedPatientId.value)) selectedPatientId.value = patientId
    activeTab.value = getRouteTab()
  },
  { immediate: true }
)

onMounted(async () => {
  await loadPatients()
  await Promise.all([loadTasks(), loadPlans()])
  if (pickQueryValue(route.query.action) === 'create' && selectedPatientId.value) {
    activeTab.value = 'plan'
    openCreatePlan()
  }
})
</script>

<style scoped>
.medication-workbench {
  height: calc(100vh - 116px);
  min-height: 0;
  overflow: hidden;
}

.medication-layout {
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  align-items: stretch;
}

.medication-patient-panel,
.medication-main-panel {
  min-height: 0;
  overflow: hidden;
}

.medication-patient-panel :deep(.arco-card),
.medication-patient-panel :deep(.arco-card-body) {
  height: 100%;
  min-height: 0;
}

.medication-patient-panel :deep(.arco-card-body) {
  display: flex;
  flex-direction: column;
}

.medication-patient-panel :deep(.conversation-patient-list) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.medication-patient-panel :deep(.conversation-patient-list .arco-list-spin) {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.medication-main-panel {
  align-content: start;
  overflow-y: auto;
  padding-right: 4px;
}

.task-filter-date {
  width: 180px;
  height: 32px;
  flex: 0 0 auto;
}

:deep(.task-filter-date.arco-picker) {
  width: 180px;
  height: 32px;
  flex: 0 0 auto;
}

.task-filter-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 16px;
  align-items: start;
  padding-top: 8px;
}

.task-filter-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.task-filter-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.task-timeline {
  position: relative;
  width: 100%;
}

.task-spin,
.task-spin :deep(.arco-spin-children) {
  display: block;
  width: 100%;
}

.task-timeline::before {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 76px;
  width: 1px;
  background: var(--color-border-2);
  content: '';
}

.task-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  width: 100%;
}

.task-timeline-item + .task-timeline-item {
  margin-top: 14px;
}

.task-time-node {
  position: relative;
  padding-top: 16px;
  text-align: right;
}

.task-time-node::after {
  position: absolute;
  top: 25px;
  right: -17px;
  width: 9px;
  height: 9px;
  background: rgb(var(--primary-6));
  border: 2px solid var(--color-bg-2);
  border-radius: 50%;
  content: '';
}

.task-time {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.task-card {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-bg-2);
}

.task-card-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
  align-items: stretch;
  padding: 16px 18px;
}

.task-card-main {
  min-width: 0;
}

.task-card-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-card-title {
  justify-content: flex-start;
  margin-bottom: 12px;
}

.task-drug-name {
  min-width: 0;
}

.task-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.task-meta-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.task-meta-grid strong {
  font-weight: 500;
}

.task-card-side {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  padding-left: 18px;
  border-left: 1px solid var(--color-border-2);
}

.task-card-actions {
  flex: 0 1 auto;
  white-space: nowrap;
}

.task-action-button {
  min-width: 72px;
}

.task-execute-wrap {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.task-execute-wrap::before {
  display: inline-block;
  width: 1px;
  height: 24px;
  margin-right: 10px;
  background: var(--color-border-3);
  content: '';
}

.task-execute-switch {
  flex: 0 0 auto;
}

@media (max-width: 1280px) {
  .task-filter-panel {
    grid-template-columns: 1fr;
  }

  .task-filter-side {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .task-card-body {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .task-card-side {
    flex-direction: row;
    align-items: center;
    padding-top: 12px;
    padding-left: 0;
    border-top: 1px solid var(--color-border-2);
    border-left: 0;
  }

  .task-card-actions {
    width: auto;
  }

}

.plan-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.plan-card {
  cursor: pointer;
}

.plan-card-head,
.plan-card-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.plan-card-head {
  margin-bottom: 14px;
}

.plan-card-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.plan-card-meta > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.plan-card-meta strong {
  font-weight: 500;
}

.plan-card-foot {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-2);
}

.plan-drug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-weight: 500;
}

.plan-drug-table :deep(.arco-table-cell) {
  padding-top: 12px;
  padding-bottom: 12px;
}

@media (max-width: 1280px) {
}

@media (max-width: 1024px) {
  .medication-layout {
    grid-template-columns: 1fr;
  }

  .task-timeline::before,
  .task-time-node::after {
    display: none;
  }

  .task-filter-panel,
  .task-timeline-item,
  .task-card-body {
    grid-template-columns: 1fr;
  }

  .task-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-timeline-item {
    gap: 8px;
  }

  .task-time-node {
    padding-top: 0;
    text-align: left;
  }

  .task-card-side {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 0;
  }

  .task-filter-side {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-card-actions {
    justify-content: flex-start;
  }
}
</style>
