<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>新增患者建档</h2>
        <p>按步骤完成患者信息、设备绑定、用药计划和任务生成</p>
      </div>
      <ElTag type="primary" size="large">当前进度 {{ activeStep + 1 }}/4</ElTag>
    </div>

    <ElCard shadow="never">
      <ElSteps :active="activeStep" finish-status="success" align-center>
        <ElStep title="患者信息" description="建立基础档案" />
        <ElStep title="设备绑定" description="药盒设备" />
        <ElStep title="用药计划" description="药品和处方" />
        <ElStep title="确认建档" description="生成服药任务" />
      </ElSteps>
    </ElCard>

    <ElCard class="mt-4 create-step-card" :class="{ 'is-plain': activeStep === 2 }" shadow="never">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px">
        <template v-if="activeStep === 0">
          <h3 class="form-step-title">添加患者信息</h3>
          <p class="muted mb-4">先建立患者基础档案。</p>
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="12"
              ><ElFormItem label="患者姓名" prop="name"
                ><ElInput v-model="form.name" placeholder="请输入患者姓名" /></ElFormItem
            ></ElCol>
            <ElCol :xs="24" :md="12"
              ><ElFormItem label="手机号" prop="phone"
                ><ElInput v-model="form.phone" placeholder="请输入手机号" /></ElFormItem
            ></ElCol>
            <ElCol :xs="24" :md="12">
              <ElFormItem label="性别" prop="gender">
                <ElSelect v-model="form.gender" placeholder="请选择性别"
                  ><ElOption label="男" value="男" /><ElOption label="女" value="女"
                /></ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :md="12"
              ><ElFormItem label="出生年月日" prop="birthDate"
                ><ElDatePicker
                  v-model="form.birthDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择出生年月日"
                  :disabled-date="disableFutureDate" /></ElFormItem
            ></ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 2">
          <h3 class="form-step-title">处方核对</h3>
          <p class="muted mb-4">通过识别或搜索添加药品，确认药名、规格和数量。</p>
          <div class="create-form-section">
            <div class="drug-review-table-panel">
              <div class="review-table-toolbar">
                <div class="review-table-search">
                  <ElInput
                    v-model="drugKeyword"
                    size="large"
                    placeholder="搜索药品名称或拼音首字母"
                    clearable
                    @keyup.enter="openDrugSearchDialog"
                  >
                    <template #prefix>
                      <ArtSvgIcon icon="ri:search-line" />
                    </template>
                  </ElInput>
                  <ElButton type="primary" size="large" @click="openDrugSearchDialog">
                    <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
                    药品搜索
                  </ElButton>
                </div>
                <div class="review-table-actions">
                  <ElUpload
                    class="toolbar-upload"
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    :on-change="handlePrescriptionUpload"
                  >
                    <ElButton type="primary" :loading="recognitionLoading">
                      <template #icon><ArtSvgIcon icon="ri:upload-cloud-line" /></template>
                      智能识别
                    </ElButton>
                  </ElUpload>
                  <ElTag size="large"
                    >已确认 {{ confirmedDrugCount }}/{{ recognizedDrugs.length }}</ElTag
                  >
                </div>
              </div>

              <div v-if="recognizedFileName" class="recognition-result-note">
                已上传 {{ recognizedFileName }}，解析出 2 种药品
              </div>

              <ElTable
                class="drug-review-table"
                :data="recognizedDrugs"
                border
                empty-text="暂无药品，请先智能识别或药品搜索"
              >
                <ElTableColumn type="index" label="序号" width="70" />
                <ElTableColumn prop="name" label="药品名称" min-width="160" />
                <ElTableColumn prop="spec" label="规格" width="120" />
                <ElTableColumn prop="amount" label="数量" width="100" />
                <ElTableColumn label="生产厂家" min-width="150">
                  <template #default="{ row }">{{ row.manufacturer || '厂家待确认' }}</template>
                </ElTableColumn>
                <ElTableColumn label="来源" width="110">
                  <template #default="{ row }">
                    <ElTag size="small">{{ row.source || '识别来源' }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="状态" width="100">
                  <template #default="{ row }">
                    <ElTag :type="row.confirmed ? 'success' : 'warning'">
                      {{ row.confirmed ? '已确认' : '待核对' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="210" fixed="right">
                  <template #default="{ row, $index }">
                    <ElSpace>
                      <ElButton link type="primary" @click="toggleDrugConfirm($index)">
                        {{ row.confirmed ? '取消确认' : '确认' }}
                      </ElButton>
                      <ElButton link type="primary" @click="reselectDrug(row)">重选</ElButton>
                      <ElButton link type="danger" @click="removeRecognizedDrug($index)"
                        >删除</ElButton
                      >
                    </ElSpace>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>

            <ElDialog v-model="drugSearchDialogVisible" title="药品搜索结果" width="720px">
              <div class="keyword-search-dialog">
                <div class="keyword-search-row">
                  <ElInput
                    v-model="drugKeyword"
                    size="large"
                    placeholder="请输入药品名称或拼音首字母"
                    clearable
                    @keyup.enter="handleDrugSearch"
                  >
                    <template #prefix>
                      <ArtSvgIcon icon="ri:search-line" />
                    </template>
                  </ElInput>
                  <ElButton type="primary" size="large" @click="handleDrugSearch">
                    <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
                    搜索
                  </ElButton>
                </div>

                <ElAlert
                  v-if="drugSearchError"
                  class="keyword-search-alert"
                  type="warning"
                  :closable="false"
                  :title="drugSearchError"
                />

                <div v-if="drugSearchResults.length" class="keyword-result-list">
                  <div class="keyword-result-title"
                    >搜索结果 {{ lastDrugSearchKeyword ? `“${lastDrugSearchKeyword}”` : '' }}</div
                  >
                  <div v-for="drug in drugSearchResults" :key="drug.id" class="keyword-result-item">
                    <div class="keyword-drug-info">
                      <strong>{{ drug.name }}</strong>
                      <p>{{ drug.genericName }} · {{ drug.commonDosage }}</p>
                      <small>{{ drug.manufacturer || '药品库标准信息' }}</small>
                    </div>
                    <div class="keyword-drug-action">
                      <ElInputNumber
                        v-model="searchDrugQuantities[drug.id]"
                        :min="1"
                        :controls="false"
                        size="small"
                      />
                      <ElSelect v-model="searchDrugQuantityUnits[drug.id]" size="small">
                        <ElOption
                          v-for="unit in quantityUnits"
                          :key="unit"
                          :label="unit"
                          :value="unit"
                        />
                      </ElSelect>
                      <ElButton type="primary" size="small" @click="addDrugFromSearch(drug)"
                        >添加</ElButton
                      >
                    </div>
                  </div>
                </div>
                <div v-else class="keyword-search-hint">
                  点击搜索后，选择药品并确认数量加入清单。
                </div>
              </div>
            </ElDialog>
          </div>
        </template>

        <template v-if="activeStep === 1">
          <h3 class="form-step-title">绑定药盒设备</h3>
          <p class="muted mb-4">选择待绑定设备，保存后用于下发用药计划。</p>
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="12"
              ><ElFormItem label="药盒设备" prop="device"
                ><ElSelect v-model="form.device" placeholder="请选择药盒设备"
                  ><ElOption label="PBX-202605-021 待分配" value="PBX-202605-021" /><ElOption
                    label="暂不绑定"
                    value="暂不绑定" /></ElSelect></ElFormItem
            ></ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 3">
          <h3 class="form-step-title">用药方案确认</h3>
          <p class="muted mb-4">核对提醒时间、开始日期和预计截止时间，保存后生成服药任务。</p>
          <div class="medication-plan-layout">
            <div class="medication-picker-panel">
              <div class="panel-heading">
                <h4>药品选择</h4>
                <p>选择全部药品或单个药品查看用药信息。</p>
              </div>
              <button
                type="button"
                class="drug-select-card"
                :class="{ active: selectedPlanDrugId === 'all' }"
                @click="selectedPlanDrugId = 'all'"
              >
                <span class="drug-card-icon"><ArtSvgIcon icon="ri:time-line" /></span>
                <span class="drug-card-text">
                  <strong>全部药品</strong>
                  <small
                    >{{ recognizedDrugs.length }} 种药品 ·
                    {{ allReminderGroups.length }} 个时间点</small
                  >
                </span>
                <ArtSvgIcon v-if="selectedPlanDrugId === 'all'" icon="ri:checkbox-circle-line" />
              </button>

              <div v-if="recognizedDrugs.length" class="plan-drug-list">
                <button
                  v-for="drug in recognizedDrugs"
                  :key="`${drug.id}-plan`"
                  type="button"
                  class="drug-select-card"
                  :class="{ active: selectedPlanDrugId === drug.id }"
                  @click="selectedPlanDrugId = drug.id"
                >
                  <span class="drug-thumb">{{ getDrugInitial(drug.name) }}</span>
                  <span class="drug-card-text">
                    <strong>{{ drug.name }}*{{ drug.amount }}</strong>
                    <small>{{ drug.manufacturer || '厂家待确认' }}</small>
                  </span>
                  <ArtSvgIcon
                    v-if="selectedPlanDrugId === drug.id"
                    icon="ri:checkbox-circle-line"
                  />
                </button>
              </div>
              <div v-else class="plan-empty-state">
                <strong>暂无药品</strong>
                <p>请先在处方核对中录入药品。</p>
              </div>
            </div>

            <div class="medication-plan-panel">
              <div class="plan-panel-top">
                <div class="panel-heading">
                  <h4>{{ currentPlanTitle }}</h4>
                  <p>{{ currentPlanDescription }}</p>
                </div>
                <ElTag v-if="recognizedDrugs.length" size="large">{{ currentPlanSummary }}</ElTag>
              </div>

              <ElSegmented
                v-if="isAllPlanDrug"
                v-model="planView"
                class="plan-view-tabs"
                :options="planViews"
              />

              <div
                v-if="isAllPlanDrug && planView === '开始时间'"
                class="plan-pane start-date-pane"
              >
                <div class="start-date-card">
                  <ArtSvgIcon icon="ri:calendar-check-line" class="start-date-icon" />
                  <strong>统一开始执行时间</strong>
                  <div class="start-date-display">{{
                    formatStartExecutionDate(form.startDate)
                  }}</div>
                  <p>修改后同步应用到全部药品，并按当前疗程重新计算预计截止时间。</p>
                  <ElFormItem label="开始日期" prop="startDate">
                    <ElDatePicker
                      v-model="form.startDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择开始日期"
                    />
                  </ElFormItem>
                  <ElButton type="primary" @click="applyStartDateToAllDrugs"
                    >同步到全部药品</ElButton
                  >
                </div>
              </div>

              <div
                v-else-if="isAllPlanDrug && planView === '预计截止时间'"
                class="plan-pane end-date-pane"
              >
                <template v-if="recognizedDrugs.length">
                  <div
                    v-for="drug in recognizedDrugs"
                    :key="`${drug.id}-end`"
                    class="end-date-item"
                  >
                    <div class="end-date-value">
                      <small>预计截止时间</small>
                      <strong>{{ formatStartExecutionDate(getDrugExpectedEndDate(drug)) }}</strong>
                    </div>
                    <span class="drug-thumb">{{ getDrugInitial(drug.name) }}</span>
                    <div class="end-date-drug">
                      <strong>{{ drug.name }}</strong>
                      <p
                        >{{ drug.spec }} · 药品数量 {{ drug.amount }} · {{ drug.dosage }} ·
                        {{ drug.frequency }}</p
                      >
                    </div>
                  </div>
                </template>
                <div v-else class="plan-empty-state">
                  <strong>暂无截止时间</strong>
                  <p>录入药品后显示预计截止时间。</p>
                </div>
              </div>

              <div v-else class="plan-pane timeline-pane">
                <template v-if="reminderPreviewGroups.length">
                  <div class="timeline-list">
                    <div class="timeline-line"></div>
                    <div
                      v-for="group in reminderPreviewGroups"
                      :key="`${group.time}-${group.tag}`"
                      class="timeline-group"
                    >
                      <span class="timeline-dot"></span>
                      <div class="timeline-card">
                        <div class="timeline-heading">
                          <div>
                            <span class="timeline-time">{{ group.time }}</span>
                            <ElTag size="small" type="primary">{{ group.tag }}</ElTag>
                          </div>
                          <span>{{ group.medications.length }} 条</span>
                        </div>
                        <div class="timeline-drug-list">
                          <div
                            v-for="drug in group.medications"
                            :key="`${group.time}-${drug.id}`"
                            class="timeline-drug-item"
                          >
                            <span class="drug-thumb">{{ getDrugInitial(drug.name) }}</span>
                            <div class="timeline-drug-info">
                              <div class="timeline-drug-title">
                                <strong>{{ drug.name }}</strong>
                                <span>{{ drug.spec }}</span>
                                <ElButton
                                  text
                                  circle
                                  type="primary"
                                  @click="startMedicationUsageEdit(drug)"
                                >
                                  <ArtSvgIcon icon="ri:edit-2-line" />
                                </ElButton>
                              </div>
                              <p
                                >药品数量 {{ drug.amount }} · {{ drug.dosage }} ·
                                {{ drug.frequency }}</p
                              >
                              <button
                                v-if="getCurrentPrecaution(drug)"
                                type="button"
                                class="precaution-pill"
                                @click="cycleDrugPrecaution(drug.id)"
                              >
                                <span>用药指导：{{ getCurrentPrecaution(drug) }}</span>
                                <small>点击切换</small>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="plan-empty-state">
                  <strong>暂无用药时间轴</strong>
                  <p>完成处方核对后生成提醒时间。</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ElForm>
    </ElCard>

    <ElDialog v-model="usageDialogVisible" title="修改用药与提醒" width="720px">
      <div v-if="editingPlanDrug" class="usage-dialog-content">
        <p class="muted"
          >当前条目：{{ editingPlanDrug.name }}，时间点默认按说明书和常规作息生成，可逐次调整。</p
        >

        <div class="usage-dialog-section">
          <label>每次剂量</label>
          <div class="dosage-editor">
            <ElInput
              v-model="medicationUsageDraft.dosageValue"
              placeholder="例如 1"
              @input="sanitizeDosageDraft"
            />
            <ElSelect v-model="medicationUsageDraft.dosageUnit">
              <ElOption
                v-for="unit in medicationDosageUnits"
                :key="unit"
                :label="unit"
                :value="unit"
              />
            </ElSelect>
          </div>
        </div>

        <div class="usage-dialog-grid">
          <div class="usage-dialog-section">
            <label>开始日期</label>
            <ElDatePicker
              v-model="medicationUsageDraft.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始日期"
            />
          </div>
          <div class="usage-dialog-section">
            <label>疗程天数</label>
            <ElInput v-model="medicationUsageDraft.durationDays" placeholder="例如 30" />
          </div>
        </div>

        <div class="usage-dialog-section">
          <label>每日次数</label>
          <div class="frequency-options">
            <ElButton
              v-for="option in medicationUsageFrequencyOptions"
              :key="option.label"
              :type="medicationUsageDraft.frequency === option.label ? 'primary' : 'default'"
              @click="updateMedicationUsageFrequency(option.label)"
            >
              {{ option.label }}
            </ElButton>
          </div>
        </div>

        <div class="usage-dialog-section">
          <div class="dialog-section-heading">
            <label>每次提醒时间</label>
            <span>根据每日次数自动展开，保存后同步到预览。</span>
          </div>
          <div class="reminder-slot-list">
            <div
              v-for="(slot, index) in medicationUsageDraft.reminderSlots"
              :key="`${index}-${slot.time}`"
              class="reminder-slot-editor"
            >
              <strong>第 {{ index + 1 }} 次</strong>
              <ElInput v-model="slot.time" type="time" />
              <ElSegmented v-model="slot.tag" :options="reminderTimingSegmentOptions" />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="closeMedicationUsageEdit">取消</ElButton>
        <ElButton
          type="primary"
          :disabled="!canSaveMedicationUsage"
          @click="saveMedicationUsageEdit"
        >
          保存用药与提醒
        </ElButton>
      </template>
    </ElDialog>

    <ElCard class="mt-4" shadow="never">
      <div class="flex justify-end gap-3">
        <ElButton @click="router.push('/doctor/patients')">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消
        </ElButton>
        <ElButton :disabled="activeStep === 0" @click="activeStep--">
          <template #icon><ArtSvgIcon icon="ri:arrow-left-line" /></template>
          上一步
        </ElButton>
        <ElButton type="primary" @click="handleNext">
          <template #icon
            ><ArtSvgIcon :icon="activeStep === 3 ? 'ri:check-line' : 'ri:arrow-right-line'"
          /></template>
          {{ activeStep === 3 ? '完成建档' : '下一步' }}
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'

  defineOptions({ name: 'SmartPillboxPatientCreate' })

  const router = useRouter()
  const formRef = ref<FormInstance>()
  const activeStep = ref(0)
  const defaultMedicationDurationDays = 30
  const reminderTimingTagOptions = ['餐后', '餐前', '睡前', '空腹'] as const
  const reminderTimingSegmentOptions = reminderTimingTagOptions.map((tag) => ({
    label: tag,
    value: tag
  }))
  const medicationUsageFrequencyOptions = [
    { label: '每日1次', count: 1 },
    { label: '每日2次', count: 2 },
    { label: '每日3次', count: 3 },
    { label: '每日4次', count: 4 }
  ] as const
  const medicationDosageUnits = ['片/次', '粒/次', '袋/次', '支/次', 'ml/次'] as const
  const routineTimes = {
    breakfast: '07:30',
    lunch: '12:00',
    dinner: '18:30',
    sleep: '22:30'
  }
  const form = reactive({
    name: '',
    phone: '',
    gender: '男',
    birthDate: '',
    startDate: getDefaultStartDate(),
    device: 'PBX-202605-021'
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birthDate: [{ required: true, message: '请选择出生年月日', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    device: [{ required: true, message: '请选择药盒设备', trigger: 'change' }]
  }

  type ReminderTimingTag = (typeof reminderTimingTagOptions)[number]
  type MedicationDosageUnit = (typeof medicationDosageUnits)[number]

  type MedicationReminderSlot = {
    time: string
    tag: ReminderTimingTag
  }

  type RecognizedDrug = {
    id: string
    name: string
    genericName?: string
    spec: string
    amount: string
    usage: string
    dosage: string
    frequency: string
    timingMeals: string
    startDate: string
    endDate: string | null
    durationDays: number
    reminderSlots: MedicationReminderSlot[]
    confirmed: boolean
    manufacturer?: string
    source?: string
    precautionOptions: string[]
    precautionIndex: number
  }

  type DrugDatabaseEntry = {
    id: string
    name: string
    genericName: string
    specifications: string[]
    commonDosage: string
    frequency: string
    timingMeals: string
    manufacturer?: string
    keywords: string[]
  }

  type ReminderPreviewGroup = {
    time: string
    tag: ReminderTimingTag
    medications: RecognizedDrug[]
  }

  type MedicationUsageDraft = {
    dosageValue: string
    dosageUnit: MedicationDosageUnit
    frequency: string
    startDate: string
    durationDays: string
    reminderSlots: MedicationReminderSlot[]
  }

  const mockDrugDatabase: DrugDatabaseEntry[] = [
    {
      id: 'drug-001',
      name: '阿司匹林肠溶片',
      genericName: '阿司匹林',
      specifications: ['25mg', '100mg', '300mg'],
      commonDosage: '100mg',
      frequency: '每日1次',
      timingMeals: '饭后服用',
      manufacturer: '拜耳医药',
      keywords: ['aspirin', 'aspl', 'asplcpy', 'a']
    },
    {
      id: 'drug-002',
      name: '阿托伐他汀钙片',
      genericName: '阿托伐他汀',
      specifications: ['10mg', '20mg', '40mg'],
      commonDosage: '20mg',
      frequency: '每日1次',
      timingMeals: '睡前服用',
      manufacturer: '辉瑞制药',
      keywords: ['atorvastatin', 'atftt', 'atfttgp', 'a']
    },
    {
      id: 'drug-003',
      name: '硝苯地平控释片',
      genericName: '硝苯地平',
      specifications: ['30mg', '60mg'],
      commonDosage: '30mg',
      frequency: '每日1次',
      timingMeals: '空腹整片吞服',
      manufacturer: '拜耳医药',
      keywords: ['nifedipine', 'xbdp', 'xbdpksp', 'x']
    },
    {
      id: 'drug-004',
      name: '二甲双胍缓释片',
      genericName: '二甲双胍',
      specifications: ['500mg', '750mg', '1000mg'],
      commonDosage: '500mg',
      frequency: '每日2次',
      timingMeals: '随餐服用',
      manufacturer: '施贵宝制药',
      keywords: ['metformin', 'ejsg', 'ejsghsp', 'e']
    },
    {
      id: 'drug-005',
      name: '阿卡波糖片',
      genericName: '阿卡波糖',
      specifications: ['50mg', '100mg'],
      commonDosage: '50mg',
      frequency: '每日3次',
      timingMeals: '随第一口饭服用',
      manufacturer: '拜耳医药',
      keywords: ['acarbose', 'akbt', 'akbtp', 'a']
    },
    {
      id: 'drug-006',
      name: '苯磺酸氨氯地平片',
      genericName: '氨氯地平',
      specifications: ['5mg', '10mg'],
      commonDosage: '5mg',
      frequency: '每日1次',
      timingMeals: '餐前或餐后均可',
      manufacturer: '辉瑞制药',
      keywords: ['amlodipine', 'aldp', 'bhsaldpp', 'b']
    }
  ]

  const samplePrescriptionDrugs: RecognizedDrug[] = [
    createRecognizedDrug(mockDrugDatabase[2]!, '1盒', '图片识别'),
    createRecognizedDrug(mockDrugDatabase[3]!, '2盒', '图片识别')
  ]

  const recognitionLoading = ref(false)
  const recognizedFileName = ref('')
  const drugSearchDialogVisible = ref(false)
  const drugKeyword = ref('')
  const drugSearchError = ref('')
  const lastDrugSearchKeyword = ref('')
  const drugSearchResults = ref<DrugDatabaseEntry[]>([])
  const quantityUnits = ['盒', '瓶', '板', '袋', '支', '片', '粒']
  const searchDrugQuantities = reactive<Record<string, number>>({})
  const searchDrugQuantityUnits = reactive<Record<string, string>>({})
  const planViews = ['用药时间轴', '开始时间', '预计截止时间']
  const planView = ref(planViews[0])
  const selectedPlanDrugId = ref<'all' | string>('all')
  const recognizedDrugs = ref<RecognizedDrug[]>([])
  const usageDialogVisible = ref(false)
  const editingPlanDrugId = ref('')
  const medicationUsageDraft = reactive<MedicationUsageDraft>({
    dosageValue: '',
    dosageUnit: '片/次',
    frequency: '',
    startDate: '',
    durationDays: '',
    reminderSlots: []
  })
  const confirmedDrugCount = computed(
    () => recognizedDrugs.value.filter((drug) => drug.confirmed).length
  )
  const allReminderGroups = computed(() => buildReminderPreviewGroups(recognizedDrugs.value))
  const selectedPlanDrug = computed(
    () => recognizedDrugs.value.find((drug) => drug.id === selectedPlanDrugId.value) ?? null
  )
  const isAllPlanDrug = computed(() => selectedPlanDrugId.value === 'all')
  const visiblePlanDrugs = computed(() =>
    selectedPlanDrug.value ? [selectedPlanDrug.value] : recognizedDrugs.value
  )
  const reminderPreviewGroups = computed(() => buildReminderPreviewGroups(visiblePlanDrugs.value))
  const currentPlanTitle = computed(() => {
    if (selectedPlanDrug.value) {
      return `${selectedPlanDrug.value.name} · ${formatMedicationPeriodLabel(
        selectedPlanDrug.value.startDate,
        getDrugExpectedEndDate(selectedPlanDrug.value)
      )}`
    }
    return '全部药品'
  })
  const currentPlanDescription = computed(() =>
    selectedPlanDrug.value
      ? '可继续修改用法用量、用药时间和用药指导信息。'
      : planView.value === '开始时间'
        ? '统一设置全部药品的开始执行时间，并同步重算预计截止时间。'
        : planView.value === '预计截止时间'
          ? '查看每个药品的预计截止时间。'
          : '按时间汇总全部药品，便于保存前确认。'
  )
  const currentPlanSummary = computed(() =>
    selectedPlanDrug.value
      ? `共 ${reminderPreviewGroups.value.length} 个时间点 · 1 种药品`
      : `共 ${allReminderGroups.value.length} 个时间点 · ${recognizedDrugs.value.length} 种药品`
  )
  const editingPlanDrug = computed(
    () => recognizedDrugs.value.find((drug) => drug.id === editingPlanDrugId.value) ?? null
  )
  const canSaveMedicationUsage = computed(() => {
    const durationDays = Number(medicationUsageDraft.durationDays)
    return Boolean(
      medicationUsageDraft.dosageValue.trim() &&
      medicationUsageDraft.frequency.trim() &&
      medicationUsageDraft.startDate.trim() &&
      Number.isInteger(durationDays) &&
      durationDays > 0 &&
      medicationUsageDraft.reminderSlots.length &&
      medicationUsageDraft.reminderSlots.every((slot) => slot.time.trim() && slot.tag.trim())
    )
  })
  const stepFields: Record<number, string[]> = {
    0: ['name', 'phone', 'gender', 'birthDate'],
    1: ['device'],
    2: [],
    3: ['startDate']
  }

  const disableFutureDate = (date: Date) => date.getTime() > Date.now()

  function formatDateKey(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')
  }

  function parseDateKey(dateKey: string) {
    return new Date(`${dateKey}T00:00:00`)
  }

  function getDefaultStartDate() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDateKey(tomorrow)
  }

  function getMedicationEndDate(startDate: string, durationDays: number) {
    const start = parseDateKey(startDate)
    if (Number.isNaN(start.getTime()) || !Number.isInteger(durationDays) || durationDays <= 0) {
      return null
    }

    const end = new Date(start)
    end.setDate(start.getDate() + durationDays - 1)
    return formatDateKey(end)
  }

  function formatWeekday(date: Date) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  }

  function formatStartExecutionDate(dateKey: string | null) {
    if (!dateKey) return '待确认'
    const date = parseDateKey(dateKey)
    if (Number.isNaN(date.getTime())) return dateKey
    return `${date.getMonth() + 1}月${date.getDate()}日 ${formatWeekday(date)}`
  }

  function formatMedicationPeriodDate(dateKey: string | null) {
    if (!dateKey) return '待确认'
    const date = parseDateKey(dateKey)
    if (Number.isNaN(date.getTime())) return dateKey
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  function formatMedicationPeriodLabel(startDate: string, endDate: string | null) {
    if (!startDate.trim()) return '用药时间待确认'
    if (!endDate) return `${formatMedicationPeriodDate(startDate)}起`
    return `${formatMedicationPeriodDate(startDate)}至${formatMedicationPeriodDate(endDate)}`
  }

  const inferDrugQuantityUnit = (drug: DrugDatabaseEntry) => {
    const label = `${drug.name} ${drug.genericName} ${drug.specifications.join(' ')}`
    if (/颗粒|散|袋/.test(label)) return '袋'
    if (/口服液|糖浆|滴剂|瓶/.test(label)) return '瓶'
    if (/支|软膏|凝胶/.test(label)) return '支'
    return '盒'
  }

  const normalizeDrugSearchText = (value: string) => value.trim().toLowerCase()

  function inferDrugDosage(drug: DrugDatabaseEntry) {
    const label = `${drug.name}${drug.genericName}`
    if (/胶囊|丸/.test(label)) return '1粒/次'
    if (/颗粒|散|袋/.test(label)) return '1袋/次'
    if (/口服液|糖浆|滴剂/.test(label)) return '5ml/次'
    return '1片/次'
  }

  function parseMedicationDosage(dosage: string) {
    const matchedUnit = medicationDosageUnits
      .slice()
      .sort((left, right) => right.length - left.length)
      .find((unit) => dosage.endsWith(unit))

    if (!matchedUnit) {
      return { value: dosage || '1', unit: '片/次' as MedicationDosageUnit }
    }

    return {
      value: dosage.slice(0, -matchedUnit.length).trim() || '1',
      unit: matchedUnit
    }
  }

  function formatMedicationDosage(value: string, unit: MedicationDosageUnit) {
    return `${value.trim()}${unit}`
  }

  function getFrequencyReminderCount(frequency: string) {
    const exactCount = medicationUsageFrequencyOptions.find(
      (option) => option.label === frequency
    )?.count
    if (exactCount) return exactCount

    const normalized = frequency.replace(/\s/g, '')
    if (/[4四]/.test(normalized)) return 4
    if (/[3三]/.test(normalized)) return 3
    if (/[2二两]/.test(normalized)) return 2
    return 1
  }

  function subtractMinutes(time: string, minutes: number) {
    const [hour = '0', minute = '0'] = time.split(':')
    const total = Math.max(0, Number(hour) * 60 + Number(minute) - minutes)
    const nextHour = Math.floor(total / 60)
    const nextMinute = total % 60
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
  }

  function normalizeReminderTag(timingMeals: string, reminderCount: number): ReminderTimingTag {
    const value = timingMeals.trim()
    if (value.includes('睡前')) return reminderCount === 1 ? '睡前' : '餐后'
    if (value.includes('餐前') || value.includes('饭前')) return '餐前'
    if (value.includes('空腹')) return '空腹'
    return '餐后'
  }

  function getDefaultReminderTimes(reminderCount: number, tag: ReminderTimingTag) {
    if (tag === '睡前' && reminderCount === 1) return [routineTimes.sleep]
    const mealTimes =
      reminderCount >= 4
        ? [routineTimes.breakfast, routineTimes.lunch, routineTimes.dinner, routineTimes.sleep]
        : reminderCount === 3
          ? [routineTimes.breakfast, routineTimes.lunch, routineTimes.dinner]
          : reminderCount === 2
            ? [routineTimes.breakfast, routineTimes.dinner]
            : [routineTimes.breakfast]

    if (tag === '餐前') return mealTimes.map((time) => subtractMinutes(time, 30))
    return mealTimes
  }

  function buildReminderTimes(drug: Pick<RecognizedDrug, 'frequency' | 'timingMeals'>) {
    const reminderCount = getFrequencyReminderCount(drug.frequency)
    const tag = normalizeReminderTag(drug.timingMeals, reminderCount)
    return getDefaultReminderTimes(reminderCount, tag).map((time) => ({ time, tag }))
  }

  function inferPrecautionOptions(
    drug: Pick<RecognizedDrug, 'name' | 'genericName' | 'timingMeals'>
  ) {
    const label = `${drug.name}${drug.genericName || ''}${drug.timingMeals}`
    if (/他汀/.test(label)) return ['睡前服用效果更稳定', '出现肌肉疼痛应及时就医', '避免大量饮酒']
    if (/二甲双胍/.test(label))
      return ['随餐服用可减少胃肠不适', '肾功能异常需先咨询医生', '避免空腹大量饮酒']
    if (/硝苯地平|氨氯地平/.test(label)) {
      return ['每日固定时间服用', '如出现头晕或水肿需反馈', '勿自行加量或停药']
    }
    if (/阿司匹林/.test(label))
      return ['餐后服用可减少胃部刺激', '留意牙龈或皮肤出血', '手术前需告知医生']
    if (/空腹/.test(label)) return ['按说明空腹服用', '服药后如有不适及时反馈', '保持固定服药时间']
    return ['按医嘱固定时间服用', '漏服后按医生指导处理', '出现不适及时联系药师']
  }

  function createRecognizedDrug(
    drug: DrugDatabaseEntry,
    amount: string,
    source = '药品库'
  ): RecognizedDrug {
    const startDate = form.startDate || getDefaultStartDate()
    const durationDays = defaultMedicationDurationDays
    const baseDrug = {
      id: drug.id,
      name: drug.name,
      genericName: drug.genericName,
      spec: drug.commonDosage || drug.specifications[0] || '规格待确认',
      amount,
      dosage: inferDrugDosage(drug),
      frequency: drug.frequency,
      timingMeals: drug.timingMeals
    }

    return {
      ...baseDrug,
      usage: `${baseDrug.frequency} · ${baseDrug.timingMeals}`,
      startDate,
      endDate: getMedicationEndDate(startDate, durationDays),
      durationDays,
      reminderSlots: buildReminderTimes(baseDrug),
      confirmed: false,
      manufacturer: drug.manufacturer,
      source,
      precautionOptions: inferPrecautionOptions(baseDrug),
      precautionIndex: 0
    }
  }

  function buildReminderPreviewGroups(sourceDrugs: RecognizedDrug[]) {
    const byKey = new Map<string, ReminderPreviewGroup>()
    sourceDrugs.forEach((drug) => {
      const slots = drug.reminderSlots.length ? drug.reminderSlots : buildReminderTimes(drug)
      slots.forEach((slot) => {
        const key = `${slot.time}|${slot.tag}`
        const existing = byKey.get(key)
        if (existing) {
          existing.medications.push(drug)
        } else {
          byKey.set(key, { time: slot.time, tag: slot.tag, medications: [drug] })
        }
      })
    })

    return Array.from(byKey.values()).sort((left, right) => left.time.localeCompare(right.time))
  }

  function getDrugExpectedEndDate(drug: RecognizedDrug) {
    return getMedicationEndDate(drug.startDate, drug.durationDays) || drug.endDate
  }

  function getDrugInitial(name: string) {
    return name.trim().slice(0, 1) || '药'
  }

  const addRecognizedDrugs = (drugs: RecognizedDrug[]) => {
    let addedCount = 0
    const nextDrugs = [...recognizedDrugs.value]

    drugs.forEach((drug) => {
      const duplicated = nextDrugs.some(
        (item) => item.name === drug.name && item.spec === drug.spec
      )
      if (!duplicated) {
        nextDrugs.push({
          ...drug,
          reminderSlots: drug.reminderSlots.map((slot) => ({ ...slot })),
          precautionOptions: [...drug.precautionOptions]
        })
        addedCount += 1
      }
    })

    recognizedDrugs.value = nextDrugs
    if (recognizedDrugs.value.length && selectedPlanDrugId.value !== 'all') {
      const selectedExists = recognizedDrugs.value.some(
        (drug) => drug.id === selectedPlanDrugId.value
      )
      if (!selectedExists) selectedPlanDrugId.value = 'all'
    }
    return addedCount
  }

  const handlePrescriptionUpload = (file: UploadFile) => {
    recognitionLoading.value = true
    recognizedFileName.value = file.name || '处方图片'
    const addedCount = addRecognizedDrugs(samplePrescriptionDrugs)
    recognitionLoading.value = false
    ElMessage.success(
      addedCount
        ? `已解析 ${samplePrescriptionDrugs.length} 种药品，新增 ${addedCount} 种`
        : '图片中的药品已在清单中'
    )
  }

  const handleDrugSearch = () => {
    const keyword = normalizeDrugSearchText(drugKeyword.value)
    drugSearchResults.value = []
    drugSearchError.value = ''
    lastDrugSearchKeyword.value = drugKeyword.value.trim()

    if (!keyword) {
      drugSearchError.value = '请输入药品关键词。'
      return
    }

    const results = mockDrugDatabase.filter((drug) =>
      [drug.name, drug.genericName, ...drug.keywords].some((label) =>
        normalizeDrugSearchText(label).includes(keyword)
      )
    )

    drugSearchResults.value = results
    results.forEach((drug) => {
      searchDrugQuantities[drug.id] = searchDrugQuantities[drug.id] || 1
      searchDrugQuantityUnits[drug.id] =
        searchDrugQuantityUnits[drug.id] || inferDrugQuantityUnit(drug)
    })

    if (!results.length) {
      drugSearchError.value = '未找到匹配药品，请更换关键词。'
    }
  }

  const addDrugFromSearch = (drug: DrugDatabaseEntry) => {
    const quantity = searchDrugQuantities[drug.id] || 1
    const unit = searchDrugQuantityUnits[drug.id] || inferDrugQuantityUnit(drug)
    const addedCount = addRecognizedDrugs([createRecognizedDrug(drug, `${quantity}${unit}`)])
    if (!addedCount) {
      ElMessage.warning('清单中已有该药品')
      return
    }
    ElMessage.success(`已添加 ${drug.name}`)
  }

  const openDrugSearchDialog = () => {
    drugSearchDialogVisible.value = true
    handleDrugSearch()
  }

  const toggleDrugConfirm = (index: number) => {
    const drug = recognizedDrugs.value[index]
    if (!drug) return
    drug.confirmed = !drug.confirmed
  }

  const removeRecognizedDrug = (index: number) => {
    const [removedDrug] = recognizedDrugs.value.splice(index, 1)
    if (removedDrug?.id === selectedPlanDrugId.value) selectedPlanDrugId.value = 'all'
    if (removedDrug?.id === editingPlanDrugId.value) closeMedicationUsageEdit()
  }

  const reselectDrug = (drug: RecognizedDrug) => {
    drugKeyword.value = drug.name
    openDrugSearchDialog()
  }

  const getCurrentPrecaution = (drug: RecognizedDrug) => {
    if (!drug.precautionOptions.length) return ''
    return drug.precautionOptions[drug.precautionIndex] || drug.precautionOptions[0]
  }

  const cycleDrugPrecaution = (drugId: string) => {
    const drug = recognizedDrugs.value.find((item) => item.id === drugId)
    if (!drug || drug.precautionOptions.length <= 1) return
    drug.precautionIndex = (drug.precautionIndex + 1) % drug.precautionOptions.length
  }

  const applyStartDateToAllDrugs = () => {
    if (!form.startDate) {
      ElMessage.warning('请先选择开始日期')
      return
    }

    recognizedDrugs.value = recognizedDrugs.value.map((drug) => ({
      ...drug,
      startDate: form.startDate,
      endDate: getMedicationEndDate(form.startDate, drug.durationDays)
    }))
    ElMessage.success('已同步开始日期到全部药品')
  }

  const sanitizeDosageDraft = () => {
    medicationUsageDraft.dosageValue = medicationUsageDraft.dosageValue.replace(/[^\d.]/g, '')
  }

  const resetMedicationUsageDraft = () => {
    medicationUsageDraft.dosageValue = ''
    medicationUsageDraft.dosageUnit = '片/次'
    medicationUsageDraft.frequency = ''
    medicationUsageDraft.startDate = ''
    medicationUsageDraft.durationDays = ''
    medicationUsageDraft.reminderSlots = []
  }

  const startMedicationUsageEdit = (drug: RecognizedDrug) => {
    const parsedDosage = parseMedicationDosage(drug.dosage)
    editingPlanDrugId.value = drug.id
    medicationUsageDraft.dosageValue = parsedDosage.value
    medicationUsageDraft.dosageUnit = parsedDosage.unit
    medicationUsageDraft.frequency = drug.frequency
    medicationUsageDraft.startDate = drug.startDate || form.startDate || getDefaultStartDate()
    medicationUsageDraft.durationDays = String(drug.durationDays || defaultMedicationDurationDays)
    medicationUsageDraft.reminderSlots = drug.reminderSlots.map((slot) => ({ ...slot }))
    usageDialogVisible.value = true
  }

  const closeMedicationUsageEdit = () => {
    usageDialogVisible.value = false
    editingPlanDrugId.value = ''
    resetMedicationUsageDraft()
  }

  const updateMedicationUsageFrequency = (frequency: string) => {
    medicationUsageDraft.frequency = frequency
    const sourceDrug = editingPlanDrug.value
    if (!sourceDrug) return

    const nextSlots = buildReminderTimes({
      ...sourceDrug,
      frequency
    })
    medicationUsageDraft.reminderSlots =
      nextSlots.length === medicationUsageDraft.reminderSlots.length
        ? medicationUsageDraft.reminderSlots
        : nextSlots.map((slot) => ({ ...slot }))
  }

  const saveMedicationUsageEdit = () => {
    if (!editingPlanDrugId.value || !canSaveMedicationUsage.value) return

    const durationDays = Number(medicationUsageDraft.durationDays)
    const dosage = formatMedicationDosage(
      medicationUsageDraft.dosageValue,
      medicationUsageDraft.dosageUnit
    )
    const reminderSlots = medicationUsageDraft.reminderSlots.map((slot) => ({
      time: slot.time.trim(),
      tag: slot.tag
    }))
    const timingMeals = reminderSlots[0]?.tag || editingPlanDrug.value?.timingMeals || '餐后'

    recognizedDrugs.value = recognizedDrugs.value.map((drug) =>
      drug.id === editingPlanDrugId.value
        ? {
            ...drug,
            dosage,
            frequency: medicationUsageDraft.frequency,
            timingMeals,
            usage: `${medicationUsageDraft.frequency} · ${timingMeals}`,
            startDate: medicationUsageDraft.startDate,
            durationDays,
            endDate: getMedicationEndDate(medicationUsageDraft.startDate, durationDays),
            reminderSlots
          }
        : drug
    )
    closeMedicationUsageEdit()
    ElMessage.success('已更新用药与提醒')
  }

  const calculateAge = (birthDate: string) => {
    const birthday = new Date(`${birthDate}T00:00:00`)
    if (Number.isNaN(birthday.getTime())) return 0

    const today = new Date()
    let age = today.getFullYear() - birthday.getFullYear()
    const hasBirthdayPassed =
      today.getMonth() > birthday.getMonth() ||
      (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate())

    if (!hasBirthdayPassed) {
      age -= 1
    }

    return Math.max(age, 0)
  }

  const generatePatientNo = () => {
    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('')
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('')

    return `PAT-${date}-${time}`
  }

  const getNextReminderLabel = () => {
    const firstGroup = allReminderGroups.value[0]
    if (!firstGroup) return '待生成'
    return `${formatMedicationPeriodDate(form.startDate)} ${firstGroup.time} · ${firstGroup.medications.length} 条`
  }

  const buildMedicationPlanPayload = () => ({
    startDate: form.startDate,
    medications: recognizedDrugs.value.map((drug) => ({
      id: drug.id,
      name: drug.name,
      genericName: drug.genericName,
      specification: drug.spec,
      quantity: drug.amount,
      dosage: drug.dosage,
      frequency: drug.frequency,
      timingMeals: drug.timingMeals,
      startDate: drug.startDate,
      endDate: getDrugExpectedEndDate(drug),
      durationDays: drug.durationDays,
      reminders: drug.reminderSlots,
      precaution: getCurrentPrecaution(drug)
    })),
    reminderGroups: allReminderGroups.value.map((group) => ({
      time: group.time,
      tag: group.tag,
      medicationNames: group.medications.map((drug) => drug.name)
    }))
  })

  const validateCurrentStep = async () => {
    const fields = stepFields[activeStep.value] ?? []
    if (activeStep.value === 2) {
      if (!recognizedDrugs.value.length) {
        ElMessage.warning('请先识别或搜索添加药品')
        return false
      }
      if (confirmedDrugCount.value < recognizedDrugs.value.length) {
        ElMessage.warning('请逐条确认药品清单')
        return false
      }
    }
    if (activeStep.value === 3) {
      if (!recognizedDrugs.value.length) {
        ElMessage.warning('请先完成处方核对')
        return false
      }
      if (!form.startDate) {
        planView.value = '开始时间'
      }
    }
    if (!fields.length || !formRef.value) return true
    try {
      await Promise.all(fields.map((field) => formRef.value?.validateField(field)))
      return true
    } catch {
      return false
    }
  }

  const handleNext = async () => {
    const canContinue = await validateCurrentStep()
    if (!canContinue) return
    if (activeStep.value < 3) {
      activeStep.value += 1
      if (activeStep.value === 3) {
        planView.value = '用药时间轴'
        selectedPlanDrugId.value = 'all'
      }
      return
    }
    const medicationPlan = buildMedicationPlanPayload()
    await patientApi.save({
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      birthDate: form.birthDate,
      age: calculateAge(form.birthDate),
      recordNo: generatePatientNo(),
      diseases: [],
      deviceNo: form.device,
      deviceStatus: form.device === '暂不绑定' ? '未绑定' : '在线',
      deviceStatusType: form.device === '暂不绑定' ? 'warning' : 'success',
      consent: '未同意',
      child: '待绑定',
      nextReminder: getNextReminderLabel(),
      todayDrugs: recognizedDrugs.value.length,
      recentInteraction: '-',
      completionRate: 0,
      medicationPlan,
      taskRisk: allReminderGroups.value.length ? '服药任务待下发' : '待生成任务'
    })
    ElMessage.success('已完成患者建档，系统将生成服药任务')
    router.push('/doctor/patients')
  }
</script>

<style lang="scss" scoped>
  @use '../../style';

  .create-form-section {
    padding: 16px 0 8px;
    border-top: 1px solid var(--el-border-color-lighter);

    &:first-of-type {
      padding-top: 0;
      border-top: 0;
    }
  }

  .create-step-card.is-plain {
    border: 0;
    background: transparent;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .section-heading {
    margin-bottom: 14px;
    color: var(--art-gray-900);
    font-size: 15px;
    font-weight: 700;
  }

  .section-heading-with-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    small {
      color: var(--art-gray-500);
      font-size: 13px;
      font-weight: 400;
    }
  }

  .drug-review-table-panel {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .review-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;

    .panel-heading {
      margin-bottom: 0;
    }
  }

  .review-table-search {
    width: min(520px, 100%);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }

  .review-table-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }

  .toolbar-upload {
    display: inline-flex;

    :deep(.el-upload) {
      display: inline-flex;
    }
  }

  .drug-review-table {
    margin-top: 14px;
  }

  .keyword-search-dialog {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .medication-recognition {
    display: grid;
    grid-template-columns: minmax(280px, 0.82fr) minmax(420px, 1.18fr);
    gap: 16px;
  }

  .recognition-panel,
  .drug-review-panel {
    min-height: 300px;
    padding: 18px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .panel-heading {
    margin-bottom: 14px;

    h4 {
      margin: 0;
      color: var(--art-gray-900);
      font-size: 18px;
      font-weight: 700;
      line-height: 1.4;
    }

    p {
      margin: 6px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .drug-review-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .recognition-mode-body {
    margin-top: 18px;
  }

  .recognition-upload {
    display: block;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      min-height: 236px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--el-fill-color-extra-light);
    }
  }

  .upload-icon {
    color: var(--el-color-primary);
    font-size: 40px;
  }

  .upload-title {
    margin-top: 14px;
    color: var(--art-gray-900);
    font-size: 18px;
    font-weight: 700;
  }

  .upload-desc {
    margin-top: 8px;
    color: var(--art-gray-500);
  }

  .upload-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 18px;
  }

  .recognition-result-note {
    margin-top: 12px;
    color: var(--el-color-success);
    font-size: 13px;
  }

  .keyword-search-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    margin-bottom: 14px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .keyword-search-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
  }

  .keyword-search-alert {
    margin: 0;
  }

  .keyword-search-hint {
    padding: 16px;
    color: var(--art-gray-500);
    font-size: 13px;
    text-align: center;
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .keyword-result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 286px;
    overflow-y: auto;
  }

  .keyword-result-title {
    color: var(--art-gray-900);
    font-size: 13px;
    font-weight: 700;
  }

  .keyword-result-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .keyword-drug-info {
    min-width: 0;

    strong {
      color: var(--art-gray-900);
    }

    p,
    small {
      display: block;
      margin: 6px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
    }
  }

  .keyword-drug-action {
    display: grid;
    grid-template-columns: 64px 70px auto;
    align-items: center;
    gap: 8px;

    :deep(.el-input-number) {
      width: 64px;
    }

    :deep(.el-select) {
      width: 70px;
    }
  }

  .drug-review-body {
    min-height: 252px;
    padding: 14px 18px;
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .recognized-drug-item {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: 0;
    }
  }

  .drug-order {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-primary);
    font-weight: 700;
    border-radius: 50%;
    background: var(--el-color-primary-light-9);
  }

  .drug-main-info {
    strong {
      color: var(--art-gray-900);
    }

    p {
      margin: 6px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
    }
  }

  .drug-tags,
  .drug-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drug-tags {
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .drug-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .empty-drug-list {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    strong {
      color: var(--art-gray-900);
      font-size: 18px;
    }

    p {
      margin: 8px 0 0;
      color: var(--art-gray-500);
    }
  }

  .medication-plan-layout {
    display: grid;
    grid-template-columns: minmax(280px, 0.72fr) minmax(520px, 1.28fr);
    gap: 16px;
  }

  .medication-picker-panel,
  .medication-plan-panel {
    min-height: 520px;
    padding: 20px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .medication-picker-panel {
    display: flex;
    flex-direction: column;
  }

  .drug-select-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    margin-bottom: 10px;
    text-align: left;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .drug-card-icon,
  .drug-thumb {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--el-color-primary);
    font-weight: 700;
    border-radius: 8px;
    background: var(--el-color-primary-light-9);
  }

  .drug-thumb {
    color: #fff;
    background: linear-gradient(180deg, #7c5cff 0%, #4f7cff 100%);
  }

  .drug-card-text {
    min-width: 0;
    flex: 1;

    strong {
      display: block;
      overflow: hidden;
      color: var(--art-gray-900);
      font-size: 15px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      display: block;
      margin-top: 4px;
      overflow: hidden;
      color: var(--art-gray-500);
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .plan-drug-list {
    margin-top: 14px;
    overflow-y: auto;
  }

  .plan-panel-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .plan-view-tabs {
    width: 100%;
    margin-bottom: 16px;
  }

  .plan-pane {
    min-height: 390px;
    padding: 18px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .start-date-pane {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .start-date-card {
    width: min(420px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    strong {
      margin-top: 8px;
      color: var(--art-gray-900);
      font-size: 18px;
    }

    p {
      margin: 8px 0 18px;
      color: var(--art-gray-500);
      font-size: 13px;
      line-height: 1.6;
    }

    .start-date-display {
      margin-top: 10px;
      color: var(--art-gray-900);
      font-size: 28px;
      font-weight: 700;
    }

    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 14px;
    }

    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  .start-date-icon {
    color: var(--el-color-primary);
    font-size: 36px;
  }

  .end-date-pane {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .end-date-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);

    strong {
      color: var(--art-gray-900);
    }

    p {
      margin: 6px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
    }
  }

  .end-date-value {
    width: 132px;
    flex-shrink: 0;

    small {
      color: var(--art-gray-500);
    }

    strong {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
  }

  .end-date-drug {
    min-width: 0;
  }

  .timeline-pane {
    overflow: hidden;
  }

  .timeline-list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-left: 34px;
  }

  .timeline-line {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 10px;
    width: 1px;
    background: var(--el-color-primary-light-7);
  }

  .timeline-group {
    position: relative;
  }

  .timeline-dot {
    position: absolute;
    top: 18px;
    left: -31px;
    width: 12px;
    height: 12px;
    border: 2px solid var(--el-color-primary);
    border-radius: 50%;
    background: var(--el-bg-color);
    box-shadow: 0 2px 8px rgb(64 126 255 / 22%);
  }

  .timeline-card {
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .timeline-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
    color: var(--art-gray-500);
    font-size: 13px;
  }

  .timeline-heading > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .timeline-time {
    color: var(--art-gray-900);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 24px;
    font-weight: 800;
    line-height: 1;
  }

  .timeline-drug-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .timeline-drug-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);
  }

  .timeline-drug-info {
    min-width: 0;
    flex: 1;

    p {
      margin: 6px 0 0;
      color: var(--art-gray-600);
      font-size: 13px;
    }
  }

  .timeline-drug-title {
    display: flex;
    align-items: center;
    gap: 8px;

    strong {
      color: var(--art-gray-900);
      font-size: 16px;
    }

    span {
      color: var(--art-gray-500);
      font-size: 13px;
    }

    .el-button {
      margin-left: auto;
    }
  }

  .precaution-pill {
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px;
    margin-top: 10px;
    color: var(--el-color-primary);
    text-align: left;
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 999px;
    background: var(--el-color-primary-light-9);

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      flex-shrink: 0;
      padding: 2px 8px;
      color: var(--el-color-primary);
      border-radius: 999px;
      background: var(--el-bg-color);
    }
  }

  .plan-empty-state {
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    strong {
      color: var(--art-gray-900);
      font-size: 17px;
    }

    p {
      margin: 8px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
    }
  }

  .usage-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .usage-dialog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .usage-dialog-section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      color: var(--art-gray-500);
      font-size: 13px;
      font-weight: 600;
    }
  }

  .dosage-editor {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 132px;
    gap: 10px;
  }

  .frequency-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .dialog-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    span {
      color: var(--art-gray-500);
      font-size: 12px;
    }
  }

  .reminder-slot-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .reminder-slot-editor {
    display: grid;
    grid-template-columns: 76px 124px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-extra-light);

    strong {
      color: var(--art-gray-900);
      font-size: 14px;
    }
  }

  @media (max-width: 960px) {
    .medication-recognition,
    .medication-plan-layout {
      grid-template-columns: 1fr;
    }

    .review-table-toolbar {
      display: block;
    }

    .review-table-actions {
      justify-content: flex-start;
      margin-top: 12px;
    }

    .section-heading-with-note {
      display: block;

      small {
        display: block;
        margin-top: 6px;
      }
    }

    .recognized-drug-item {
      grid-template-columns: 32px minmax(0, 1fr);
    }

    .drug-actions {
      grid-column: 2;
      justify-content: flex-start;
    }

    .plan-panel-top {
      display: block;

      :deep(.el-segmented) {
        margin-top: 12px;
      }
    }

    .usage-dialog-grid,
    .dosage-editor,
    .frequency-options,
    .reminder-slot-editor {
      grid-template-columns: 1fr;
    }

    .keyword-search-row,
    .keyword-result-item,
    .keyword-drug-action {
      grid-template-columns: 1fr;
    }
  }
</style>
