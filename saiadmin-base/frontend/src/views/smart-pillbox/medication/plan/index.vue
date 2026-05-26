<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>用药计划</h2>
        <p>先选择患者，再维护多个计划、药品明细和下发状态</p>
      </div>
      <ElSpace wrap>
        <ElButton @click="router.push('/doctor/patients')">
          <template #icon><ArtSvgIcon icon="ri:user-search-line" /></template>
          查看患者档案
        </ElButton>
        <ElButton type="primary" @click="openCreateDialog">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          创建用药计划
        </ElButton>
      </ElSpace>
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
                <div class="muted text-xs mt-1"
                  >{{ patient.gender }} · {{ patient.age }}岁 · {{ patient.recordNo }}</div
                >
              </div>
              <ElTag :type="patient.deviceStatusType">{{ patient.deviceStatus }}</ElTag>
            </div>
            <div class="muted mt-2">{{ patient.diseases.join('、') }} · {{ patient.deviceNo }}</div>
            <div class="chip-row mt-2">
              <ElTag effect="plain">今日药品 {{ patient.todayDrugs }} 种</ElTag>
              <ElTag effect="plain">下一提醒 {{ patient.nextReminder }}</ElTag>
            </div>
          </button>
        </ElScrollbar>
      </ElCard>

      <div class="detail-stack">
        <ElCard class="plan-tabs-card" shadow="never">
          <ElEmpty v-if="currentPatientPlans.length === 0" description="当前患者暂无用药计划" />
          <ElTabs v-else v-model="activePlanTab" v-loading="planLoading" class="plan-tabs">
            <ElTabPane label="时间线" name="timeline">
              <div class="timeline-panel">
                <div class="scheme-header">
                  <div>
                    <div class="scheme-title">
                      <ArtSvgIcon icon="ri:shield-check-line" />
                      <span>全天用药时间线</span>
                    </div>
                    <p>按服药时间从早到晚展示当前患者所有未停用计划的用药情况</p>
                  </div>
                  <ElSpace wrap>
                    <ElButton @click="openRoutineDialog">
                      <template #icon><ArtSvgIcon icon="ri:time-line" /></template>
                      调整作息
                    </ElButton>
                  </ElSpace>
                </div>

                <div class="routine-chip-row">
                  <ElTag effect="plain">早餐 {{ currentPatient.breakfastTime || '-' }}</ElTag>
                  <ElTag effect="plain">午餐 {{ currentPatient.lunchTime || '-' }}</ElTag>
                  <ElTag effect="plain">晚餐 {{ currentPatient.dinnerTime || '-' }}</ElTag>
                  <ElTag effect="plain">睡眠 {{ currentPatient.sleepTime || '-' }}</ElTag>
                </div>

                <ElEmpty v-if="timelineGroups.length === 0" description="暂无可展示的服药时间点" />
                <div v-else class="timeline-list">
                  <div v-for="group in timelineGroups" :key="group.time" class="timeline-group">
                    <div class="timeline-time">
                      <b>{{ group.time }}</b>
                      <span>{{ group.items.length }} 项</span>
                    </div>
                    <div class="timeline-medicine-list">
                      <div
                        v-for="item in group.items"
                        :key="item.key"
                        class="timeline-medicine"
                      >
                        <div class="timeline-medicine-top">
                          <b>{{ item.drug.name }}</b>
                          <ElSpace wrap>
                            <ElTag effect="plain">{{ item.tag }}</ElTag>
                            <ElTag :type="getPlanStatusType(item.plan.status)">
                              {{ item.plan.status }}
                            </ElTag>
                          </ElSpace>
                        </div>
                        <div class="timeline-medicine-meta">
                          <span>{{ item.drug.dose }}</span>
                          <span>{{ item.drug.frequency }}</span>
                          <span>{{ item.plan.title }}</span>
                        </div>
                        <p>{{ item.drug.guide || '请按处方和医药师建议执行。' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ElTabPane>

            <ElTabPane
              v-for="plan in currentPatientPlans"
              :key="plan.id"
              :label="formatPlanTabLabel(plan)"
              :name="getPlanTabName(plan.id)"
            >
              <div class="scheme-panel">
                <div class="scheme-header">
                  <div>
                    <div class="scheme-title">
                      <ArtSvgIcon icon="ri:shield-check-line" />
                      <span>{{ plan.title }}</span>
                      <span class="scheme-count">
                        共 {{ plan.drugs.length }} 种，{{ getPlanReminderCount(plan) }} 个提醒节点
                      </span>
                    </div>
                    <p>{{ plan.code }} · {{ plan.period }} · {{ plan.source }}</p>
                  </div>
                  <ElSpace wrap>
                    <ElButton @click="openAddDrugDialog(plan)">
                      <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
                      新增药品
                    </ElButton>
                    <ElButton
                      type="danger"
                      plain
                      :disabled="plan.status === '已停用'"
                      @click="stopPlan(plan)"
                    >
                      <template #icon><ArtSvgIcon icon="ri:stop-circle-line" /></template>
                      停用计划
                    </ElButton>
                  </ElSpace>
                </div>

                <div class="scheme-status-row">
                  <ElTag :type="getPlanStatusType(plan.status)">{{ plan.status }}</ElTag>
                  <ElTag :type="plan.dispatchType">{{ plan.dispatchStatus }}</ElTag>
                  <ElTag effect="plain">{{ plan.generatedTasks }}</ElTag>
                  <ElTag effect="plain">{{ plan.auditSummary || '无审核提示' }}</ElTag>
                </div>

                <ElEmpty v-if="plan.drugs.length === 0" description="当前方案暂无药品">
                  <ElButton type="primary" @click="openAddDrugDialog(plan)">
                    <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
                    添加药品
                  </ElButton>
                </ElEmpty>
                <div v-else class="medicine-card-list">
                  <div v-for="(drug, index) in plan.drugs" :key="`${drug.name}-${index}`" class="medicine-card">
                    <div class="medicine-field medicine-name-field">
                      <span>药品名称</span>
                      <b>{{ drug.name }}</b>
                      <small v-if="drug.specification || drug.quantity">
                        {{ [drug.specification, drug.quantity].filter(Boolean).join(' · ') }}
                      </small>
                    </div>
                    <div class="medicine-field">
                      <span>提醒节点</span>
                      <div class="reminder-tags">
                        <ElTag
                          v-for="slot in getDrugReminderSlots(drug)"
                          :key="`${slot.time}-${slot.tag}`"
                          effect="plain"
                        >
                          {{ slot.tag }} {{ slot.time }}
                        </ElTag>
                      </div>
                    </div>
                    <div class="medicine-field">
                      <span>用法用量</span>
                      <b>{{ drug.dose }} {{ drug.frequency }}</b>
                    </div>
                    <div class="medicine-field">
                      <span>用药天数</span>
                      <b>{{ drug.durationDays || 30 }}天</b>
                    </div>
                    <ElButton class="medicine-edit-button" @click="openEditDrugDialog(plan, index)">
                      <template #icon><ArtSvgIcon icon="ri:edit-line" /></template>
                      修改调整
                    </ElButton>
                  </div>
                </div>

                <div v-if="plan.status === '已停用'" class="stopped-note">
                  停用时间：{{ plan.stoppedAt || '-' }}，原因：{{ plan.stopReason || '医药师手动停用' }}
                </div>
              </div>
            </ElTabPane>
          </ElTabs>
        </ElCard>
      </div>
    </div>

    <ElDialog v-model="editVisible" :title="dialogTitle" width="1080px">
      <ElForm ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <ElRow :gutter="16">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="患者">
              <ElInput :model-value="currentPatient.name" readonly />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="计划名称" prop="title">
              <ElInput v-model="editForm.title" placeholder="请输入计划名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="计划来源" prop="source">
              <ElSelect v-model="editForm.source" placeholder="请选择计划来源">
                <ElOption v-for="source in sourceOptions" :key="source" :label="source" :value="source" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="计划状态" prop="status">
              <ElSelect v-model="editForm.status" placeholder="请选择计划状态">
                <ElOption v-for="status in statusOptions" :key="status" :label="status" :value="status" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="开始日期" prop="startDate">
              <ElDatePicker
                v-model="editForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="结束日期">
              <ElDatePicker
                v-model="editForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="可留空"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="药品明细">
              <div class="drug-edit-panel">
                <div class="flex justify-between items-center gap-3 mb-3">
                  <span class="muted">同一患者已生效计划中，药品名称和服药时段不能重复</span>
                  <ElButton @click="addDrugRow">
                    <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
                    添加药品
                  </ElButton>
                </div>
                <ElTable :data="editForm.drugs" border>
                  <ElTableColumn label="药品名称" min-width="160">
                    <template #default="{ row }">
                      <ElInput v-model="row.name" placeholder="药品名称" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="规格" min-width="120">
                    <template #default="{ row }">
                      <ElInput v-model="row.specification" placeholder="如 500mg" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="单次剂量" min-width="120">
                    <template #default="{ row }">
                      <ElInput v-model="row.dose" placeholder="如 1片/次" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="频次" min-width="120">
                    <template #default="{ row }">
                      <ElInput v-model="row.frequency" placeholder="每日1次" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="服药时段" min-width="130">
                    <template #default="{ row }">
                      <ElInput v-model="row.time" placeholder="早餐后" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="疗程" width="120">
                    <template #default="{ row }">
                      <ElInputNumber
                        v-model="row.durationDays"
                        :min="1"
                        :max="3650"
                        controls-position="right"
                        style="width: 96px"
                      />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="用药说明" min-width="220">
                    <template #default="{ row }">
                      <ElInput v-model="row.guide" placeholder="按处方执行" />
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="操作" width="92" fixed="right">
                    <template #default="{ $index }">
                      <ElButton
                        type="danger"
                        link
                        :disabled="editForm.drugs.length === 1"
                        @click="removeDrugRow($index)"
                      >
                        删除
                      </ElButton>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消
        </ElButton>
        <ElButton type="primary" @click="saveCreatePlan">
          <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
          保存
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="drugEditVisible" :title="drugDialogTitle" width="1080px">
      <ElForm label-position="top">
        <ElRow :gutter="16">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="药品名称">
              <ElInput v-model="drugForm.name" placeholder="请输入药品名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="6">
            <ElFormItem label="规格">
              <ElInput v-model="drugForm.specification" placeholder="如 500mg" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="6">
            <ElFormItem label="剩余药品量">
              <ElInput v-model="drugForm.quantity" placeholder="如 18片" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="每次剂量">
              <ElInput v-model="drugForm.dose" placeholder="如 1片/次" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="用药天数">
              <ElInputNumber
                v-model="drugForm.durationDays"
                :min="1"
                :max="3650"
                controls-position="right"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="每日次数">
              <ElSegmented v-model="drugForm.dailyCount" :options="dailyCountOptions" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="每次提醒时间">
              <div class="reminder-edit-list">
                <div
                  v-for="(slot, index) in drugForm.reminderSlots"
                  :key="index"
                  class="reminder-edit-row"
                >
                  <b>第 {{ index + 1 }} 次</b>
                  <ElTimePicker
                    v-model="slot.time"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="提醒时间"
                  />
                  <ElSelect v-model="slot.tag" placeholder="服药时段">
                    <ElOption v-for="tag in reminderTagOptions" :key="tag" :label="tag" :value="tag" />
                  </ElSelect>
                </div>
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="用药说明">
              <ElInput
                v-model="drugForm.guide"
                type="textarea"
                :rows="3"
                placeholder="请输入服药说明和注意事项"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElSpace wrap>
          <ElButton
            v-if="drugDialogMode === 'edit'"
            type="danger"
            plain
            @click="removeCurrentDrug"
          >
            <template #icon><ArtSvgIcon icon="ri:stop-circle-line" /></template>
            停用药品
          </ElButton>
          <ElButton @click="drugEditVisible = false">
            <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
            取消
          </ElButton>
          <ElButton type="primary" @click="saveDrugEdit">
            <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
            保存用药与提醒
          </ElButton>
        </ElSpace>
      </template>
    </ElDialog>

    <ElDialog v-model="routineVisible" title="调整作息时间" width="640px">
      <ElForm label-position="top">
        <ElRow :gutter="16">
          <ElCol :xs="24" :md="12">
            <ElFormItem label="早餐">
              <ElTimePicker
                v-model="routineForm.breakfastTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="早餐时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="午餐">
              <ElTimePicker
                v-model="routineForm.lunchTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="午餐时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="晚餐">
              <ElTimePicker
                v-model="routineForm.dinnerTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="晚餐时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :md="12">
            <ElFormItem label="睡眠">
              <ElTimePicker
                v-model="routineForm.sleepTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="睡眠时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="routineVisible = false">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消
        </ElButton>
        <ElButton type="primary" @click="saveRoutine">
          <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
          保存作息
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import planApi from '@/views/plugin/smart-pillbox/api/doctor/plan'
  import type { Drug, Patient, Plan } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxPlan' })

  type DrugDialogMode = 'add' | 'edit'

  interface EditableDrug {
    name: string
    specification: string
    dose: string
    frequency: string
    time: string
    durationDays: number
    guide: string
  }

  interface ReminderSlotDraft {
    time: string
    tag: string
  }

  interface TimelineMedication {
    key: string
    time: string
    tag: string
    sortValue: number
    plan: Plan
    drug: Drug
  }

  const router = useRouter()
  const route = useRoute()
  const keyword = ref('')
  const selectedPatientId = ref(Number(route.query.patientId || 1))
  const selectedPlanId = ref<number | null>(null)
  const activePlanTab = ref('timeline')
  const editVisible = ref(false)
  const autoCreateDialogOpened = ref(false)
  const drugEditVisible = ref(false)
  const drugDialogMode = ref<DrugDialogMode>('add')
  const drugDialogPlanId = ref<number | null>(null)
  const drugDialogIndex = ref<number | null>(null)
  const routineVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const editForm = reactive({
    title: '',
    source: '手动录入',
    startDate: '',
    endDate: '',
    status: '草稿',
    drugs: [] as EditableDrug[]
  })
  const drugForm = reactive({
    name: '',
    specification: '',
    quantity: '',
    dose: '',
    dailyCount: 1,
    durationDays: 30,
    guide: '',
    reminderSlots: [] as ReminderSlotDraft[]
  })
  const routineForm = reactive({
    breakfastTime: '',
    lunchTime: '',
    dinnerTime: '',
    sleepTime: ''
  })
  const patients = ref<Patient[]>([])
  const plans = ref<Plan[]>([])
  const patientLoading = ref(false)
  const planLoading = ref(false)

  const sourceOptions = ['手动录入', '门诊处方', '复诊调整', 'HIS 截图', '纸质处方照片']
  const statusOptions = ['草稿', '已生效']
  const dailyCountOptions = [
    { label: '每日1次', value: 1 },
    { label: '每日2次', value: 2 },
    { label: '每日3次', value: 3 },
    { label: '每日4次', value: 4 }
  ]
  const reminderTagOptions = [
    '早餐前',
    '早餐时',
    '早餐后',
    '午餐前',
    '午餐时',
    '午餐后',
    '晚餐前',
    '晚餐时',
    '晚餐后',
    '餐前',
    '餐后',
    '睡前',
    '空腹'
  ]

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

  const emptyPlan: Plan = {
    id: 0,
    patientId: 0,
    title: '尚未创建用药计划',
    code: '草稿',
    period: '未设置',
    status: '草稿',
    dispatchStatus: '未下发',
    dispatchType: 'info',
    generatedTasks: '未生成',
    source: '手动录入',
    drugs: []
  }

  const patientOptions = computed(() =>
    patients.value.filter(
      (patient) =>
        !keyword.value ||
        [patient.name, patient.recordNo, patient.deviceNo].some((value) =>
          String(value || '').includes(keyword.value)
        )
    )
  )
  const currentPatient = computed(
    () =>
      patients.value.find((item) => item.id === selectedPatientId.value) ||
      patients.value[0] ||
      emptyPatient
  )
  const currentPatientPlans = computed(() =>
    plans.value.filter((item) => item.patientId === selectedPatientId.value)
  )
  const activePlans = computed(() =>
    currentPatientPlans.value.filter((item) => item.status === '已生效')
  )
  const timelinePlans = computed(() =>
    currentPatientPlans.value.filter((item) => item.status !== '已停用')
  )
  const selectedPlan = computed(
    () =>
      currentPatientPlans.value.find((item) => item.id === selectedPlanId.value) ||
      activePlans.value[0] ||
      currentPatientPlans.value[0] ||
      emptyPlan
  )
  const dialogTitle = '创建用药计划'
  const drugDialogTitle = computed(() =>
    drugDialogMode.value === 'add' ? '新增药品与提醒' : '修改用药与提醒'
  )
  const timelineItems = computed<TimelineMedication[]>(() =>
    timelinePlans.value
      .flatMap((plan) =>
        plan.drugs.flatMap((drug, drugIndex) =>
          getDrugReminderSlots(drug).map((slot, slotIndex) => ({
            key: `${plan.id}-${drugIndex}-${slotIndex}-${slot.time}-${slot.tag}`,
            time: slot.time,
            tag: slot.tag,
            sortValue: timeToMinutes(slot.time),
            plan,
            drug
          }))
        )
      )
      .sort((a, b) => a.sortValue - b.sortValue || a.drug.name.localeCompare(b.drug.name))
  )
  const timelineGroups = computed(() => {
    const groups = new Map<string, TimelineMedication[]>()
    timelineItems.value.forEach((item) => {
      const group = groups.get(item.time) || []
      group.push(item)
      groups.set(item.time, group)
    })
    return Array.from(groups.entries()).map(([time, items]) => ({ time, items }))
  })

  const editRules: FormRules = {
    title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    source: [{ required: true, message: '请选择计划来源', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    status: [{ required: true, message: '请选择计划状态', trigger: 'change' }]
  }

  function createEmptyDrug(): EditableDrug {
    return {
      name: '',
      specification: '',
      dose: '',
      frequency: '',
      time: '',
      durationDays: 30,
      guide: ''
    }
  }

  function getPlanTabName(planId: number) {
    return `plan-${planId}`
  }

  function formatPlanTabLabel(plan: Plan) {
    return plan.status === '已停用' ? `${plan.title}（已停用）` : plan.title
  }

  function parseClockTime(value?: string | null) {
    const matched = String(value || '').match(/(\d{1,2}):(\d{2})/)
    if (!matched) return null
    const hour = Number(matched[1])
    const minute = Number(matched[2])
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null
    return Math.min(Math.max(hour, 0), 23) * 60 + Math.min(Math.max(minute, 0), 59)
  }

  function minutesToTime(minutes: number) {
    const normalized = (minutes + 24 * 60) % (24 * 60)
    const hour = Math.floor(normalized / 60)
    const minute = normalized % 60
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  function timeToMinutes(value?: string | null) {
    return parseClockTime(value) ?? 24 * 60
  }

  function offsetTime(value: string | undefined, offsetMinutes: number, fallback: string) {
    const base = parseClockTime(value || fallback) ?? parseClockTime(fallback) ?? 8 * 60
    return minutesToTime(base + offsetMinutes)
  }

  function getRoutineTime(tag: string, index = 0, total = 1) {
    const normalized = normalizeText(tag)
    const explicitTime = parseClockTime(tag)
    if (explicitTime !== null) return minutesToTime(explicitTime)
    if (normalized.includes('早餐')) {
      if (normalized.includes('前')) return offsetTime(currentPatient.value.breakfastTime, -30, '07:00')
      if (normalized.includes('后')) return offsetTime(currentPatient.value.breakfastTime, 30, '07:00')
      return currentPatient.value.breakfastTime || '07:00'
    }
    if (normalized.includes('午餐')) {
      if (normalized.includes('前')) return offsetTime(currentPatient.value.lunchTime, -30, '12:00')
      if (normalized.includes('后')) return offsetTime(currentPatient.value.lunchTime, 30, '12:00')
      return currentPatient.value.lunchTime || '12:00'
    }
    if (normalized.includes('晚餐')) {
      if (normalized.includes('前')) return offsetTime(currentPatient.value.dinnerTime, -30, '18:00')
      if (normalized.includes('后')) return offsetTime(currentPatient.value.dinnerTime, 30, '18:00')
      return currentPatient.value.dinnerTime || '18:00'
    }
    if (normalized.includes('睡前')) return offsetTime(currentPatient.value.sleepTime, -30, '22:00')
    if (normalized.includes('空腹')) return offsetTime(currentPatient.value.breakfastTime, -30, '07:00')
    return getDefaultReminderSlot(index, total).time
  }

  function splitDrugTimeTags(value?: string | null) {
    return String(value || '')
      .split(/[、，,;/；]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function getDefaultReminderSlot(index: number, total = 1): ReminderSlotDraft {
    const breakfastAfter = offsetTime(currentPatient.value.breakfastTime, 30, '07:00')
    const lunchAfter = offsetTime(currentPatient.value.lunchTime, 30, '12:00')
    const dinnerAfter = offsetTime(currentPatient.value.dinnerTime, 30, '18:00')
    const beforeSleep = offsetTime(currentPatient.value.sleepTime, -30, '22:00')
    const presets =
      total <= 1
        ? [{ time: breakfastAfter, tag: '餐后' }]
        : total === 2
          ? [
              { time: breakfastAfter, tag: '餐后' },
              { time: dinnerAfter, tag: '餐后' }
            ]
          : total === 3
            ? [
                { time: breakfastAfter, tag: '餐后' },
                { time: lunchAfter, tag: '餐后' },
                { time: dinnerAfter, tag: '餐后' }
              ]
            : [
                { time: breakfastAfter, tag: '餐后' },
                { time: lunchAfter, tag: '餐后' },
                { time: dinnerAfter, tag: '餐后' },
                { time: beforeSleep, tag: '睡前' }
              ]
    return presets[index] || presets[presets.length - 1]
  }

  function getDrugReminderSlots(drug: Drug): ReminderSlotDraft[] {
    if (drug.reminders?.length) {
      return drug.reminders.map((slot, index) => ({
        time: slot.time || getRoutineTime(slot.tag, index, drug.reminders?.length || 1),
        tag: slot.tag || drug.time || '按医嘱'
      }))
    }
    const tags = splitDrugTimeTags(drug.time)
    if (tags.length) {
      return tags.map((tag, index) => ({
        time: getRoutineTime(tag, index, tags.length),
        tag
      }))
    }
    return [getDefaultReminderSlot(0, 1)]
  }

  function getDrugDailyCount(drug: Drug) {
    const frequencyCount = Number(String(drug.frequency || '').match(/每日(\d+)次/)?.[1])
    const reminderCount = drug.reminders?.length || splitDrugTimeTags(drug.time).length
    return frequencyCount || reminderCount || 1
  }

  function syncDrugReminderSlots() {
    const count = Number(drugForm.dailyCount) || 1
    while (drugForm.reminderSlots.length < count) {
      drugForm.reminderSlots.push(getDefaultReminderSlot(drugForm.reminderSlots.length, count))
    }
    while (drugForm.reminderSlots.length > count) {
      drugForm.reminderSlots.pop()
    }
    drugForm.reminderSlots.forEach((slot, index) => {
      if (!slot.time || !slot.tag) {
        const defaultSlot = getDefaultReminderSlot(index, count)
        slot.time ||= defaultSlot.time
        slot.tag ||= defaultSlot.tag
      }
    })
  }

  function getDrugReminderCount(drug: Drug) {
    return getDrugReminderSlots(drug).length
  }

  function getPlanReminderCount(plan: Plan) {
    return plan.drugs.reduce((total, drug) => total + getDrugReminderCount(drug), 0)
  }

  function getDrugConflictKeys(drug: Drug) {
    return getDrugReminderSlots(drug).map(
      (slot) => `${normalizeText(drug.name)}|${normalizeText(slot.time || slot.tag)}`
    )
  }

  function normalizeText(value?: string | null) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, '')
  }

  function getPlanStatusType(status: string): Plan['dispatchType'] {
    if (status === '已生效') return 'success'
    if (status === '已停用') return 'info'
    if (status === '已完成') return 'primary'
    return 'warning'
  }

  function formatDateTime(date = new Date()) {
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`
  }

  function buildPeriod() {
    if (!editForm.startDate) return '未设置'
    return editForm.endDate ? `${editForm.startDate} 至 ${editForm.endDate}` : `${editForm.startDate} 起`
  }

  function buildPlanCode() {
    if (editForm.status !== '已生效') return '草稿'
    return `PLAN-${String(Date.now()).slice(-8)}-${selectedPatientId.value}`
  }

  function getDispatchStatus(): Pick<Plan, 'dispatchStatus' | 'dispatchType' | 'generatedTasks'> {
    if (editForm.status !== '已生效') {
      return {
        dispatchStatus: '未下发',
        dispatchType: 'info',
        generatedTasks: '未生成'
      }
    }
    if (!currentPatient.value.deviceNo || currentPatient.value.deviceNo === '未绑定') {
      return {
        dispatchStatus: '未绑定设备',
        dispatchType: 'info',
        generatedTasks: `已生成 ${editForm.drugs.length} 种药品任务`
      }
    }
    return {
      dispatchStatus: '待下发',
      dispatchType: 'warning',
      generatedTasks: `已生成 ${editForm.drugs.length} 种药品任务`
    }
  }

  function selectPlan(plan: Plan) {
    selectedPlanId.value = plan.id
    activePlanTab.value = getPlanTabName(plan.id)
  }

  function syncSelectedPlan() {
    if (!currentPatientPlans.value.length) {
      selectedPlanId.value = null
      activePlanTab.value = 'timeline'
      return
    }
    if (!currentPatientPlans.value.some((item) => item.id === selectedPlanId.value)) {
      selectedPlanId.value = activePlans.value[0]?.id || currentPatientPlans.value[0].id
    }
    if (
      activePlanTab.value !== 'timeline' &&
      !currentPatientPlans.value.some((item) => getPlanTabName(item.id) === activePlanTab.value)
    ) {
      activePlanTab.value = 'timeline'
    }
  }

  function setEditDrugs(drugs: EditableDrug[]) {
    editForm.drugs.splice(0, editForm.drugs.length, ...drugs)
  }

  function resetEditForm(drugs: EditableDrug[] = [createEmptyDrug()]) {
    editForm.title = '新建用药计划'
    editForm.source = '手动录入'
    editForm.startDate = ''
    editForm.endDate = ''
    editForm.status = '草稿'
    setEditDrugs(drugs)
    nextTick(() => editFormRef.value?.clearValidate())
  }

  function openCreateDialog() {
    if (!currentPatient.value.id) return
    resetEditForm()
    editVisible.value = true
  }

  function maybeOpenCreateDialogFromRoute() {
    if (
      autoCreateDialogOpened.value ||
      route.query.action !== 'create' ||
      !selectedPatientId.value
    ) {
      return
    }
    autoCreateDialogOpened.value = true
    nextTick(() => {
      openCreateDialog()
      router.replace({
        path: '/doctor/plans',
        query: { patientId: selectedPatientId.value }
      })
    })
  }

  function addDrugRow() {
    editForm.drugs.push(createEmptyDrug())
  }

  function removeDrugRow(index: number) {
    if (editForm.drugs.length <= 1) return
    editForm.drugs.splice(index, 1)
  }

  function resetDrugForm(drug?: Drug) {
    const dailyCount = drug ? getDrugDailyCount(drug) : 1
    drugForm.name = drug?.name || ''
    drugForm.specification = drug?.specification || ''
    drugForm.quantity = drug?.quantity || ''
    drugForm.dose = drug?.dose || ''
    drugForm.dailyCount = Math.min(Math.max(dailyCount, 1), 4)
    drugForm.durationDays = drug?.durationDays || 30
    drugForm.guide = drug?.guide || ''
    drugForm.reminderSlots.splice(
      0,
      drugForm.reminderSlots.length,
      ...(drug ? getDrugReminderSlots(drug) : [getDefaultReminderSlot(0, 1)])
    )
    syncDrugReminderSlots()
  }

  function openAddDrugDialog(plan: Plan) {
    selectedPlanId.value = plan.id
    activePlanTab.value = getPlanTabName(plan.id)
    drugDialogMode.value = 'add'
    drugDialogPlanId.value = plan.id
    drugDialogIndex.value = null
    resetDrugForm()
    drugEditVisible.value = true
  }

  function openEditDrugDialog(plan: Plan, index: number) {
    selectedPlanId.value = plan.id
    activePlanTab.value = getPlanTabName(plan.id)
    drugDialogMode.value = 'edit'
    drugDialogPlanId.value = plan.id
    drugDialogIndex.value = index
    resetDrugForm(plan.drugs[index])
    drugEditVisible.value = true
  }

  function buildDrugFromDrugForm(plan: Plan): Drug {
    const slots = drugForm.reminderSlots
      .map((slot) => ({
        time: slot.time,
        tag: slot.tag
      }))
      .filter((slot) => slot.time && slot.tag)
    return {
      name: drugForm.name.trim(),
      specification: drugForm.specification.trim(),
      quantity: drugForm.quantity.trim(),
      dose: drugForm.dose.trim(),
      frequency: `每日${Number(drugForm.dailyCount) || 1}次`,
      time: slots.map((slot) => slot.tag).join('/') || '餐后',
      guide: drugForm.guide.trim() || '请按处方和医药师建议执行，异常情况及时联系医药师。',
      startDate: plan.startDate,
      endDate: plan.endDate || null,
      durationDays: Number(drugForm.durationDays) || 30,
      reminders: slots
    }
  }

  function validateDrugForm() {
    if (!drugForm.name.trim() || !drugForm.dose.trim()) {
      ElMessage.warning('请补齐药品名称和每次剂量')
      return false
    }
    const invalidSlot = drugForm.reminderSlots.some((slot) => !slot.time || !slot.tag)
    if (invalidSlot) {
      ElMessage.warning('请补齐每次提醒时间和服药时段')
      return false
    }
    return true
  }

  function buildPlanTaskSummary(plan: Plan, drugs: Drug[]) {
    if (plan.status !== '已生效') return '未生成'
    const reminderCount = drugs.reduce((total, drug) => total + getDrugReminderCount(drug), 0)
    return `已生成 ${reminderCount} 个提醒节点`
  }

  async function updatePlanDrugs(plan: Plan, drugs: Drug[]) {
    const conflict = findDrugConflict(drugs, {
      status: plan.status,
      ignorePlanId: plan.id
    })
    if (conflict) {
      ElMessage.warning(
        `与 ${conflict.plan.title} 的 ${conflict.drug.name} 冲突，请先调整提醒时段或停用旧计划`
      )
      return false
    }
    await planApi.update({
      id: plan.id,
      drugs,
      reminderCount: drugs.reduce((total, drug) => total + getDrugReminderCount(drug), 0),
      generatedTasks: buildPlanTaskSummary(plan, drugs)
    })
    await loadPlans()
    selectedPlanId.value = plan.id
    activePlanTab.value = getPlanTabName(plan.id)
    return true
  }

  async function saveDrugEdit() {
    if (!validateDrugForm()) return
    const plan = currentPatientPlans.value.find((item) => item.id === drugDialogPlanId.value)
    if (!plan) return
    const nextDrug = buildDrugFromDrugForm(plan)
    const nextDrugs = [...plan.drugs]
    if (drugDialogMode.value === 'edit' && drugDialogIndex.value !== null) {
      nextDrugs.splice(drugDialogIndex.value, 1, nextDrug)
    } else {
      nextDrugs.push(nextDrug)
    }
    const updated = await updatePlanDrugs(plan, nextDrugs)
    if (!updated) return
    drugEditVisible.value = false
    ElMessage.success(drugDialogMode.value === 'add' ? '药品已添加' : '用药与提醒已保存')
  }

  async function removeCurrentDrug() {
    const plan = currentPatientPlans.value.find((item) => item.id === drugDialogPlanId.value)
    if (!plan || drugDialogIndex.value === null) return
    try {
      await ElMessageBox.confirm('确认停用该药品？保存后将从当前方案药品明细中移除。', '停用药品', {
        confirmButtonText: '停用',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const nextDrugs = plan.drugs.filter((_, index) => index !== drugDialogIndex.value)
      const updated = await updatePlanDrugs(plan, nextDrugs)
      if (!updated) return
      drugEditVisible.value = false
      ElMessage.success('药品已停用')
    } catch {
      // 用户取消时无需提示。
    }
  }

  function openRoutineDialog() {
    routineForm.breakfastTime = currentPatient.value.breakfastTime || ''
    routineForm.lunchTime = currentPatient.value.lunchTime || ''
    routineForm.dinnerTime = currentPatient.value.dinnerTime || ''
    routineForm.sleepTime = currentPatient.value.sleepTime || ''
    routineVisible.value = true
  }

  async function saveRoutine() {
    if (!currentPatient.value.id) return
    const updatedPatient = await patientApi.update({
      id: currentPatient.value.id,
      breakfastTime: routineForm.breakfastTime,
      lunchTime: routineForm.lunchTime,
      dinnerTime: routineForm.dinnerTime,
      sleepTime: routineForm.sleepTime,
      updatedAt: formatDateTime()
    })
    const index = patients.value.findIndex((patient) => patient.id === updatedPatient.id)
    if (index >= 0) {
      patients.value[index] = { ...patients.value[index], ...updatedPatient }
    }
    routineVisible.value = false
    ElMessage.success('作息时间已保存')
  }

  function buildDrugs(): Drug[] {
    return editForm.drugs.map((drug) => ({
      name: drug.name.trim(),
      specification: drug.specification.trim(),
      dose: drug.dose.trim(),
      frequency: drug.frequency.trim(),
      time: drug.time.trim(),
      guide: drug.guide.trim() || '请按处方和医药师建议执行，异常情况及时联系医药师。',
      startDate: editForm.startDate,
      endDate: editForm.endDate || null,
      durationDays: Number(drug.durationDays) || 30
    }))
  }

  function validateDrugRows() {
    if (!editForm.drugs.length) {
      ElMessage.warning('请至少添加一种药品')
      return false
    }
    const invalidIndex = editForm.drugs.findIndex(
      (drug) =>
        !drug.name.trim() || !drug.dose.trim() || !drug.frequency.trim() || !drug.time.trim()
    )
    if (invalidIndex >= 0) {
      ElMessage.warning(`请补齐第 ${invalidIndex + 1} 行药品名称、剂量、频次和服药时段`)
      return false
    }
    return true
  }

  function findDrugConflict(
    drugs: Drug[],
    options: { status?: string; ignorePlanId?: number } = {}
  ) {
    const targetStatus = options.status || editForm.status
    if (targetStatus !== '已生效') return null
    const targetKeys = new Set(drugs.flatMap((drug) => getDrugConflictKeys(drug)).filter(Boolean))
    for (const plan of activePlans.value) {
      if (plan.id === options.ignorePlanId) continue
      const conflictDrug = plan.drugs.find((drug) =>
        getDrugConflictKeys(drug).some((key) => targetKeys.has(key))
      )
      if (conflictDrug) {
        return {
          plan,
          drug: conflictDrug
        }
      }
    }
    return null
  }

  async function stopPlan(plan: Plan) {
    if (plan.status === '已停用') return
    try {
      const result = await ElMessageBox.prompt('请输入停用原因', '停用计划', {
        confirmButtonText: '停用',
        cancelButtonText: '取消',
        inputValue: '医药师手动停用',
        inputPlaceholder: '停用原因',
        type: 'warning'
      })
      await planApi.update({
        id: plan.id,
        status: '已停用',
        dispatchStatus: '已停用',
        dispatchType: 'info',
        stoppedAt: formatDateTime(),
        stopReason: result.value || '医药师手动停用'
      })
      ElMessage.success('用药计划已停用')
      await loadPlans()
      selectedPlanId.value = plan.id
      activePlanTab.value = getPlanTabName(plan.id)
    } catch {
      // 用户取消停用时无需提示。
    }
  }

  async function saveCreatePlan() {
    const formValid = await editFormRef.value?.validate().catch(() => false)
    if (!formValid || !validateDrugRows()) return

    const drugs = buildDrugs()
    const conflict = findDrugConflict(drugs)
    if (conflict) {
      ElMessage.warning(
        `与 ${conflict.plan.title} 的 ${conflict.drug.name} ${conflict.drug.time} 冲突，请保存为草稿或先停用旧计划`
      )
      return
    }

    const dispatch = getDispatchStatus()
    const savedPlan = await planApi.save({
      patientId: selectedPatientId.value,
      patientName: currentPatient.value.name,
      title: editForm.title,
      code: buildPlanCode(),
      period: buildPeriod(),
      startDate: editForm.startDate,
      endDate: editForm.endDate || null,
      status: editForm.status,
      dispatchStatus: dispatch.dispatchStatus,
      dispatchType: dispatch.dispatchType,
      generatedTasks: dispatch.generatedTasks,
      source: editForm.source,
      reminderCount: drugs.length,
      auditSummary: '请在下发前复核剂量、频次和患者过敏史',
      drugs
    })
    editVisible.value = false
    ElMessage.success('用药计划已创建')
    await loadPlans()
    selectedPlanId.value = savedPlan.id
    activePlanTab.value = getPlanTabName(savedPlan.id)
  }

  async function loadPatients() {
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

  async function loadPlans() {
    if (!selectedPatientId.value) return
    planLoading.value = true
    try {
      const result = await planApi.list({ page: 1, limit: 100, patientId: selectedPatientId.value })
      plans.value = result.records
      syncSelectedPlan()
    } finally {
      planLoading.value = false
    }
  }

  watch(selectedPatientId, () => {
    activePlanTab.value = 'timeline'
    loadPlans()
  })

  watch(activePlanTab, (value) => {
    if (value === 'timeline') return
    const planId = Number(String(value).replace('plan-', ''))
    if (!Number.isNaN(planId)) {
      selectedPlanId.value = planId
    }
  })

  watch(
    () => drugForm.dailyCount,
    () => {
      syncDrugReminderSlots()
    }
  )

  onMounted(async () => {
    await loadPatients()
    await loadPlans()
    maybeOpenCreateDialogFromRoute()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';

  .plan-list-grid {
    display: grid;
    gap: var(--pillbox-gap-sm);
  }

  .plan-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--pillbox-gap-sm);
    align-items: center;
    padding: 16px;
    background: var(--pillbox-surface);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);

    &.is-active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
  }

  .plan-card-main {
    min-width: 0;
  }

  .plan-card-actions {
    justify-content: flex-end;
  }

  .drug-edit-panel {
    width: 100%;
    min-width: 0;
  }

  .plan-tabs-card {
    :deep(.el-card__body) {
      padding-top: 14px;
    }
  }

  .plan-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 18px;
    }
  }

  .scheme-panel,
  .timeline-panel {
    display: grid;
    gap: var(--pillbox-gap);
    min-width: 0;
  }

  .scheme-header {
    display: flex;
    gap: var(--pillbox-gap-sm);
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;

    p {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--pillbox-text-muted);
    }
  }

  .scheme-title {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.3;
    color: var(--pillbox-text-strong);

    :deep(.svg-icon) {
      flex: none;
      font-size: 22px;
      color: var(--el-color-primary);
    }
  }

  .scheme-count {
    font-size: 14px;
    font-weight: 500;
    color: var(--pillbox-text-muted);
  }

  .scheme-status-row,
  .routine-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .medicine-card-list {
    display: grid;
    gap: var(--pillbox-gap-sm);
  }

  .medicine-card {
    display: grid;
    grid-template-columns:
      minmax(180px, 1fr)
      minmax(220px, 1.2fr)
      minmax(170px, 1fr)
      minmax(120px, 0.6fr)
      auto;
    gap: var(--pillbox-gap);
    align-items: center;
    min-width: 0;
    padding: 24px 28px;
    background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--pillbox-surface));
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  .medicine-field {
    display: grid;
    gap: 10px;
    min-width: 0;

    span {
      font-size: 14px;
      color: var(--pillbox-text-muted);
    }

    b {
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: 18px;
      line-height: 1.35;
      color: var(--pillbox-text-strong);
    }

    small {
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: 12px;
      color: var(--pillbox-text-muted);
    }
  }

  .medicine-name-field b {
    font-size: 20px;
    font-weight: 800;
  }

  .reminder-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .medicine-edit-button {
    min-width: 104px;
  }

  .timeline-list {
    display: grid;
    gap: var(--pillbox-gap-sm);
  }

  .timeline-group {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: var(--pillbox-gap);
    align-items: start;
    padding: 16px;
    background: var(--pillbox-surface);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  .timeline-time {
    display: grid;
    gap: 6px;
    color: var(--pillbox-text-muted);

    b {
      font-size: 22px;
      line-height: 1.2;
      color: var(--pillbox-text-strong);
    }

    span {
      font-size: 12px;
    }
  }

  .timeline-medicine-list {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .timeline-medicine {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 14px;
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);

    p {
      margin: 0;
      overflow-wrap: anywhere;
      font-size: 13px;
      color: var(--pillbox-text-muted);
    }
  }

  .timeline-medicine-top {
    display: flex;
    gap: var(--pillbox-gap-sm);
    align-items: center;
    justify-content: space-between;
    min-width: 0;

    b {
      min-width: 0;
      overflow-wrap: anywhere;
      color: var(--pillbox-text-strong);
    }
  }

  .timeline-medicine-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    font-size: 13px;
    color: var(--pillbox-text-regular);
  }

  .stopped-note {
    padding: 12px 14px;
    color: var(--pillbox-text-muted);
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  .reminder-edit-list {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  .reminder-edit-row {
    display: grid;
    grid-template-columns: 84px minmax(180px, 1fr) minmax(180px, 1fr);
    gap: var(--pillbox-gap-sm);
    align-items: center;
    min-width: 0;
    padding: 12px;
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  @media (max-width: 960px) {
    .plan-card {
      grid-template-columns: 1fr;
    }

    .plan-card-actions {
      justify-content: flex-start;
    }

    .scheme-header,
    .timeline-medicine-top {
      flex-direction: column;
      align-items: stretch;
    }

    .medicine-card,
    .timeline-group,
    .reminder-edit-row {
      grid-template-columns: 1fr;
    }
  }
</style>
