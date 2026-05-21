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
                  <ElTag size="large">已确认 {{ confirmedDrugCount }}/{{ recognizedDrugs.length }}</ElTag>
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
                      <ElButton link type="danger" @click="removeRecognizedDrug($index)">删除</ElButton>
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
          <h3 class="form-step-title">确认建档并生成服药任务</h3>
          <p class="muted mb-4">确认用药方案后保存档案，并生成服药任务。</p>
          <div class="medication-plan-layout">
            <div class="medication-picker-panel">
              <div class="panel-heading">
                <h4>药品选择</h4>
                <p>选择全部药品或单个药品查看用药信息。</p>
              </div>
              <button
                type="button"
                class="drug-select-card"
                :class="{ active: selectedPlanDrug === 'all' }"
                @click="selectedPlanDrug = 'all'"
              >
                <span>全部药品</span>
                <small>{{ recognizedDrugs.length }} 种药品 · {{ reminderSlotCount }} 个时间点</small>
              </button>

              <div v-if="recognizedDrugs.length" class="plan-drug-list">
                <button
                  v-for="(drug, index) in recognizedDrugs"
                  :key="`${drug.name}-plan-${index}`"
                  type="button"
                  class="drug-select-card"
                  :class="{ active: selectedPlanDrug === drug.name }"
                  @click="selectedPlanDrug = drug.name"
                >
                  <span>{{ drug.name }}</span>
                  <small>{{ drug.amount }} · {{ drug.manufacturer || '厂家待确认' }}</small>
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
                  <h4>用药方案</h4>
                  <p>确认提醒时间、开始日期和预计截止时间。</p>
                </div>
                <ElSegmented v-model="planView" :options="planViews" />
              </div>

              <div v-if="planView === '开始时间'" class="plan-pane start-date-pane">
                <div class="start-date-card">
                  <ArtSvgIcon icon="ri:calendar-check-line" class="start-date-icon" />
                  <strong>统一开始执行时间</strong>
                  <p>点击后统一修改，并同步应用到全部药品。</p>
                  <ElFormItem label="开始日期" prop="startDate">
                    <ElDatePicker
                      v-model="form.startDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择开始日期"
                    />
                  </ElFormItem>
                </div>
              </div>

              <div v-else-if="planView === '预计截止时间'" class="plan-pane">
                <template v-if="recognizedDrugs.length">
                  <div
                    v-for="(drug, index) in recognizedDrugs"
                    :key="`${drug.name}-end-${index}`"
                    class="end-date-item"
                  >
                    <div>
                      <strong>{{ drug.name }}</strong>
                      <p>{{ drug.spec }} · {{ drug.amount }}</p>
                    </div>
                    <ElTag type="info">待确认</ElTag>
                  </div>
                </template>
                <div v-else class="plan-empty-state">
                  <strong>暂无截止时间</strong>
                  <p>录入药品后显示预计截止时间。</p>
                </div>
              </div>

              <div v-else class="plan-pane">
                <template v-if="recognizedDrugs.length">
                  <div class="timeline-group">
                    <div class="timeline-time">08:00</div>
                    <div class="timeline-content">
                      <strong>早餐后提醒</strong>
                      <div class="timeline-drugs">
                        <ElTag v-for="drug in recognizedDrugs" :key="`${drug.name}-morning`">
                          {{ drug.name }}
                        </ElTag>
                      </div>
                    </div>
                  </div>
                  <div class="timeline-group">
                    <div class="timeline-time">20:00</div>
                    <div class="timeline-content">
                      <strong>晚餐后提醒</strong>
                      <div class="timeline-drugs">
                        <ElTag
                          v-for="drug in recognizedDrugs"
                          :key="`${drug.name}-evening`"
                          type="success"
                        >
                          {{ drug.name }}
                        </ElTag>
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
  const form = reactive({
    name: '',
    phone: '',
    gender: '男',
    birthDate: '',
    startDate: '',
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

  type RecognizedDrug = {
    name: string
    spec: string
    amount: string
    usage: string
    confirmed: boolean
    manufacturer?: string
    source?: string
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
    {
      name: '硝苯地平控释片',
      spec: '30mg',
      amount: '1盒',
      usage: '每日1次 · 空腹整片吞服',
      confirmed: false,
      manufacturer: '拜耳医药',
      source: '图片识别'
    },
    {
      name: '二甲双胍缓释片',
      spec: '500mg',
      amount: '2盒',
      usage: '每日2次 · 随餐服用',
      confirmed: false,
      manufacturer: '施贵宝制药',
      source: '图片识别'
    }
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
  const planViews = ['开始时间', '用药时间轴', '预计截止时间']
  const planView = ref(planViews[0])
  const selectedPlanDrug = ref('all')
  const recognizedDrugs = ref<RecognizedDrug[]>([])
  const confirmedDrugCount = computed(
    () => recognizedDrugs.value.filter((drug) => drug.confirmed).length
  )
  const reminderSlotCount = computed(() => (recognizedDrugs.value.length ? 2 : 0))
  const stepFields: Record<number, string[]> = {
    0: ['name', 'phone', 'gender', 'birthDate'],
    1: ['device'],
    2: [],
    3: ['startDate']
  }

  const disableFutureDate = (date: Date) => date.getTime() > Date.now()

  const inferDrugQuantityUnit = (drug: DrugDatabaseEntry) => {
    const label = `${drug.name} ${drug.genericName} ${drug.specifications.join(' ')}`
    if (/颗粒|散|袋/.test(label)) return '袋'
    if (/口服液|糖浆|滴剂|瓶/.test(label)) return '瓶'
    if (/支|软膏|凝胶/.test(label)) return '支'
    return '盒'
  }

  const normalizeDrugSearchText = (value: string) => value.trim().toLowerCase()

  const buildRecognizedDrug = (drug: DrugDatabaseEntry, amount: string): RecognizedDrug => ({
    name: drug.name,
    spec: drug.commonDosage || drug.specifications[0] || '规格待确认',
    amount,
    usage: `${drug.frequency} · ${drug.timingMeals}`,
    confirmed: false,
    manufacturer: drug.manufacturer,
    source: '药品库'
  })

  const addRecognizedDrugs = (drugs: RecognizedDrug[]) => {
    let addedCount = 0
    const nextDrugs = [...recognizedDrugs.value]

    drugs.forEach((drug) => {
      const duplicated = nextDrugs.some((item) => item.name === drug.name && item.spec === drug.spec)
      if (!duplicated) {
        nextDrugs.push({ ...drug })
        addedCount += 1
      }
    })

    recognizedDrugs.value = nextDrugs
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
    const addedCount = addRecognizedDrugs([buildRecognizedDrug(drug, `${quantity}${unit}`)])
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
    recognizedDrugs.value.splice(index, 1)
  }

  const reselectDrug = (drug: RecognizedDrug) => {
    drugKeyword.value = drug.name
    openDrugSearchDialog()
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

  const validateCurrentStep = async () => {
    const fields = stepFields[activeStep.value] ?? []
    if (!fields.length || !formRef.value) return
    if (activeStep.value === 3 && !form.startDate) {
      planView.value = '开始时间'
    }
    await Promise.all(fields.map((field) => formRef.value?.validateField(field)))
  }

  const handleNext = async () => {
    await validateCurrentStep()
    if (activeStep.value < 3) {
      activeStep.value += 1
      if (activeStep.value === 3) {
        planView.value = '开始时间'
      }
      return
    }
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
      nextReminder: '待生成',
      todayDrugs: recognizedDrugs.value.length,
      recentInteraction: '-',
      completionRate: 0,
      taskRisk: recognizedDrugs.value.length ? '待生成任务' : '待识别药品'
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
    grid-template-columns: minmax(260px, 0.7fr) minmax(460px, 1.3fr);
    gap: 16px;
  }

  .medication-picker-panel,
  .medication-plan-panel {
    min-height: 360px;
    padding: 18px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .drug-select-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
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

    span {
      color: var(--art-gray-900);
      font-weight: 700;
    }

    small {
      color: var(--art-gray-500);
      font-size: 13px;
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .plan-drug-list {
    margin-top: 14px;
  }

  .plan-panel-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .plan-pane {
    min-height: 270px;
    padding: 18px;
    border: 1px dashed var(--el-border-color-lighter);
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

    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 0;
    }

    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  .start-date-icon {
    color: var(--el-color-primary);
    font-size: 36px;
  }

  .end-date-item,
  .timeline-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: 0;
    }

    strong {
      color: var(--art-gray-900);
    }

    p {
      margin: 6px 0 0;
      color: var(--art-gray-500);
      font-size: 13px;
    }
  }

  .timeline-group {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .timeline-time {
    min-width: 58px;
    color: var(--el-color-primary);
    font-weight: 700;
  }

  .timeline-content {
    flex: 1;
  }

  .timeline-drugs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
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

    .keyword-search-row,
    .keyword-result-item,
    .keyword-drug-action {
      grid-template-columns: 1fr;
    }
  }
</style>
