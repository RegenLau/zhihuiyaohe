<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>用药计划</h2>
        <p>先选择患者，再维护当前方案、历史方案和下发状态</p>
      </div>
      <ElButton type="primary" @click="editVisible = true">
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
                <div class="muted text-xs mt-1">{{ patient.gender }} · {{ patient.age }}岁 · {{ patient.recordNo }}</div>
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
              <h2>{{ currentPatient.name }} · 用药计划</h2>
              <p class="muted mt-1">当前计划已生效，药盒在线，可继续调整剂量、提醒时间和处方附件。</p>
            </div>
            <ElSpace wrap>
              <ElButton @click="router.push('/doctor/patients')">查看患者档案</ElButton>
              <ElButton type="primary" @click="savePlan">保存计划调整</ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <div class="summary-grid">
          <div class="summary-item"><span class="summary-number">1 个</span><span class="muted">当前计划</span></div>
          <div class="summary-item"><span class="summary-number">{{ currentPlan.drugs.length }} 种</span><span class="muted">用药品种</span></div>
          <div class="summary-item"><span class="summary-number">{{ currentPlan.generatedTasks }}</span><span class="muted">任务生成</span></div>
          <div class="summary-item"><span class="summary-number">{{ currentPlan.dispatchStatus }}</span><span class="muted">药盒状态</span></div>
        </div>

        <ElCard shadow="never">
          <div class="flex justify-between items-center gap-3 flex-wrap">
            <ElSegmented v-model="planView" :options="['当前方案', '历史方案', '处方附件']" />
            <ElSpace wrap>
              <ElButton>复制为新方案</ElButton>
              <ElButton type="danger">停用计划</ElButton>
            </ElSpace>
          </div>
        </ElCard>

        <ElCard shadow="never">
          <template #header>
            <div class="flex justify-between items-start gap-3">
              <div>
                <b>{{ currentPlan.title }}</b>
                <div class="muted text-sm mt-1">{{ currentPlan.code }} · 周期 {{ currentPlan.period }} · 处方来源：{{ currentPlan.source }}</div>
              </div>
              <ElTag :type="currentPlan.dispatchType">{{ currentPlan.status }}</ElTag>
            </div>
          </template>

          <ElEmpty v-if="currentPlan.drugs.length === 0" description="当前患者尚未完成用药计划" />
          <ElRow v-else v-loading="planLoading" :gutter="12">
            <ElCol v-for="drug in currentPlan.drugs" :key="drug.name" :xs="24" :md="12">
              <div class="drug-card mb-3">
                <b>{{ drug.name }}</b>
                <div class="chip-row mt-3">
                  <ElTag>{{ drug.time }}</ElTag>
                  <ElTag>{{ drug.dose }}</ElTag>
                  <ElTag>{{ drug.frequency }}</ElTag>
                </div>
                <div class="muted mt-3">{{ drug.guide }}</div>
              </div>
            </ElCol>
          </ElRow>

          <ElDescriptions class="mt-4" :column="1" border>
            <ElDescriptionsItem label="任务生成">已生成当前计划周期内的服药任务</ElDescriptionsItem>
            <ElDescriptionsItem label="药盒下发">{{ currentPlan.dispatchStatus }}，设备 {{ currentPatient.deviceNo }}</ElDescriptionsItem>
            <ElDescriptionsItem label="处方附件">社区门诊处方照片 1 张，HIS 截图 1 张</ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </div>
    </div>

    <ElDialog v-model="editVisible" title="创建用药计划" width="820px">
      <ElForm label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12"><ElFormItem label="患者"><ElInput :model-value="currentPatient.name" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="计划名称"><ElInput model-value="复诊后用药计划" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="开始日期"><ElDatePicker type="date" value-format="YYYY-MM-DD" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="计划状态"><ElSelect model-value="草稿"><ElOption label="草稿" value="草稿" /><ElOption label="已生效" value="已生效" /></ElSelect></ElFormItem></ElCol>
          <ElCol :span="24"><ElFormItem label="药品明细"><ElInput type="textarea" :rows="4" model-value="硝苯地平控释片，1片，每日一次，早餐后。" /></ElFormItem></ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="savePlan">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import planApi from '@/views/plugin/smart-pillbox/api/doctor/plan'
  import type { Patient, Plan } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxPlan' })

  const router = useRouter()
  const keyword = ref('')
  const selectedPatientId = ref(1)
  const planView = ref('当前方案')
  const editVisible = ref(false)
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
    patients.value.filter((patient) => !keyword.value || patient.name.includes(keyword.value))
  )
  const currentPatient = computed(
    () => patients.value.find((item) => item.id === selectedPatientId.value) || patients.value[0] || emptyPatient
  )
  const currentPlan = computed(
    () => plans.value.find((item) => item.patientId === selectedPatientId.value) || plans.value[0] || emptyPlan
  )

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

  const savePlan = async () => {
    if (currentPlan.value.id) {
      await planApi.update(currentPlan.value)
    } else {
      await planApi.save({ ...currentPlan.value, patientId: selectedPatientId.value })
    }
    editVisible.value = false
    ElMessage.success('用药计划已保存')
    loadPlans()
  }

  watch(selectedPatientId, () => {
    loadPlans()
  })

  onMounted(async () => {
    await loadPatients()
    await loadPlans()
  })
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
