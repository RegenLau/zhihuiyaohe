<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>用药计划</h2>
        <p>先选择患者，再维护当前方案、历史方案和下发状态</p>
      </div>
      <ElButton type="primary" @click="openCreateDialog">
        <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
        创建用药计划
      </ElButton>
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
        <ElCard shadow="never">
          <div class="detail-hero">
            <div>
              <h3>{{ currentPatient.name }} · 用药计划</h3>
              <p class="muted mt-1">{{ planHeroNote }}</p>
            </div>
            <ElSpace wrap>
              <ElButton @click="router.push('/doctor/patients')">
                <template #icon><ArtSvgIcon icon="ri:user-search-line" /></template>
                查看患者档案
              </ElButton>
              <ElButton type="primary" :disabled="!currentPlan.id" @click="savePlanAdjustment">
                <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                保存计划调整
              </ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-number">{{ currentPlan.id ? '1 个' : '0 个' }}</span>
            <span class="muted">当前计划</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ currentPlan.drugs.length }} 种</span>
            <span class="muted">用药品种</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ currentPlan.generatedTasks }}</span>
            <span class="muted">任务生成</span>
          </div>
          <div class="summary-item">
            <span class="summary-number">{{ currentPlan.dispatchStatus }}</span>
            <span class="muted">药盒状态</span>
          </div>
        </div>

        <ElCard shadow="never">
          <div class="flex justify-between items-center gap-3 flex-wrap">
            <ElSegmented v-model="planView" :options="['当前方案', '历史方案', '处方审核']" />
            <ElSpace wrap>
              <ElButton @click="openCreateDialog">
                <template #icon><ArtSvgIcon icon="ri:file-copy-line" /></template>
                复制为新方案
              </ElButton>
              <ElButton type="danger" :disabled="!currentPlan.id">
                <template #icon><ArtSvgIcon icon="ri:stop-circle-line" /></template>
                停用计划
              </ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <ElCard shadow="never">
          <template #header>
            <div class="flex justify-between items-start gap-3">
              <div>
                <b>{{ currentPlan.title }}</b>
                <div class="muted text-sm mt-1"
                  >{{ currentPlan.code }} · 周期 {{ currentPlan.period }} · 处方来源：{{
                    currentPlan.source
                  }}</div
                >
              </div>
              <ElTag :type="currentPlan.dispatchType">{{ currentPlan.status }}</ElTag>
            </div>
          </template>

          <ElEmpty v-if="visiblePlans.length === 0" description="当前患者尚未完成用药计划" />
          <div v-else-if="planView === '历史方案'" class="detail-stack">
            <div v-for="plan in visiblePlans" :key="plan.id" class="drug-card">
              <div class="flex justify-between items-start gap-3">
                <div>
                  <b>{{ plan.title }}</b>
                  <div class="muted text-sm mt-1">
                    {{ plan.code }} · {{ plan.period }} · {{ plan.source }}
                  </div>
                </div>
                <ElTag :type="plan.dispatchType">{{ plan.dispatchStatus }}</ElTag>
              </div>
              <div class="chip-row mt-3">
                <ElTag effect="plain">药品 {{ plan.drugs.length }} 种</ElTag>
                <ElTag effect="plain">{{ plan.generatedTasks }}</ElTag>
                <ElTag effect="plain">{{ plan.auditSummary || '无审核提示' }}</ElTag>
              </div>
            </div>
          </div>
          <ElDescriptions v-else-if="planView === '处方审核'" :column="1" border>
            <ElDescriptionsItem label="审核结论">
              {{ currentPlan.auditSummary || '当前处方未发现需要拦截的问题' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="注意事项">
              控释、缓释、肠溶类药物默认提示整片吞服；慢病长期用药默认生成余药量提醒。
            </ElDescriptionsItem>
            <ElDescriptionsItem label="适用患者">
              {{ currentPatient.name }}，{{ currentPatient.diseases.join('、') || '未填写疾病' }}
            </ElDescriptionsItem>
          </ElDescriptions>
          <ElRow v-else v-loading="planLoading" :gutter="12">
            <ElCol v-for="drug in currentPlan.drugs" :key="drug.name" :xs="24" :md="12">
              <div class="drug-card mb-3">
                <b>{{ drug.name }}</b>
                <div class="chip-row mt-3">
                  <ElTag>{{ drug.time }}</ElTag>
                  <ElTag>{{ drug.dose }}</ElTag>
                  <ElTag>{{ drug.frequency }}</ElTag>
                  <ElTag v-if="drug.specification" effect="plain">{{ drug.specification }}</ElTag>
                </div>
                <div class="muted mt-3">
                  {{ drug.guide }}
                  <span v-if="drug.startDate"> · {{ drug.startDate }} 至 {{ drug.endDate || '长期' }}</span>
                </div>
              </div>
            </ElCol>
          </ElRow>

          <ElDescriptions class="mt-4" :column="1" border>
            <ElDescriptionsItem label="任务生成">已生成当前计划周期内的服药任务</ElDescriptionsItem>
            <ElDescriptionsItem label="药盒下发"
              >{{ currentPlan.dispatchStatus }}，设备
              {{ currentPatient.deviceNo }}</ElDescriptionsItem
            >
            <ElDescriptionsItem label="处方附件"
              >社区门诊处方照片 1 张，HIS 截图 1 张</ElDescriptionsItem
            >
          </ElDescriptions>
        </ElCard>
      </div>
    </div>

    <ElDialog v-model="editVisible" title="创建用药计划" width="820px">
      <ElForm ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12"
            ><ElFormItem label="患者"
              ><ElInput :model-value="currentPatient.name" readonly /></ElFormItem
          ></ElCol>
          <ElCol :span="12"
            ><ElFormItem label="计划名称" prop="title"
              ><ElInput v-model="editForm.title" placeholder="请输入计划名称" /></ElFormItem
          ></ElCol>
          <ElCol :span="12"
            ><ElFormItem label="开始日期" prop="startDate"
              ><ElDatePicker
                v-model="editForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期" /></ElFormItem
          ></ElCol>
          <ElCol :span="12"
            ><ElFormItem label="计划状态" prop="status"
              ><ElSelect v-model="editForm.status" placeholder="请选择计划状态"
                ><ElOption label="草稿" value="草稿" /><ElOption
                  label="已生效"
                  value="已生效" /></ElSelect></ElFormItem
          ></ElCol>
          <ElCol :span="24"
            ><ElFormItem label="药品明细" prop="drugText"
              ><ElInput
                v-model="editForm.drugText"
                type="textarea"
                :rows="4"
                placeholder="每行填写药品、剂量、频次、时间" /></ElFormItem
          ></ElCol>
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
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import planApi from '@/views/plugin/smart-pillbox/api/doctor/plan'
  import type { Patient, Plan } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxPlan' })

  const router = useRouter()
  const route = useRoute()
  const keyword = ref('')
  const selectedPatientId = ref(Number(route.query.patientId || 1))
  const planView = ref('当前方案')
  const editVisible = ref(false)
  const autoCreateDialogOpened = ref(false)
  const editFormRef = ref<FormInstance>()
  const editForm = reactive({
    title: '',
    startDate: '',
    status: '草稿',
    drugText: ''
  })
  const patients = ref<Patient[]>([])
  const plans = ref<Plan[]>([])
  const patientLoading = ref(false)
  const planLoading = ref(false)

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
        [patient.name, patient.recordNo, patient.deviceNo].some((value) => value.includes(keyword.value))
    )
  )
  const currentPatient = computed(
    () =>
      patients.value.find((item) => item.id === selectedPatientId.value) ||
      patients.value[0] ||
      emptyPatient
  )
  const currentPlan = computed(
    () => plans.value.find((item) => item.patientId === selectedPatientId.value) || emptyPlan
  )
  const visiblePlans = computed(() =>
    planView.value === '历史方案'
      ? plans.value.filter((item) => item.patientId === selectedPatientId.value)
      : currentPlan.value.id
        ? [currentPlan.value]
        : []
  )
  const planHeroNote = computed(() => {
    if (!currentPlan.value.id) return '当前患者尚未创建用药计划，可先创建草稿并在确认后下发药盒。'
    return `${currentPlan.value.status}，${currentPlan.value.dispatchStatus}，可继续调整剂量、提醒时间和处方附件。`
  })

  const editRules: FormRules = {
    title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    status: [{ required: true, message: '请选择计划状态', trigger: 'change' }],
    drugText: [{ required: true, message: '请输入药品明细', trigger: 'blur' }]
  }

  const loadPatients = async () => {
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

  const loadPlans = async () => {
    if (!selectedPatientId.value) return
    planLoading.value = true
    try {
      const result = await planApi.list({ page: 1, limit: 20, patientId: selectedPatientId.value })
      plans.value = result.records
    } finally {
      planLoading.value = false
    }
  }

  const openCreateDialog = () => {
    if (!currentPatient.value.id) return
    editForm.title = currentPlan.value.id ? `${currentPlan.value.title} 复诊调整` : '新建用药计划'
    editForm.startDate = ''
    editForm.status = '草稿'
    editForm.drugText = currentPlan.value.drugs
      .map((drug) => `${drug.name}，${drug.dose}，${drug.frequency}，${drug.time}`)
      .join('\n')
    editVisible.value = true
  }

  const maybeOpenCreateDialogFromRoute = () => {
    if (
      autoCreateDialogOpened.value ||
      route.query.action !== 'create' ||
      !selectedPatientId.value
    ) {
      return
    }
    autoCreateDialogOpened.value = true
    planView.value = '当前方案'
    nextTick(() => {
      openCreateDialog()
      router.replace({
        path: '/doctor/plans',
        query: { patientId: selectedPatientId.value }
      })
    })
  }

  const parseDrugInput = (text: string) =>
    text
      .split(/\n|；|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [
          name = '未命名药品',
          dose = '待设置剂量',
          frequency = '待设置频次',
          time = '待设置时间'
        ] = line.split(/[，,]/).map((item) => item.trim())
        return {
          name,
          dose,
          frequency,
          time,
          guide: '请按处方和医药师建议执行，异常情况及时联系医药师。',
          startDate: editForm.startDate,
          endDate: '',
          durationDays: 30
        }
      })

  const savePlanAdjustment = async () => {
    if (currentPlan.value.id) {
      await planApi.update(currentPlan.value)
    } else {
      await planApi.save({ ...currentPlan.value, patientId: selectedPatientId.value })
    }
    ElMessage.success('用药计划已保存')
    loadPlans()
  }

  const saveCreatePlan = async () => {
    await editFormRef.value?.validate()
    await planApi.save({
      patientId: selectedPatientId.value,
      patientName: currentPatient.value.name,
      title: editForm.title,
      code: '草稿',
      period: editForm.startDate ? `${editForm.startDate} 起` : '未设置',
      startDate: editForm.startDate,
      endDate: null,
      status: editForm.status,
      dispatchStatus: '未下发',
      dispatchType: editForm.status === '已生效' ? 'success' : 'info',
      generatedTasks: '未生成',
      source: '手动录入',
      reminderCount: parseDrugInput(editForm.drugText).length,
      auditSummary: '请在下发前复核剂量、频次和患者过敏史',
      drugs: parseDrugInput(editForm.drugText)
    })
    editVisible.value = false
    ElMessage.success('用药计划已创建')
    loadPlans()
  }

  watch(selectedPatientId, () => {
    loadPlans()
  })

  onMounted(async () => {
    await loadPatients()
    await loadPlans()
    maybeOpenCreateDialogFromRoute()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
