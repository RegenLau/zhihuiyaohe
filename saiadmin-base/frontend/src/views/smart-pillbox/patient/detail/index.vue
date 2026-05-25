<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>患者详情</h2>
        <p>集中查看患者档案、联系人、过敏史、用药记录、健康数据和设备对话</p>
      </div>
      <ElSpace wrap>
        <ElButton @click="router.push('/doctor/patients')">
          <template #icon><ArtSvgIcon icon="ri:arrow-left-line" /></template>
          返回列表
        </ElButton>
        <ElButton v-if="editing" @click="cancelEdit">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消编辑
        </ElButton>
        <ElButton v-else type="primary" :disabled="!patient" @click="startEdit">
          <template #icon><ArtSvgIcon icon="ri:edit-2-line" /></template>
          编辑档案
        </ElButton>
      </ElSpace>
    </div>

    <ElSkeleton v-if="loading" :rows="8" animated />
    <template v-else-if="patient">
      <ElCard shadow="never">
        <div class="detail-hero">
          <div>
            <h3>{{ patient.name }} · {{ patient.recordNo }}</h3>
            <p class="muted mt-1">
              {{ patient.gender }} · {{ patient.age }} 岁 · {{ patient.phone }} ·
              {{ patient.managementPharmacist || '未分配药师' }}
            </p>
            <div class="chip-row mt-3">
              <ElTag v-for="disease in patient.diseases" :key="disease" effect="plain">
                {{ disease }}
              </ElTag>
              <ElTag :type="patient.deviceStatusType">{{ patient.deviceStatus }}</ElTag>
              <ElTag :type="patient.status === '重点关注' ? 'warning' : 'success'">
                {{ patient.status || '正常管理' }}
              </ElTag>
            </div>
          </div>
          <ElSpace wrap>
            <ElButton @click="router.push(`/doctor/plans?patientId=${patient.id}`)">
              <template #icon><ArtSvgIcon icon="ri:calendar-check-line" /></template>
              用药计划
            </ElButton>
            <ElButton @click="router.push(`/doctor/tasks?patientId=${patient.id}`)">
              <template #icon><ArtSvgIcon icon="ri:checkbox-circle-line" /></template>
              今日任务
            </ElButton>
            <ElButton @click="router.push(`/doctor/health-data?patientId=${patient.id}`)">
              <template #icon><ArtSvgIcon icon="ri:pulse-line" /></template>
              健康数据
            </ElButton>
          </ElSpace>
        </div>
      </ElCard>

      <div class="summary-grid mt-4">
        <div class="summary-item">
          <span class="summary-number">{{ patient.completionRate }}%</span>
          <span class="muted">服药完成率</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ patient.todayDrugs }} 种</span>
          <span class="muted">今日用药</span>
        </div>
        <div class="summary-item">
          <span class="summary-number">{{ patient.nextReminder }}</span>
          <span class="muted">下一提醒</span>
        </div>
        <div class="summary-item">
          <span class="summary-number" :class="riskSummaryClass">{{ patient.taskRisk }}</span>
          <span class="muted">最近风险</span>
        </div>
      </div>

      <ElCard class="mt-4" shadow="never">
        <ElTabs v-model="activeTab">
          <ElTabPane label="基础信息" name="basic">
            <ElForm
              v-if="editing"
              ref="formRef"
              :model="editForm"
              :rules="rules"
              label-width="110px"
            >
              <ElRow :gutter="16">
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="患者姓名" prop="name">
                    <ElInput v-model="editForm.name" placeholder="请输入患者姓名" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="手机号" prop="phone">
                    <ElInput v-model="editForm.phone" placeholder="请输入手机号" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="性别" prop="gender">
                    <ElSelect v-model="editForm.gender" placeholder="请选择性别">
                      <ElOption label="男" value="男" />
                      <ElOption label="女" value="女" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="出生年月日" prop="birthDate">
                    <ElDatePicker
                      v-model="editForm.birthDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择出生年月日"
                      :disabled-date="disableFutureDate"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="管理状态" prop="status">
                    <ElSelect v-model="editForm.status" placeholder="请选择管理状态">
                      <ElOption label="正常管理" value="正常管理" />
                      <ElOption label="重点关注" value="重点关注" />
                      <ElOption label="已归档" value="已归档" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="家属信息" prop="child">
                    <ElInput v-model="editForm.child" placeholder="请输入家属姓名和联系方式" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="管理药师" prop="managementPharmacist">
                    <ElInput v-model="editForm.managementPharmacist" placeholder="请输入管理药师" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="首诊药师" prop="firstConsultPharmacist">
                    <ElInput
                      v-model="editForm.firstConsultPharmacist"
                      placeholder="请输入首诊药师"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="基础疾病" prop="diseasesText">
                    <ElInput v-model="editForm.diseasesText" placeholder="多个疾病用逗号分隔" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="联系地址" prop="address">
                    <ElInput v-model="editForm.address" placeholder="请输入联系地址" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="联系人" prop="contactsText">
                    <ElInput
                      v-model="editForm.contactsText"
                      type="textarea"
                      :rows="2"
                      placeholder="每行填写：关系，姓名，电话"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="过敏史" prop="allergiesText">
                    <ElInput
                      v-model="editForm.allergiesText"
                      type="textarea"
                      :rows="2"
                      placeholder="每行填写：过敏源，反应"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="诊疗备注" prop="remark">
                    <ElInput
                      v-model="editForm.remark"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入诊疗备注"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <div class="detail-edit-actions">
                <ElButton @click="cancelEdit">
                  <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
                  取消
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="savePatient">
                  <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                  保存档案
                </ElButton>
              </div>
            </ElForm>

            <template v-else>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="出生年月">{{ patient.birthDate || '-' }}</ElDescriptionsItem>
                <ElDescriptionsItem label="联系地址">{{ patient.address || '-' }}</ElDescriptionsItem>
                <ElDescriptionsItem label="管理药师">
                  {{ patient.managementPharmacist || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="首诊药师">
                  {{ patient.firstConsultPharmacist || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="药盒设备">{{ patient.deviceNo }}</ElDescriptionsItem>
                <ElDescriptionsItem label="设备状态">
                  <ElTag :type="patient.deviceStatusType">{{ patient.deviceStatus }}</ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="知情同意">{{ patient.consent }}</ElDescriptionsItem>
                <ElDescriptionsItem label="最近互动">
                  {{ patient.recentInteraction || '-' }}
                </ElDescriptionsItem>
              </ElDescriptions>
              <div class="routine-grid mt-4">
                <div v-for="item in routineItems" :key="item.label" class="routine-item">
                  <span>{{ item.label }}</span>
                  <b>{{ item.value }}</b>
                </div>
              </div>
            </template>
          </ElTabPane>

          <ElTabPane label="联系人" name="contacts">
            <ElTable :data="patient.contacts || []" border>
              <ElTableColumn prop="relation" label="关系" width="110" />
              <ElTableColumn prop="name" label="姓名" width="130" />
              <ElTableColumn prop="phone" label="电话" min-width="150" />
              <ElTableColumn label="主联系人" width="120">
                <template #default="{ row }">
                  <ElTag :type="row.isPrimary ? 'success' : 'info'">
                    {{ row.isPrimary ? '是' : '否' }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <ElTabPane label="过敏史" name="allergies">
            <ElTable :data="patient.allergies || []" border empty-text="暂无过敏史">
              <ElTableColumn prop="allergenType" label="类型" width="110" />
              <ElTableColumn prop="allergen" label="过敏源" width="150" />
              <ElTableColumn label="严重程度" width="130">
                <template #default="{ row }">
                  <ElTag :type="getAllergyType(row.severity)">
                    {{ getAllergyLabel(row.severity) }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="reaction" label="反应" min-width="220" />
            </ElTable>
          </ElTabPane>

          <ElTabPane label="用药记录" name="records">
            <ElTable :data="medicineRecords" border>
              <ElTableColumn prop="time" label="时间" width="170" />
              <ElTableColumn prop="commonName" label="药品" min-width="160" />
              <ElTableColumn prop="dosage" label="剂量" width="120" />
              <ElTableColumn prop="source" label="来源" width="130" />
              <ElTableColumn label="状态" width="110">
                <template #default="{ row }">
                  <ElTag :type="row.statusType">{{ row.status }}</ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <ElTabPane label="健康数据" name="health">
            <div class="summary-grid mb-4">
              <div class="summary-item">
                <span class="summary-number">{{ healthSummary.avgSystolic }}/{{ healthSummary.avgDiastolic }}</span>
                <span class="muted">平均血压</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ healthSummary.avgGlucose }}</span>
                <span class="muted">平均空腹血糖</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ healthSummary.complianceRate }}%</span>
                <span class="muted">上报响应率</span>
              </div>
              <div class="summary-item">
                <span class="summary-number" :class="healthRiskCount ? 'is-warning' : 'is-success'">
                  {{ healthRiskCount }}
                </span>
                <span class="muted">异常或关注</span>
              </div>
            </div>
            <ElTable :data="healthRecords" border>
              <ElTableColumn prop="date" label="日期" width="120" />
              <ElTableColumn prop="morningBP" label="晨间血压" width="120" />
              <ElTableColumn prop="eveningBP" label="晚间血压" width="120" />
              <ElTableColumn prop="fastingGlucose" label="空腹血糖" width="120" />
              <ElTableColumn label="风险" width="110">
                <template #default="{ row }">
                  <ElTag :type="getHealthRiskType(row.riskLevel)">{{ row.riskLevel }}</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="note" label="备注" min-width="220" />
            </ElTable>
          </ElTabPane>

          <ElTabPane label="用药计划" name="plans">
            <ElEmpty v-if="plans.length === 0" description="暂无用药计划" />
            <div v-else class="detail-stack">
              <div v-for="plan in plans" :key="plan.id" class="drug-card">
                <div class="flex justify-between items-start gap-3">
                  <div>
                    <b>{{ plan.title }}</b>
                    <div class="muted text-sm mt-1">
                      {{ plan.code }} · {{ plan.period }} · {{ plan.generatedTasks }}
                    </div>
                  </div>
                  <ElTag :type="plan.dispatchType">{{ plan.dispatchStatus }}</ElTag>
                </div>
                <div class="chip-row mt-3">
                  <ElTag v-for="drug in plan.drugs" :key="drug.name" effect="plain">
                    {{ drug.name }} {{ drug.dose }} {{ drug.frequency }}
                  </ElTag>
                </div>
              </div>
            </div>
          </ElTabPane>

          <ElTabPane label="对话记录" name="conversations">
            <ElEmpty v-if="conversations.length === 0" description="暂无对话记录" />
            <div v-else class="detail-stack">
              <div v-for="item in conversations" :key="item.id" class="timeline-card">
                <div class="flex justify-between items-center mb-3">
                  <b>{{ item.time }}</b>
                  <ElTag :type="item.statusType">{{ item.status }}</ElTag>
                </div>
                <div class="conversation-flow">
                  <div v-if="item.deviceText" class="bubble">{{ item.deviceText }}</div>
                  <div v-if="item.patientText" class="bubble right">{{ item.patientText }}</div>
                  <ElAlert
                    v-if="item.note"
                    :title="item.note"
                    type="warning"
                    show-icon
                    :closable="false"
                  />
                </div>
              </div>
            </div>
          </ElTabPane>
        </ElTabs>
      </ElCard>
    </template>

    <ElEmpty v-else description="未找到患者档案" />

  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import conversationApi from '@/views/plugin/smart-pillbox/api/doctor/conversation'
  import healthApi from '@/views/plugin/smart-pillbox/api/doctor/health'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import planApi from '@/views/plugin/smart-pillbox/api/doctor/plan'
  import type {
    Conversation,
    HealthRecord,
    HealthSummary,
    MedicationRecord,
    Patient,
    PatientAllergy,
    PatientContact,
    Plan
  } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxPatientDetail' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const saving = ref(false)
  const activeTab = ref('basic')
  const editing = ref(false)
  const formRef = ref<FormInstance>()
  const patient = ref<Patient | null>(null)
  const plans = ref<Plan[]>([])
  const medicineRecords = ref<MedicationRecord[]>([])
  const healthRecords = ref<HealthRecord[]>([])
  const conversations = ref<Conversation[]>([])
  const healthSummary = ref<HealthSummary>({
    avgSystolic: 0,
    avgDiastolic: 0,
    avgGlucose: 0,
    complianceRate: 0,
    systolicTrend: 0,
    diastolicTrend: 0,
    glucoseTrend: 0
  })

  const editForm = reactive({
    name: '',
    phone: '',
    gender: '男',
    birthDate: '',
    child: '',
    diseasesText: '',
    status: '正常管理' as Patient['status'],
    managementPharmacist: '',
    firstConsultPharmacist: '',
    address: '',
    contactsText: '',
    allergiesText: '',
    remark: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birthDate: [{ required: true, message: '请选择出生年月日', trigger: 'change' }]
  }

  const patientId = computed(() => Number(route.query.id || 1))
  const riskSummaryClass = computed(() => {
    if (!patient.value) return ''
    if (patient.value.taskRisk.includes('漏服') || patient.value.taskRisk.includes('异常')) {
      return 'is-danger'
    }
    if (patient.value.taskRisk === '正常') return 'is-success'
    return 'is-warning'
  })
  const routineItems = computed(() => [
    { label: '早餐', value: patient.value?.breakfastTime || '-' },
    { label: '午餐', value: patient.value?.lunchTime || '-' },
    { label: '晚餐', value: patient.value?.dinnerTime || '-' },
    { label: '睡眠', value: patient.value?.sleepTime || '-' }
  ])
  const healthRiskCount = computed(
    () => healthRecords.value.filter((item) => item.riskLevel !== '正常').length
  )

  const getAllergyType = (severity: string) => {
    if (severity === 'severe') return 'danger'
    if (severity === 'moderate') return 'warning'
    return 'info'
  }

  const getAllergyLabel = (severity: string) => {
    const labelMap: Record<string, string> = {
      severe: '严重',
      moderate: '中等',
      mild: '轻微'
    }
    return labelMap[severity] || severity
  }

  const getHealthRiskType = (riskLevel: string) => {
    if (riskLevel === '高风险') return 'danger'
    if (riskLevel === '关注') return 'warning'
    return 'success'
  }

  const disableFutureDate = (date: Date) => date.getTime() > Date.now()

  const formatDateTime = () => {
    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-')
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ].join(':')
    return `${date} ${time}`
  }

  const syncEditForm = (value?: Patient | null) => {
    editForm.name = value?.name || ''
    editForm.phone = value?.phone || ''
    editForm.gender = value?.gender || '男'
    editForm.birthDate = value?.birthDate || ''
    editForm.child = value?.child || ''
    editForm.diseasesText = value?.diseases?.join('，') || ''
    editForm.status = value?.status || '正常管理'
    editForm.managementPharmacist = value?.managementPharmacist || ''
    editForm.firstConsultPharmacist = value?.firstConsultPharmacist || ''
    editForm.address = value?.address || ''
    editForm.contactsText =
      value?.contacts?.map((item) => `${item.relation}，${item.name}，${item.phone}`).join('\n') ||
      ''
    editForm.allergiesText =
      value?.allergies?.map((item) => `${item.allergen}，${item.reaction}`).join('\n') || ''
    editForm.remark = value?.taskRisk || ''
  }

  const startEdit = () => {
    if (!patient.value) return
    activeTab.value = 'basic'
    syncEditForm(patient.value)
    editing.value = true
  }

  const cancelEdit = () => {
    syncEditForm(patient.value)
    editing.value = false
    formRef.value?.clearValidate()
  }

  const parseContacts = () =>
    editForm.contactsText
      .split(/\n|；|;/)
      .map((line, index) => {
        const [relation = '', name = '', phone = ''] = line.split(/[，,]/).map((item) => item.trim())
        return relation && name
          ? {
              id: `CT-DETAIL-${index}`,
              relation,
              name,
              phone,
              isPrimary: index === 0
            }
          : null
      })
      .filter((item): item is PatientContact => Boolean(item))

  const parseAllergies = () =>
    editForm.allergiesText
      .split(/\n|；|;/)
      .map((line, index) => {
        const [allergen = '', reaction = ''] = line.split(/[，,]/).map((item) => item.trim())
        return allergen
          ? {
              id: `ALG-DETAIL-${index}`,
              allergenType: 'drug',
              allergen,
              severity: 'moderate',
              reaction: reaction || '待补充'
            }
          : null
      })
      .filter((item): item is PatientAllergy => Boolean(item))

  const savePatient = async () => {
    if (!patient.value) return

    await formRef.value?.validate()
    saving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        name: editForm.name,
        phone: editForm.phone,
        gender: editForm.gender,
        birthDate: editForm.birthDate,
        child: editForm.child,
        status: editForm.status,
        managementPharmacist: editForm.managementPharmacist,
        firstConsultPharmacist: editForm.firstConsultPharmacist,
        address: editForm.address,
        contacts: parseContacts(),
        allergies: parseAllergies(),
        diseases: editForm.diseasesText
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        taskRisk: editForm.remark || patient.value.taskRisk || '正常',
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncEditForm(updatedPatient)
      editing.value = false
      ElMessage.success('患者档案已保存')
    } finally {
      saving.value = false
    }
  }

  const loadAll = async () => {
    loading.value = true
    try {
      const [patientData, recordData, planData, healthData, summaryData, conversationData] =
        await Promise.all([
          patientApi.read(patientId.value),
          patientApi.medicineRecords(patientId.value),
          planApi.list({ page: 1, limit: 20, patientId: patientId.value }),
          healthApi.list({ page: 1, limit: 20, patientId: patientId.value }),
          healthApi.summary(patientId.value),
          conversationApi.list({ page: 1, limit: 20, patientId: patientId.value })
        ])

      patient.value = patientData
      syncEditForm(patientData)
      editing.value = false
      medicineRecords.value = recordData
      plans.value = planData.records
      healthRecords.value = healthData.records
      healthSummary.value = summaryData
      conversations.value = conversationData.records
    } finally {
      loading.value = false
    }
  }

  watch(
    () => route.query.id,
    () => {
      loadAll()
    }
  )

  onMounted(() => {
    loadAll()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';

  .routine-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--pillbox-gap-sm);
  }

  .routine-item {
    padding: 14px;
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);

    span {
      display: block;
      margin-bottom: 6px;
      color: var(--pillbox-text-muted);
      font-size: 12px;
    }

    b {
      color: var(--pillbox-text-strong);
      font-size: 18px;
    }
  }

  .detail-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 18px;
    margin-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .el-select,
  .el-date-editor.el-input {
    width: 100%;
  }

  @media (width <= 760px) {
    .routine-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
