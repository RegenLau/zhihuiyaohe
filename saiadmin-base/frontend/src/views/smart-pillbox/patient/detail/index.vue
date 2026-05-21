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
        <ElButton type="primary" :disabled="!patient" @click="openEditDialog">
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

    <EditDialog
      v-model="dialogVisible"
      dialog-type="edit"
      :initial-form-data="patient || {}"
      @success="loadAll"
    />
  </div>
</template>

<script setup lang="ts">
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
    Plan
  } from '@/views/plugin/smart-pillbox/api/doctor/types'
  import EditDialog from '../list/modules/edit-dialog.vue'

  defineOptions({ name: 'SmartPillboxPatientDetail' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const activeTab = ref('basic')
  const dialogVisible = ref(false)
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

  const openEditDialog = () => {
    dialogVisible.value = true
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

  @media (width <= 760px) {
    .routine-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
