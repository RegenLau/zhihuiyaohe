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
        <ElButton
          v-if="!isEditing"
          :type="patient?.status === '重点关注' ? 'warning' : 'primary'"
          plain
          :disabled="!patient"
          :loading="statusSaving"
          @click="toggleFocusPatient"
        >
          <template #icon><ArtSvgIcon icon="ri:flag-line" /></template>
          {{ patient?.status === '重点关注' ? '取消重点标注' : '标注重点患者' }}
        </ElButton>
        <ElButton v-if="isEditing" @click="cancelEdit">
          <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
          取消编辑
        </ElButton>
        <ElButton v-else type="primary" :disabled="!patient" @click="startEdit">
          <template #icon><ArtSvgIcon icon="ri:edit-2-line" /></template>
          编辑信息
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
            <ElButton @click="router.push(`/doctor/conversations?patientId=${patient.id}`)">
              <template #icon><ArtSvgIcon icon="ri:message-3-line" /></template>
              对话记录
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
              v-if="isEditing"
              ref="basicFormRef"
              :model="basicForm"
              :rules="basicRules"
              label-width="110px"
            >
              <ElRow :gutter="16">
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="患者姓名" prop="name">
                    <ElInput v-model="basicForm.name" placeholder="请输入患者姓名" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="手机号" prop="phone">
                    <ElInput v-model="basicForm.phone" placeholder="请输入手机号" />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="性别" prop="gender">
                    <ElSelect v-model="basicForm.gender" placeholder="请选择性别">
                      <ElOption label="男" value="男" />
                      <ElOption label="女" value="女" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="出生年月日" prop="birthDate">
                    <ElDatePicker
                      v-model="basicForm.birthDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="请选择出生年月日"
                      :disabled-date="disableFutureDate"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="管理药师" prop="managementPharmacist">
                    <ElInput v-model="basicForm.managementPharmacist" placeholder="请输入管理药师" />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <div class="detail-edit-actions">
                <ElButton @click="cancelEdit">
                  <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
                  取消
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="saveBasicInfo">
                  <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                  保存基础信息
                </ElButton>
              </div>
            </ElForm>

            <template v-else>
              <ElDescriptions :column="2" border>
                <ElDescriptionsItem label="出生年月">{{ patient.birthDate || '-' }}</ElDescriptionsItem>
                <ElDescriptionsItem label="管理药师">
                  {{ patient.managementPharmacist || '-' }}
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
            </template>
          </ElTabPane>

          <ElTabPane label="联系人" name="contacts">
            <div class="tab-toolbar">
              <div>
                <h4>联系人</h4>
                <p>维护家属联系人和主要联系人信息</p>
              </div>
            </div>
            <div v-if="isEditing" class="edit-stack">
              <ElTable v-if="contactDrafts.length" :data="contactDrafts" border>
                <ElTableColumn prop="relation" label="关系" width="120">
                  <template #default="{ row }">
                    <ElTag effect="plain">{{ row.relation || '其他' }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="name" label="姓名" width="140" />
                <ElTableColumn prop="phone" label="电话" min-width="160" />
                <ElTableColumn label="主要联系人" width="140">
                  <template #default="{ row }">
                    <ElTag v-if="row.isPrimary" type="success">主要</ElTag>
                    <ElButton v-else link type="primary" @click="setPrimaryContact(row.id)">
                      设为主要
                    </ElButton>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="90" align="center">
                  <template #default="{ row }">
                    <ElButton link type="danger" @click="removeContactDraft(row.id)">
                      <template #icon><ArtSvgIcon icon="ri:delete-bin-line" /></template>
                      删除
                    </ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>
              <div v-else class="soft-empty">暂无联系人信息</div>

              <div v-if="!contactFormVisible" class="center-action">
                <ElButton plain round @click="contactFormVisible = true">
                  <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
                  添加联系人
                </ElButton>
              </div>
              <div v-else class="inline-edit-panel">
                <div class="panel-heading">
                  <div>
                    <h5>添加联系人</h5>
                    <p>补充家属或紧急联系信息，保存后会同步到当前患者档案。</p>
                  </div>
                  <span class="panel-icon">
                    <ArtSvgIcon icon="ri:add-line" />
                  </span>
                </div>
                <ElRow :gutter="12">
                  <ElCol :xs="24" :md="8">
                    <ElInput v-model="contactForm.relation" placeholder="关系，例如：配偶" />
                  </ElCol>
                  <ElCol :xs="24" :md="8">
                    <ElInput v-model="contactForm.name" placeholder="姓名" />
                  </ElCol>
                  <ElCol :xs="24" :md="8">
                    <ElInput v-model="contactForm.phone" placeholder="电话" />
                  </ElCol>
                </ElRow>
                <div class="inline-actions">
                  <ElButton @click="resetContactForm">取消</ElButton>
                  <ElButton type="primary" @click="addContactDraft">添加到列表</ElButton>
                </div>
              </div>
              <div class="detail-edit-actions">
                <ElButton @click="cancelEdit">
                  <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
                  取消
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="saveContacts">
                  <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                  保存联系人
                </ElButton>
              </div>
            </div>
            <ElTable v-else :data="patient.contacts || []" border>
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

          <ElTabPane label="病史&过敏史" name="allergies">
            <div class="tab-toolbar">
              <div>
                <h4>病史&过敏史</h4>
                <p>用于药品审核与复诊建议，可留空。</p>
              </div>
            </div>
            <div v-if="isEditing" class="history-edit">
              <div class="history-section">
                <h5>慢病史</h5>
                <div class="tag-panel">
                  <div v-if="diseaseDrafts.length" class="chip-row">
                    <ElTag
                      v-for="item in diseaseDrafts"
                      :key="item"
                      closable
                      effect="plain"
                      @close="removeDisease(item)"
                    >
                      {{ item }}
                    </ElTag>
                  </div>
                  <span v-else class="empty-hint">暂无慢病史记录</span>
                </div>
                <div class="preset-panel">
                  <span class="preset-title">待选项</span>
                  <div class="preset-row">
                    <ElButton
                      v-for="option in chronicDiseasePresets"
                      :key="option"
                      round
                      :type="diseaseDrafts.includes(option) ? 'primary' : ''"
                      :plain="!diseaseDrafts.includes(option)"
                      @click="toggleDisease(option)"
                    >
                      {{ option }}
                    </ElButton>
                  </div>
                  <div class="tag-add-row">
                    <ElInput
                      v-model="newDisease"
                      placeholder="新增慢病，例如：慢性肾病"
                      @keyup.enter="addDisease"
                    />
                    <ElButton type="primary" round @click="addDisease">
                      <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
                      添加慢病
                    </ElButton>
                  </div>
                </div>
              </div>

              <div class="history-section">
                <h5>过敏史</h5>
                <div class="tag-panel">
                  <div v-if="allergyDrafts.length" class="chip-row">
                    <ElTag
                      v-for="item in allergyDrafts"
                      :key="item"
                      closable
                      effect="plain"
                      @close="removeAllergy(item)"
                    >
                      {{ item }}
                    </ElTag>
                  </div>
                  <span v-else class="empty-hint">暂无过敏史记录</span>
                </div>
                <div class="preset-panel">
                  <span class="preset-title">待选项</span>
                  <div class="preset-row">
                    <ElButton
                      v-for="option in allergyPresets"
                      :key="option"
                      round
                      :type="allergyDrafts.includes(option) ? 'primary' : ''"
                      :plain="!allergyDrafts.includes(option)"
                      @click="toggleAllergy(option)"
                    >
                      {{ option }}
                    </ElButton>
                  </div>
                  <div class="tag-add-row">
                    <ElInput
                      v-model="newAllergy"
                      placeholder="新增过敏，例如：海鲜"
                      @keyup.enter="addAllergy"
                    />
                    <ElButton type="primary" round @click="addAllergy">
                      <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
                      添加过敏
                    </ElButton>
                  </div>
                </div>
              </div>

              <div class="detail-edit-actions">
                <ElButton @click="cancelEdit">
                  <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
                  取消
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="saveAllergies">
                  <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                  保存病史&过敏史
                </ElButton>
              </div>
            </div>
            <template v-else>
              <div class="history-view">
                <div class="history-section">
                  <h5>慢病史</h5>
                  <div class="tag-panel">
                    <div v-if="patient.diseases?.length" class="chip-row">
                      <ElTag v-for="disease in patient.diseases" :key="disease" effect="plain">
                        {{ disease }}
                      </ElTag>
                    </div>
                    <span v-else class="empty-hint">暂无慢病史记录</span>
                  </div>
                </div>
                <div class="history-section">
                  <h5>过敏史</h5>
                  <div class="tag-panel">
                    <div v-if="displayAllergyNames.length" class="chip-row">
                      <ElTag v-for="allergy in displayAllergyNames" :key="allergy" effect="plain">
                        {{ allergy }}
                      </ElTag>
                    </div>
                    <span v-else class="empty-hint">暂无过敏史记录</span>
                  </div>
                </div>
              </div>
            </template>
          </ElTabPane>

          <ElTabPane label="作息时间" name="routine">
            <ElForm v-if="isEditing" label-width="110px">
              <ElRow :gutter="16">
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="早餐">
                    <ElTimePicker
                      v-model="routineForm.breakfastTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="请选择早餐时间"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="午餐">
                    <ElTimePicker
                      v-model="routineForm.lunchTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="请选择午餐时间"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="晚餐">
                    <ElTimePicker
                      v-model="routineForm.dinnerTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="请选择晚餐时间"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :md="12">
                  <ElFormItem label="睡眠">
                    <ElTimePicker
                      v-model="routineForm.sleepTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="请选择睡眠时间"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <div class="detail-edit-actions">
                <ElButton @click="cancelEdit">
                  <template #icon><ArtSvgIcon icon="ri:close-line" /></template>
                  取消
                </ElButton>
                <ElButton type="primary" :loading="saving" @click="saveRoutine">
                  <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
                  保存作息时间
                </ElButton>
              </div>
            </ElForm>
            <div v-else class="routine-grid">
              <div v-for="item in routineItems" :key="item.label" class="routine-item">
                <span>{{ item.label }}</span>
                <b>{{ item.value }}</b>
              </div>
            </div>
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
        </ElTabs>
      </ElCard>
    </template>

    <ElEmpty v-else description="未找到患者档案" />

  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import type {
    MedicationRecord,
    Patient,
    PatientContact
  } from '@/views/plugin/smart-pillbox/api/doctor/types'

  defineOptions({ name: 'SmartPillboxPatientDetail' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const saving = ref(false)
  const statusSaving = ref(false)
  const activeTab = ref('basic')
  const editing = ref(false)
  const isEditing = computed(() => editing.value)
  const basicFormRef = ref<FormInstance>()
  const patient = ref<Patient | null>(null)
  const medicineRecords = ref<MedicationRecord[]>([])

  const basicForm = reactive({
    name: '',
    phone: '',
    gender: '男',
    birthDate: '',
    managementPharmacist: ''
  })
  const routineForm = reactive({
    breakfastTime: '',
    lunchTime: '',
    dinnerTime: '',
    sleepTime: ''
  })
  const contactDrafts = ref<PatientContact[]>([])
  const contactFormVisible = ref(false)
  const contactForm = reactive({
    relation: '',
    name: '',
    phone: ''
  })
  const diseaseDrafts = ref<string[]>([])
  const allergyDrafts = ref<string[]>([])
  const newDisease = ref('')
  const newAllergy = ref('')

  const chronicDiseasePresets = ['高血压', '糖尿病', '高血脂', '冠心病', '高尿酸']
  const allergyPresets = ['青霉素', '头孢菌素', '磺胺类', '阿司匹林', '他汀类']

  const basicRules: FormRules = {
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
  const displayAllergyNames = computed(() => getAllergyNames(patient.value))

  const disableFutureDate = (date: Date) => date.getTime() > Date.now()

  const getAgeFromBirthDate = (birthDate: string) => {
    if (!birthDate) return patient.value?.age || 0
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return patient.value?.age || 0
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

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

  const syncBasicForm = (value?: Patient | null) => {
    basicForm.name = value?.name || ''
    basicForm.phone = value?.phone || ''
    basicForm.gender = value?.gender || '男'
    basicForm.birthDate = value?.birthDate || ''
    basicForm.managementPharmacist = value?.managementPharmacist || ''
  }

  const syncContactsForm = (value?: Patient | null) => {
    contactDrafts.value = normalizeContacts(value?.contacts || [])
    resetContactForm()
    contactFormVisible.value = false
  }

  const syncRoutineForm = (value?: Patient | null) => {
    routineForm.breakfastTime = value?.breakfastTime || ''
    routineForm.lunchTime = value?.lunchTime || ''
    routineForm.dinnerTime = value?.dinnerTime || ''
    routineForm.sleepTime = value?.sleepTime || ''
  }

  const syncAllergyForm = (value?: Patient | null) => {
    diseaseDrafts.value = getUniqueValues(value?.diseases || [])
    allergyDrafts.value = getAllergyNames(value)
    newDisease.value = ''
    newAllergy.value = ''
  }

  const syncEditForms = (value?: Patient | null) => {
    syncBasicForm(value)
    syncRoutineForm(value)
    syncContactsForm(value)
    syncAllergyForm(value)
  }

  const startEdit = () => {
    if (!patient.value) return
    syncEditForms(patient.value)
    editing.value = true
  }

  const cancelEdit = () => {
    syncEditForms(patient.value)
    editing.value = false
    basicFormRef.value?.clearValidate()
  }

  const getUniqueValues = (values: string[]) =>
    Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)))

  const normalizeContacts = (contacts: PatientContact[]) => {
    const nextContacts = contacts
      .map((item, index) => ({
        id: item.id || `CT-DETAIL-${index}`,
        relation: item.relation || '其他',
        name: item.name || '',
        phone: item.phone || '',
        isPrimary: Boolean(item.isPrimary)
      }))
      .filter((item) => item.name && item.phone)

    if (nextContacts.length && !nextContacts.some((item) => item.isPrimary)) {
      nextContacts[0] = { ...nextContacts[0], isPrimary: true }
    }

    return nextContacts
  }

  const resetContactForm = () => {
    contactForm.relation = ''
    contactForm.name = ''
    contactForm.phone = ''
    contactFormVisible.value = false
  }

  const addContactDraft = () => {
    const name = contactForm.name.trim()
    const phone = contactForm.phone.trim()
    if (!name || !phone) {
      ElMessage.warning('请填写联系人姓名和电话')
      return
    }

    contactDrafts.value = normalizeContacts([
      ...contactDrafts.value,
      {
        id: `CT-DETAIL-${Date.now()}`,
        relation: contactForm.relation.trim() || '其他',
        name,
        phone,
        isPrimary: contactDrafts.value.length === 0
      }
    ])
    resetContactForm()
  }

  const removeContactDraft = (id: string) => {
    contactDrafts.value = normalizeContacts(contactDrafts.value.filter((item) => item.id !== id))
  }

  const setPrimaryContact = (id: string) => {
    contactDrafts.value = contactDrafts.value.map((item) => ({
      ...item,
      isPrimary: item.id === id
    }))
  }

  const getChildInfo = (contacts: PatientContact[]) => {
    const primaryContact = contacts.find((item) => item.isPrimary) || contacts[0]
    return primaryContact
      ? `${primaryContact.relation} ${primaryContact.name} ${primaryContact.phone}`
      : '未绑定'
  }

  const getAllergyNames = (value?: Patient | null) =>
    getUniqueValues((value?.allergies || []).map((item) => item.allergen))

  const toggleDisease = (value: string) => {
    diseaseDrafts.value = diseaseDrafts.value.includes(value)
      ? diseaseDrafts.value.filter((item) => item !== value)
      : [...diseaseDrafts.value, value]
  }

  const toggleAllergy = (value: string) => {
    allergyDrafts.value = allergyDrafts.value.includes(value)
      ? allergyDrafts.value.filter((item) => item !== value)
      : [...allergyDrafts.value, value]
  }

  const addDisease = () => {
    const value = newDisease.value.trim()
    if (!value || diseaseDrafts.value.includes(value)) return
    diseaseDrafts.value = [...diseaseDrafts.value, value]
    newDisease.value = ''
  }

  const addAllergy = () => {
    const value = newAllergy.value.trim()
    if (!value || allergyDrafts.value.includes(value)) return
    allergyDrafts.value = [...allergyDrafts.value, value]
    newAllergy.value = ''
  }

  const removeDisease = (value: string) => {
    diseaseDrafts.value = diseaseDrafts.value.filter((item) => item !== value)
  }

  const removeAllergy = (value: string) => {
    allergyDrafts.value = allergyDrafts.value.filter((item) => item !== value)
  }

  const buildAllergyPayload = () => {
    const existingAllergies = new Map(
      (patient.value?.allergies || []).map((item) => [item.allergen, item])
    )

    return allergyDrafts.value.map(
      (allergen, index) =>
        existingAllergies.get(allergen) || {
          id: `ALG-DETAIL-${patient.value?.id || 'NEW'}-${index}`,
          allergenType: 'other',
          allergen,
          severity: 'mild',
          reaction: ''
        }
    )
  }

  const saveBasicInfo = async () => {
    if (!patient.value) return

    await basicFormRef.value?.validate()
    saving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        name: basicForm.name,
        phone: basicForm.phone,
        gender: basicForm.gender,
        age: getAgeFromBirthDate(basicForm.birthDate),
        birthDate: basicForm.birthDate,
        managementPharmacist: basicForm.managementPharmacist,
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncBasicForm(updatedPatient)
      ElMessage.success('基础信息已保存')
    } finally {
      saving.value = false
    }
  }

  const saveRoutine = async () => {
    if (!patient.value) return

    saving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        breakfastTime: routineForm.breakfastTime,
        lunchTime: routineForm.lunchTime,
        dinnerTime: routineForm.dinnerTime,
        sleepTime: routineForm.sleepTime,
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncRoutineForm(updatedPatient)
      ElMessage.success('作息时间已保存')
    } finally {
      saving.value = false
    }
  }

  const saveContacts = async () => {
    if (!patient.value) return

    const contacts = normalizeContacts(contactDrafts.value)
    saving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        contacts,
        child: getChildInfo(contacts),
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncContactsForm(updatedPatient)
      ElMessage.success('联系人已保存')
    } finally {
      saving.value = false
    }
  }

  const saveAllergies = async () => {
    if (!patient.value) return

    saving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        allergies: buildAllergyPayload(),
        diseases: getUniqueValues(diseaseDrafts.value),
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncAllergyForm(updatedPatient)
      ElMessage.success('病史&过敏史已保存')
    } finally {
      saving.value = false
    }
  }

  const toggleFocusPatient = async () => {
    if (!patient.value) return
    const nextStatus: Patient['status'] =
      patient.value.status === '重点关注' ? '正常管理' : '重点关注'
    statusSaving.value = true
    try {
      const updatedPatient = await patientApi.update({
        ...patient.value,
        status: nextStatus,
        updatedAt: formatDateTime()
      })
      patient.value = updatedPatient
      syncEditForms(updatedPatient)
      ElMessage.success(nextStatus === '重点关注' ? '已标注为重点患者' : '已取消重点标注')
    } finally {
      statusSaving.value = false
    }
  }

  const loadAll = async () => {
    loading.value = true
    try {
      const [patientData, recordData] = await Promise.all([
        patientApi.read(patientId.value),
        patientApi.medicineRecords(patientId.value)
      ])

      patient.value = patientData
      syncEditForms(patientData)
      editing.value = false
      medicineRecords.value = recordData
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

  .tab-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;

    h4 {
      margin: 0 0 4px;
      color: var(--pillbox-text-strong);
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--pillbox-text-muted);
      font-size: 13px;
    }
  }

  .edit-stack,
  .history-edit,
  .history-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .soft-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 96px;
    color: var(--pillbox-text-muted);
    background: var(--pillbox-surface-soft);
    border: 1px dashed var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  .center-action {
    display: flex;
    justify-content: center;
  }

  .inline-edit-panel,
  .history-section,
  .preset-panel,
  .tag-panel {
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }

  .inline-edit-panel {
    padding: 16px;
  }

  .panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    h5 {
      margin: 0 0 4px;
      color: var(--pillbox-text-strong);
      font-size: 15px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--pillbox-text-muted);
      font-size: 13px;
    }
  }

  .panel-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--el-color-primary);
    background: var(--el-fill-color-blank);
    border: 1px solid var(--pillbox-border);
    border-radius: 12px;
  }

  .inline-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }

  .history-section {
    padding: 16px;

    h5 {
      margin: 0 0 12px;
      color: var(--pillbox-text-strong);
      font-size: 15px;
      font-weight: 600;
    }
  }

  .tag-panel {
    min-height: 78px;
    padding: 14px;
    background: var(--el-fill-color-blank);
  }

  .preset-panel {
    padding: 14px;
    margin-top: 12px;
  }

  .preset-title {
    display: block;
    margin-bottom: 10px;
    color: var(--pillbox-text-muted);
    font-size: 13px;
    font-weight: 600;
  }

  .preset-row,
  .tag-add-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .tag-add-row {
    align-items: center;
    margin-top: 14px;

    .el-input {
      flex: 1;
      min-width: 220px;
    }
  }

  .empty-hint {
    color: var(--pillbox-text-muted);
  }

  .el-select,
  .el-date-editor.el-input {
    width: 100%;
  }

  @media (width <= 760px) {
    .routine-grid {
      grid-template-columns: 1fr;
    }

    .tab-toolbar,
    .panel-heading,
    .tag-add-row {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
