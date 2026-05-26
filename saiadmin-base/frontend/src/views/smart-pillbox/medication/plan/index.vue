<template>
  <div class="smart-page">
    <div class="plan-board">
      <a-card title="选择患者" class="smart-panel" :bordered="false">
        <a-input v-model="patientKeyword" placeholder="搜索姓名、处方编号、设备号" allow-clear />
        <div class="smart-side-list" style="margin-top: 12px">
          <div
            v-for="patient in filteredPatients"
            :key="patient.id"
            class="smart-side-item"
            :class="{ 'is-active': Number(activePatientId) === Number(patient.id) }"
            @click="selectPatient(patient.id)"
          >
            <div class="smart-row" style="justify-content: space-between">
              <strong>{{ patient.name }}</strong>
              <a-tag :color="patient.deviceStatus === '在线' ? 'green' : 'orange'">{{ patient.deviceStatus }}</a-tag>
            </div>
            <div class="smart-muted" style="margin-top: 8px">
              {{ patient.gender }} · {{ patient.age }}岁 · {{ patient.recordNo }}
            </div>
            <div class="smart-row" style="margin-top: 8px">
              <a-tag>今日药品 {{ patient.todayDrugs || 0 }} 种</a-tag>
              <a-tag>下一提醒 {{ patient.nextReminder || '-' }}</a-tag>
            </div>
          </div>
        </div>
      </a-card>

      <a-card class="scheme-panel" :bordered="false">
        <section class="timeline-drug-panel">
          <div class="panel-header">
            <div>
              <strong>时间线</strong>
              <div class="smart-section-note">{{ activePatient?.name || '当前患者' }}的全天用药安排</div>
            </div>
            <a-space wrap class="plan-content-actions">
              <a-button :disabled="!activePatientId" @click="router.push(`/doctor/patient-detail?patientId=${activePatientId}`)">
                <template #icon><sa-icon icon="ri:eye-line" :size="16" /></template>
                查看患者档案
              </a-button>
              <a-button v-if="plans.length" type="primary" @click="openCreatePlan">
                <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                创建用药计划
              </a-button>
              <a-button @click="openRoutineDialog">
                <template #icon><sa-icon icon="ri:time-line" :size="16" /></template>
                调整作息
              </a-button>
            </a-space>
          </div>
          <div v-if="timelineItems.length" class="timeline-drug-list smart-block-gap">
            <div v-for="item in timelineItems" :key="item.key" class="timeline-drug-item">
              <div class="task-time">{{ item.clock }}</div>
              <div>
                <strong>{{ item.time }}</strong>
                <div class="smart-muted">{{ item.drug.name }} · {{ item.drug.dose }} · {{ item.drug.frequency }}</div>
              </div>
              <a-tag>{{ item.plan.title }}</a-tag>
            </div>
          </div>
          <div v-else class="plan-empty-state">
            <span class="plan-empty-icon"><sa-icon icon="ri:medicine-bottle-line" :size="34" /></span>
            <strong>当前患者暂无用药计划</strong>
            <span>请先确认患者信息，再创建用药计划。</span>
            <a-button type="primary" @click="openCreatePlan">
              <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
              创建用药计划
            </a-button>
          </div>
        </section>

        <a-tabs v-if="plans.length" v-model:active-key="activePlanId">
          <a-tab-pane v-for="plan in plans" :key="String(plan.id)" :title="plan.title">
            <div class="scheme-header">
              <div>
                <div class="scheme-title-line">
                  <sa-icon icon="ri:shield-check-line" :size="20" />
                  <h3 class="scheme-title">{{ plan.title }}</h3>
                </div>
                <div class="scheme-meta-line">
                  <span>日期 {{ plan.period }}</span>
                  <span>药品数量 {{ plan.drugs?.length || 0 }} 种</span>
                  <span>提醒节点 {{ getPlanReminderCount(plan) }} 个</span>
                </div>
              </div>
              <a-space wrap>
                <a-button type="primary" @click="openDrugDialog(plan)">
                  <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                  新增药品
                </a-button>
                <a-button :disabled="!plan.drugs?.length || plan.status === '已停用'" @click="dispatchPlan(plan)">
                  <template #icon><sa-icon icon="ri:send-plane-line" :size="16" /></template>
                  下发药盒
                </a-button>
                <a-popconfirm content="确定停用该计划吗？" @ok="stopPlan(plan)">
                  <a-button status="danger">
                    <template #icon><sa-icon icon="ri:pause-circle-line" :size="16" /></template>
                    停用计划
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>

            <div class="smart-row scheme-status-row">
              <a-tag color="green">{{ plan.status }}</a-tag>
              <a-tag color="arcoblue">{{ plan.dispatchStatus }}</a-tag>
              <a-tag color="arcoblue">{{ plan.generatedTasks }}</a-tag>
              <a-tag>{{ plan.auditSummary || '无审核提示' }}</a-tag>
            </div>

            <div class="medicine-card-list">
              <div v-for="(drug, index) in plan.drugs" :key="`${drug.name}-${index}`" class="medicine-card">
                <div>
                  <div class="medicine-name">{{ drug.name }}</div>
                  <div>{{ drug.specification }} · {{ drug.quantity }}</div>
                </div>
                <div>
                  <div class="medicine-label">提醒节点</div>
                  <a-space wrap>
                    <a-tag v-for="node in getDrugReminderLabels(drug)" :key="node" color="arcoblue">{{ node }}</a-tag>
                  </a-space>
                </div>
                <div>
                  <div class="medicine-label">用法用量</div>
                  <div class="medicine-value">{{ drug.dose }} {{ drug.frequency }}</div>
                </div>
                <div>
                  <div class="medicine-label">用药天数</div>
                  <div class="medicine-value">{{ drug.durationDays }}天</div>
                </div>
                <a-button class="medicine-edit-button" type="primary" @click="openDrugDialog(plan, drug, index)">
                  <template #icon><sa-icon icon="ri:edit-2-line" :size="16" /></template>
                  编辑
                </a-button>
              </div>
              <a-empty v-if="!plan.drugs?.length" description="当前方案暂无药品">
                <a-button type="primary" @click="openDrugDialog(plan)">添加药品</a-button>
              </a-empty>
            </div>
            <a-alert v-if="plan.status === '已停用'" style="margin-top: 16px" type="warning">
              停用时间：{{ plan.stoppedAt || '-' }}，原因：{{ plan.stopReason || '医药师手动停用' }}
            </a-alert>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>

    <a-modal v-model:visible="planVisible" title="创建用药计划" width="min(960px, calc(100vw - 32px))" @ok="saveCreatePlan">
      <a-form :model="planForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12">
            <a-form-item label="计划名称"><a-input v-model="planForm.title" placeholder="请输入计划名称" /></a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="计划来源">
              <a-select v-model="planForm.source" placeholder="请选择计划来源">
                <a-option value="门诊处方">门诊处方</a-option>
                <a-option value="社区复诊处方">社区复诊处方</a-option>
                <a-option value="复诊调整">复诊调整</a-option>
                <a-option value="手动录入">手动录入</a-option>
                <a-option value="截图">截图</a-option>
                <a-option value="纸质处方照片">纸质处方照片</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="计划状态"><a-select v-model="planForm.status" placeholder="请选择计划状态"><a-option value="已生效">已生效</a-option><a-option value="草稿">草稿</a-option></a-select></a-form-item></a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="开始日期"><a-date-picker v-model="planForm.startDate" placeholder="请选择开始日期" style="width: 100%" /></a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="结束日期"><a-date-picker v-model="planForm.endDate" placeholder="可留空" style="width: 100%" /></a-form-item>
          </a-col>
          <a-col :xs="24"><a-alert type="info">同一患者已生效计划中，药品名称和服药时段不能重复</a-alert></a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="drugVisible"
      :title="drugDialogMode === 'add' ? '新增药品与提醒' : '修改用药与提醒'"
      width="min(960px, calc(100vw - 32px))"
      @ok="saveDrugEdit"
    >
      <a-form :model="drugForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12"><a-form-item label="药品名称"><a-input v-model="drugForm.name" placeholder="请输入药品名称" /></a-form-item></a-col>
          <a-col :xs="24" :sm="6"><a-form-item label="规格"><a-input v-model="drugForm.specification" placeholder="如 500mg" /></a-form-item></a-col>
          <a-col :xs="24" :sm="6"><a-form-item label="剩余药品量"><a-input v-model="drugForm.quantity" placeholder="如 18片" /></a-form-item></a-col>
          <a-col :xs="24" :sm="8"><a-form-item label="单次剂量"><a-input v-model="drugForm.dose" placeholder="如 1片/次" /></a-form-item></a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="频次 / 每日次数">
              <a-select v-model="drugForm.frequency">
                <a-option value="每日1次">每日1次</a-option>
                <a-option value="每日2次">每日2次</a-option>
                <a-option value="每日3次">每日3次</a-option>
                <a-option value="每日4次">每日4次</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8"><a-form-item label="疗程"><a-input-number v-model="drugForm.durationDays" style="width: 100%" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="服药时段"><a-input v-model="drugForm.time" placeholder="早餐前/晚餐时/睡前" /></a-form-item></a-col>
          <a-col :xs="24" :sm="12"><a-form-item label="每次提醒时间"><a-input v-model="drugForm.reminderTime" placeholder="提醒时间，如 07:00/18:00" /></a-form-item></a-col>
          <a-col :xs="24"><a-form-item label="用药说明"><a-textarea v-model="drugForm.guide" placeholder="请输入服药说明和注意事项，默认按处方执行或按医嘱" /></a-form-item></a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-button v-if="drugDialogMode === 'edit'" status="danger" @click="removeCurrentDrug">停用药品 / 删除</a-button>
        <a-button @click="drugVisible = false">取消</a-button>
        <a-button type="primary" @click="saveDrugEdit">保存用药与提醒</a-button>
      </template>
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
      <template #footer>
        <a-button @click="routineVisible = false">取消</a-button>
        <a-button type="primary" @click="saveRoutine">保存作息</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { deviceApi, patientApi, planApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { formatDateTime, getPayload, getRecords, pickQueryValue } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()

const patients = ref([])
const plans = ref([])
const patientKeyword = ref('')
const activePatientId = ref(String(pickQueryValue(route.query.patientId)))
const activePlanId = ref('')
const planVisible = ref(false)
const drugVisible = ref(false)
const drugDialogMode = ref('add')
const editingPlan = ref(null)
const editingDrugIndex = ref(-1)
const routineVisible = ref(false)

const planForm = reactive({
  title: '日常用药计划',
  source: '社区复诊处方',
  status: '已生效',
  startDate: '2026-05-20',
  endDate: '2026-06-18'
})

const drugForm = reactive({
  name: '',
  specification: '',
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

const filteredPatients = computed(() => {
  const keyword = patientKeyword.value.trim()
  if (!keyword) return patients.value
  return patients.value.filter((patient) => {
    return [patient.name, patient.recordNo, patient.deviceNo].some((value) => String(value || '').includes(keyword))
  })
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

const activePatient = computed(() => patients.value.find((item) => String(item.id) === String(activePatientId.value)) || null)

const timelineItems = computed(() => {
  return plans.value
    .filter((plan) => plan.status !== '已停用')
    .flatMap((plan) =>
      (plan.drugs || []).flatMap((drug, index) =>
        getDrugReminderLabels(drug).map((label) => {
          const [time, clock = ''] = label.split(' ')
          return {
            key: `${plan.id}-${drug.name}-${index}-${label}`,
            plan,
            drug,
            time,
            clock: clock || timeTextMap[time] || '未设置'
          }
        })
      )
    )
    .sort((a, b) => String(a.clock).localeCompare(String(b.clock)))
})

const loadPatients = async () => {
  const response = await patientApi.list({ page: 1, limit: 100 })
  patients.value = getRecords(response)
  if (!activePatientId.value && patients.value.length) {
    activePatientId.value = String(patients.value[0].id)
  }
}

const loadPlans = async () => {
  if (!activePatientId.value) return
  const response = await planApi.list({ patientId: activePatientId.value, page: 1, limit: 100 })
  plans.value = getRecords(response)
  activePlanId.value = plans.value.length ? String(plans.value[0].id) : ''
}

const selectPatient = async (id) => {
  activePatientId.value = String(id)
  await loadPlans()
}

const getDrugReminderLabels = (drug) => {
  return String(drug.time || '')
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `${item} ${timeTextMap[item] || ''}`.trim())
}

const getPlanReminderCount = (plan) => {
  return plan.reminderCount || (plan.drugs || []).reduce((total, drug) => total + getDrugReminderLabels(drug).length, 0)
}

const openCreatePlan = () => {
  planForm.title = '日常用药计划'
  planForm.source = '社区复诊处方'
  planForm.status = '已生效'
  planForm.startDate = '2026-05-20'
  planForm.endDate = '2026-06-18'
  planVisible.value = true
}

const saveCreatePlan = async () => {
  if (!planForm.title) {
    Message.warning('请输入计划名称')
    return
  }
  if (!activePatient.value) {
    Message.warning('未绑定患者或患者未同意知情同意书时，请先完善患者档案')
    return
  }
  const patient = patients.value.find((item) => String(item.id) === String(activePatientId.value))
  const response = await planApi.save({
    ...planForm,
    patientId: activePatientId.value,
    patientName: patient?.name || '',
    period: `${planForm.startDate} 至 ${planForm.endDate}`,
    status: planForm.status,
    dispatchStatus: patient?.deviceNo && patient.deviceNo !== '未绑定' ? '待下发 / 未下发' : '未绑定设备',
    generatedTasks: '待录入药品',
    reminderCount: 0,
    auditSummary: '请按处方和医药师建议执行，异常情况及时联系医药师。',
    drugs: []
  })
  if (response.code === 200) {
    Message.success('用药计划已创建，请继续录入药品与提醒')
    planVisible.value = false
    await loadPlans()
    activePlanId.value = String(response.data.id)
    const savedPlan = plans.value.find((plan) => String(plan.id) === String(response.data.id))
    if (savedPlan) openDrugDialog(savedPlan)
  }
}

const createDraftPlan = async () => {
  if (!activePatient.value) return
  const patient = patients.value.find((item) => String(item.id) === String(activePatientId.value))
  const response = await planApi.save({
    title: '待录入用药计划',
    source: '手动录入',
    status: '草稿',
    startDate: '2026-05-20',
    endDate: '2026-06-18',
    patientId: activePatientId.value,
    patientName: patient?.name || '',
    period: '2026-05-20 至 2026-06-18',
    dispatchStatus: '待录入药品',
    generatedTasks: '待录入药品',
    reminderCount: 0,
    auditSummary: '请先录入正式处方药品、剂量、频次和提醒时间。',
    drugs: []
  })
  if (response.code === 200) {
    Message.success('已创建用药计划草稿，请录入药品与提醒')
    await loadPlans()
    activePlanId.value = String(response.data.id)
    const savedPlan = plans.value.find((plan) => String(plan.id) === String(response.data.id))
    if (savedPlan) openDrugDialog(savedPlan)
  }
}

const openDrugDialog = (plan, drug = null, index = -1) => {
  editingPlan.value = plan
  editingDrugIndex.value = index
  drugDialogMode.value = drug ? 'edit' : 'add'
  Object.assign(drugForm, {
    name: drug?.name || '',
    specification: drug?.specification || '',
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
  if (!editingPlan.value) return
  if (!drugForm.name || !drugForm.dose) {
    Message.warning('请补齐药品名称和每次剂量')
    return
  }
  if (!drugForm.time) {
    Message.warning('请补齐每次提醒时间和服药时段')
    return
  }
  const nextPlan = {
    ...editingPlan.value,
    drugs: [...(editingPlan.value.drugs || [])]
  }
  if (drugDialogMode.value === 'edit' && editingDrugIndex.value >= 0) {
    nextPlan.drugs[editingDrugIndex.value] = { ...drugForm }
  } else {
    nextPlan.drugs.push({ ...drugForm })
  }
  if (!nextPlan.drugs.length) {
    Message.warning('请至少添加一种药品')
    return
  }
  if (nextPlan.drugs.some((drug) => !drug.name || !drug.dose || !drug.frequency || !drug.time)) {
    Message.warning('请补齐第 1 行药品名称、剂量、频次和服药时段')
    return
  }
  nextPlan.reminderCount = nextPlan.drugs.reduce((total, drug) => total + getDrugReminderLabels(drug).length, 0)
  const conflict = findDrugConflict(nextPlan)
  if (conflict) {
    Message.warning(`与 ${conflict.plan.title} 的 ${conflict.drug.name} 冲突，请保存为草稿或先停用旧计划；冲突，请先调整提醒时段或停用旧计划`)
    return
  }
  const response = await planApi.update(nextPlan)
  if (response.code === 200) {
    Message.success(drugDialogMode.value === 'add' ? '药品已添加' : '用药与提醒已保存')
    drugVisible.value = false
    await loadPlans()
  }
}

const dispatchPlan = async (plan) => {
  if (!activePatient.value?.deviceNo || activePatient.value.deviceNo === '未绑定') {
    Message.warning('当前患者未绑定药盒，请先绑定设备')
    return
  }
  if (activePatient.value.deviceStatus !== '在线') {
    Message.warning('当前药盒不在线，请恢复在线后再下发计划')
    return
  }
  const reminderCount = getPlanReminderCount(plan)
  const response = await planApi.update({
    ...plan,
    dispatchStatus: '已下发药盒',
    generatedTasks: `${reminderCount} 条任务已生成`,
    reminderCount,
    updatedAt: formatDateTime()
  })
  if (response.code === 200) {
    const deviceResponse = await deviceApi.list({ sn: activePatient.value.deviceNo, limit: 20 })
    const device = getRecords(deviceResponse).find((item) => item.sn === activePatient.value.deviceNo)
    if (device) {
      await deviceApi.update({
        ...device,
        dispatchStatus: '计划已同步',
        lastDispatchAt: formatDateTime()
      })
    }
    Message.success('计划已下发药盒，今日任务已生成')
    await loadPlans()
  }
}

const removeCurrentDrug = async () => {
  if (!editingPlan.value || editingDrugIndex.value < 0) return
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '停用药品',
      content: '确认停用该药品？保存后将从当前方案药品明细中移除。',
      okText: '停用',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    })
  })
  if (!confirmed) {
    // 用户取消时无需提示。
    return
  }
  const nextPlan = {
    ...editingPlan.value,
    drugs: editingPlan.value.drugs.filter((_item, index) => index !== editingDrugIndex.value)
  }
  nextPlan.reminderCount = nextPlan.drugs.reduce((total, drug) => total + getDrugReminderLabels(drug).length, 0)
  const response = await planApi.update(nextPlan)
  if (response.code === 200) {
    Message.success('药品已停用')
    drugVisible.value = false
    await loadPlans()
  }
}

const stopPlan = async (plan) => {
  const response = await planApi.update({ ...plan, status: '已停用', dispatchStatus: '已停用', stoppedAt: formatDateTime(), stopReason: '医药师手动停用' })
  if (response.code === 200) {
    Message.success('用药计划已停用')
    await loadPlans()
  }
}

const findDrugConflict = (targetPlan) => {
  const activePlans = plans.value.filter((plan) => String(plan.id) !== String(targetPlan.id) && plan.status !== '已停用')
  for (const plan of activePlans) {
    for (const drug of plan.drugs || []) {
      for (const nextDrug of targetPlan.drugs || []) {
        if (drug.name === nextDrug.name && drug.time === nextDrug.time) {
          return { plan, drug }
        }
      }
    }
  }
  return null
}

const openRoutineDialog = () => {
  Object.assign(routineForm, {
    breakfastTime: activePatient.value?.breakfastTime || '',
    lunchTime: activePatient.value?.lunchTime || '',
    dinnerTime: activePatient.value?.dinnerTime || '',
    sleepTime: activePatient.value?.sleepTime || ''
  })
  routineVisible.value = true
}

const saveRoutine = async () => {
  if (!activePatient.value) return
  const response = await patientApi.update({ ...activePatient.value, ...routineForm, updatedAt: formatDateTime() })
  const updated = getPayload(response)
  const index = patients.value.findIndex((patient) => String(patient.id) === String(updated.id))
  if (index >= 0) patients.value[index] = { ...patients.value[index], ...updated }
  routineVisible.value = false
  Message.success('作息时间已保存')
}

watch(activePatientId, () => {
  router.replace({ path: '/doctor/plans', query: { patientId: activePatientId.value } })
})

onMounted(async () => {
  await loadPatients()
  await loadPlans()
  if (pickQueryValue(route.query.action) === 'create' && activePatientId.value) {
    await createDraftPlan()
  }
})
</script>
