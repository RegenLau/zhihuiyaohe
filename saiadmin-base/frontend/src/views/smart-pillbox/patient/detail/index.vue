<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <template v-if="patient.id">
        <div class="patient-detail-stack">
          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <div class="detail-hero">
              <div>
                <h3 class="detail-hero-title">{{ patient.name }} · {{ patient.gender || '-' }} · {{ patient.age ?? '-' }} 岁</h3>
              </div>
              <div class="detail-action-stack">
                <a-space wrap>
                  <a-button
                    v-if="!isEditing"
                    :status="patient.status === '重点关注' ? 'warning' : undefined"
                    :disabled="!patient.id"
                    :loading="statusSaving"
                    @click="toggleFocusPatient"
                  >
                    <template #icon><sa-icon icon="ri:flag-line" :size="16" /></template>
                    {{ patient.status === '重点关注' ? '取消重点标注' : '标注重点患者' }}
                  </a-button>
                  <a-button v-if="isEditing" @click="cancelEdit">
                    <template #icon><sa-icon icon="ri:close-line" :size="16" /></template>
                    取消编辑
                  </a-button>
                  <a-button v-else type="primary" :disabled="!patient.id" @click="startEdit">
                    <template #icon><sa-icon icon="ri:edit-2-line" :size="16" /></template>
                    编辑信息
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-card>
          </div>

          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <a-tabs v-model:active-key="activeTab">
              <a-tab-pane key="basic" title="基本信息">
                <a-form v-if="isEditing" :model="basicForm" layout="vertical">
                  <a-row :gutter="16">
                    <a-col :xs="24" :md="12"><a-form-item label="患者姓名"><a-input v-model="basicForm.name" placeholder="请输入患者姓名" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="手机号"><a-input v-model="basicForm.phone" placeholder="请输入手机号" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12">
                      <a-form-item label="性别">
                        <a-select v-model="basicForm.gender" placeholder="请选择性别"><a-option value="男">男</a-option><a-option value="女">女</a-option></a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="出生年月日"><a-date-picker v-model="basicForm.birthDate" placeholder="请选择出生年月日" style="width: 100%" /></a-form-item></a-col>
                    <a-col :xs="24" :md="12"><a-form-item label="管理药师"><a-input v-model="basicForm.managementPharmacist" placeholder="请输入管理药师" /></a-form-item></a-col>
                  </a-row>
                  <div class="detail-edit-actions">
                    <a-button @click="cancelEdit"><template #icon><sa-icon icon="ri:close-line" :size="16" /></template>取消</a-button>
                    <a-button type="primary" :loading="saving" @click="saveBasicInfo">
                      <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
                      保存基础信息
                    </a-button>
                  </div>
                </a-form>
                <div v-else class="detail-basic-stack">
                  <div class="detail-section">
                    <div class="detail-section-title">患者识别</div>
                    <div class="detail-info-grid">
                      <div class="detail-info-item"><span class="detail-info-label">姓名</span><span class="detail-info-value">{{ patient.name || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">手机号</span><span class="detail-info-value">{{ patient.phone || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">性别</span><span class="detail-info-value">{{ patient.gender || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">出生年月日</span><span class="detail-info-value">{{ patient.birthDate || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">患者编号</span><span class="detail-info-value">{{ patient.recordNo || '-' }}</span></div>
                    </div>
                  </div>
                  <div class="detail-section">
                    <div class="detail-section-title">管理与设备</div>
                    <div class="detail-info-grid">
                      <div class="detail-info-item"><span class="detail-info-label">管理药师</span><span class="detail-info-value">{{ patient.managementPharmacist || '-' }}</span></div>
                      <div class="detail-info-item">
                        <span class="detail-info-label">药盒设备</span>
                        <span class="detail-info-value">
                          <a-link v-if="canOpenDeviceRecord" @click="openDeviceRecord">{{ patient.deviceNo }}</a-link>
                          <template v-else>{{ patient.deviceNo || '-' }}</template>
                        </span>
                      </div>
                      <div class="detail-info-item">
                        <span class="detail-info-label">设备状态</span>
                        <span class="detail-info-value"><a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag></span>
                      </div>
                      <div class="detail-info-item">
                        <span class="detail-info-label">知情同意</span>
                        <span class="detail-info-value"><a-tag :color="patient.consent === '已同意' ? 'green' : 'orange'">{{ patient.consent || '未同意' }}</a-tag></span>
                      </div>
                      <div class="detail-info-item">
                        <span class="detail-info-label">管理状态</span>
                        <span class="detail-info-value"><a-tag :color="patient.status === '重点关注' ? 'orange' : 'green'">{{ patient.status || '正常管理' }}</a-tag></span>
                      </div>
                      <div class="detail-info-item"><span class="detail-info-label">建档时间</span><span class="detail-info-value">{{ patient.createdAt || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">更新时间</span><span class="detail-info-value">{{ patient.updatedAt || '-' }}</span></div>
                      <div class="detail-info-item"><span class="detail-info-label">最近互动</span><span class="detail-info-value">{{ patient.recentInteraction || '-' }}</span></div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <a-tab-pane key="disease" title="基础疾病">
                <a-form v-if="isEditing" :model="diseaseForm" layout="vertical">
                  <a-row :gutter="16">
                    <a-col :xs="24" :md="12">
                      <a-form-item label="慢病史">
                        <a-input v-model="diseaseForm.diseasesText" placeholder="多个用顿号分隔，例如：高血压、糖尿病" />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :md="12">
                      <a-form-item label="既往病史">
                        <a-input v-model="diseaseForm.historyDiseasesText" placeholder="多个用顿号分隔，例如：胃炎" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="24">
                      <a-form-item label="过敏史">
                        <a-textarea
                          v-model="diseaseForm.allergiesText"
                          placeholder="每行一条，例如：青霉素：皮疹、胸闷"
                          :auto-size="{ minRows: 3, maxRows: 5 }"
                        />
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <div class="detail-edit-actions">
                    <a-button @click="cancelEdit"><template #icon><sa-icon icon="ri:close-line" :size="16" /></template>取消</a-button>
                    <a-button type="primary" :loading="saving" @click="saveDiseaseInfo">
                      <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
                      保存基础疾病
                    </a-button>
                  </div>
                </a-form>
                <div v-else class="detail-basic-stack">
                  <div class="detail-section">
                    <div class="detail-info-grid">
                      <div class="detail-info-item">
                        <span class="detail-info-label">慢病史</span>
                        <span class="detail-info-value">
                          <a-space v-if="diseaseTags.length" wrap>
                            <a-tag v-for="item in diseaseTags" :key="item">{{ item }}</a-tag>
                          </a-space>
                          <template v-else>-</template>
                        </span>
                      </div>
                      <div class="detail-info-item">
                        <span class="detail-info-label">既往病史</span>
                        <span class="detail-info-value">
                          <a-space v-if="historyDiseaseTags.length" wrap>
                            <a-tag v-for="item in historyDiseaseTags" :key="item">{{ item }}</a-tag>
                          </a-space>
                          <template v-else>-</template>
                        </span>
                      </div>
                      <div class="detail-info-item is-wide">
                        <span class="detail-info-label">过敏史</span>
                        <span class="detail-info-value detail-list-lines">
                          <template v-if="allergyTags.length">
                            <span v-for="item in allergyTags" :key="item">{{ item }}</span>
                          </template>
                          <template v-else>-</template>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <a-tab-pane key="family" title="家属信息">
                <div v-if="isEditing" class="detail-basic-stack">
                  <div class="detail-edit-actions">
                    <a-button type="primary" @click="addFamilyContact">
                      <template #icon><sa-icon icon="ri:add-line" :size="16" /></template>
                      新增家属
                    </a-button>
                  </div>
                  <a-table row-key="id" :data="familyForm.contacts" :pagination="false" :scroll="{ x: 860 }" bordered>
                    <template #columns>
                      <a-table-column title="关系" :width="140">
                        <template #cell="{ record }">
                          <a-input v-model="record.relation" placeholder="如 女儿" />
                        </template>
                      </a-table-column>
                      <a-table-column title="姓名" :width="160">
                        <template #cell="{ record }">
                          <a-input v-model="record.name" placeholder="请输入姓名" />
                        </template>
                      </a-table-column>
                      <a-table-column title="手机号" :width="180">
                        <template #cell="{ record }">
                          <a-input v-model="record.phone" placeholder="请输入手机号" />
                        </template>
                      </a-table-column>
                      <a-table-column title="绑定状态" :width="110">
                        <template #cell="{ record }">
                          <a-tag :color="contactBindStatusColor(record)">{{ contactBindStatus(record) }}</a-tag>
                        </template>
                      </a-table-column>
                      <a-table-column title="主要联系人" :width="130">
                        <template #cell="{ record }">
                          <a-checkbox :model-value="record.isPrimary" @change="setPrimaryContact(record.id)">主要</a-checkbox>
                        </template>
                      </a-table-column>
                      <a-table-column title="操作" :width="90">
                        <template #cell="{ record }">
                          <a-button size="mini" status="danger" @click="removeFamilyContact(record.id)">删除</a-button>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                  <div class="detail-edit-actions">
                    <a-button @click="cancelEdit"><template #icon><sa-icon icon="ri:close-line" :size="16" /></template>取消</a-button>
                    <a-button type="primary" :loading="saving" @click="saveFamilyInfo">
                      <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
                      保存家属信息
                    </a-button>
                  </div>
                </div>
                <div v-else class="detail-basic-stack">
                  <a-table row-key="id" :data="patient.contacts || []" :pagination="false" :scroll="{ x: 720 }" bordered>
                    <template #columns>
                      <a-table-column title="关系" data-index="relation" :width="120" />
                      <a-table-column title="姓名" data-index="name" :width="140" />
                      <a-table-column title="手机号" data-index="phone" :width="170" />
                      <a-table-column title="绑定状态" :width="110">
                        <template #cell="{ record }">
                          <a-tag :color="contactBindStatusColor(record)">{{ contactBindStatus(record) }}</a-tag>
                        </template>
                      </a-table-column>
                      <a-table-column title="主要联系人" :width="120">
                        <template #cell="{ record }">
                          <a-tag v-if="record.isPrimary" color="green">主要</a-tag>
                          <template v-else>-</template>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </a-tab-pane>

              <a-tab-pane key="records" title="用药记录">
                <div class="health-tab-pane">
                  <div class="tab-toolbar">
                    <div>
                      <h4>用药执行</h4>
                      <p>保留最近服药记录和当前执行状态。</p>
                    </div>
                    <a-space wrap>
                      <a-button size="small" @click="router.push(`/doctor/plans?patientId=${patient.id}`)">用药计划</a-button>
                      <a-button size="small" type="primary" @click="router.push(`/doctor/tasks?patientId=${patient.id}`)">今日任务</a-button>
                    </a-space>
                  </div>
                  <a-descriptions :column="4" bordered>
                    <a-descriptions-item label="服药完成率">{{ patient.completionRate ?? 0 }}%</a-descriptions-item>
                    <a-descriptions-item label="今日用药">{{ patient.todayDrugs || 0 }} 种</a-descriptions-item>
                    <a-descriptions-item label="下一提醒">{{ patient.nextReminder || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="当前状态"><a-tag :color="taskRiskTagColor">{{ patient.taskRisk || '正常' }}</a-tag></a-descriptions-item>
                  </a-descriptions>
                  <a-table
                    row-key="id"
                    :data="medicineRecords"
                    :pagination="false"
                    :scroll="{ x: 700 }"
                    class="smart-block-gap-sm"
                    bordered
                  >
                    <template #columns>
                      <a-table-column title="时间" data-index="time" :width="170" />
                      <a-table-column title="药品" data-index="commonName" />
                      <a-table-column title="剂量" data-index="dosage" :width="120" />
                      <a-table-column title="来源" data-index="source" :width="130" />
                      <a-table-column title="状态" :width="110">
                        <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>
              </a-tab-pane>

            </a-tabs>
          </a-card>
          </div>
        </div>
      </template>
      <a-empty v-else description="未找到患者档案" />
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute, useRouter } from 'vue-router'
import { patientApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { calculateAge, formatDateTime, getPayload, getRecords, pickQueryValue, splitTags, statusColor } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const statusSaving = ref(false)
const activeTab = ref('basic')
const isEditing = ref(false)
const patient = reactive({})
const medicineRecords = ref([])

const basicForm = reactive({ name: '', phone: '', gender: '男', birthDate: '', managementPharmacist: '' })
const diseaseForm = reactive({ diseasesText: '', historyDiseasesText: '', allergiesText: '' })
const familyForm = reactive({ contacts: [] })

const patientId = computed(() => {
  const value = pickQueryValue(route.query.patientId, route.query.id)
  return value ? String(value) : ''
})
const taskRiskTagColor = computed(() => {
  const value = String(patient.taskRisk || '')
  if (!value || value === '正常') return 'green'
  if (value.includes('漏服') || value.includes('异常')) return 'red'
  if (value.includes('无计划')) return 'orange'
  return statusColor(value)
})
const canOpenDeviceRecord = computed(() => Boolean(patient.deviceNo && !['-', '未绑定'].includes(String(patient.deviceNo))))
const contactBindStatus = (contact) => (contact?.name && contact?.phone ? '已绑定' : '未绑定')
const contactBindStatusColor = (contact) => (contactBindStatus(contact) === '已绑定' ? 'green' : 'orange')
const normalizeTags = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  return splitTags(value)
}
const diseaseTags = computed(() => normalizeTags(patient.diseases))
const historyDiseaseTags = computed(() => normalizeTags(patient.historyDiseases))
const allergyTags = computed(() => {
  if (!Array.isArray(patient.allergies)) return splitTags(patient.allergies)
  return patient.allergies
    .map((item) => {
      if (typeof item === 'string') return item
      return [item?.allergen, item?.reaction].filter(Boolean).join('：')
    })
    .filter(Boolean)
})
const joinTags = (value) => normalizeTags(value).join('、')
const formatAllergyText = (value) => {
  if (!Array.isArray(value)) return splitTags(value).join('\n')
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      return [item?.allergen, item?.reaction].filter(Boolean).join('：')
    })
    .filter(Boolean)
    .join('\n')
}
const parseAllergies = (value) => {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const [allergen, ...reactionParts] = item.split(/[:：]/)
      return {
        id: `ALG-${Date.now()}-${index}`,
        allergenType: 'drug',
        allergen: allergen.trim(),
        severity: '',
        reaction: reactionParts.join('：').trim()
      }
    })
    .filter((item) => item.allergen)
}
const normalizeContacts = (contacts = []) =>
  contacts
    .filter((item) => item.relation || item.name || item.phone)
    .map((item, index) => ({
      id: item.id || `CT-${Date.now()}-${index}`,
      relation: item.relation || '',
      name: item.name || '',
      phone: item.phone || '',
      isPrimary: Boolean(item.isPrimary)
    }))
const buildChildValue = (contacts) => {
  const primaryContact = contacts.find((item) => item.isPrimary) || contacts[0]
  if (!primaryContact) return '未绑定'
  return [primaryContact.relation, primaryContact.name, primaryContact.phone].filter(Boolean).join(' ') || '未绑定'
}

const syncEditForms = () => {
  Object.assign(basicForm, {
    name: patient.name || '',
    phone: patient.phone || '',
    gender: patient.gender || '男',
    birthDate: patient.birthDate || '',
    managementPharmacist: patient.managementPharmacist || ''
  })
  Object.assign(diseaseForm, {
    diseasesText: joinTags(patient.diseases),
    historyDiseasesText: joinTags(patient.historyDiseases),
    allergiesText: formatAllergyText(patient.allergies)
  })
  familyForm.contacts.splice(
    0,
    familyForm.contacts.length,
    ...normalizeContacts(patient.contacts || []).map((item) => ({ ...item }))
  )
}

const startEdit = () => {
  syncEditForms()
  isEditing.value = true
}

const cancelEdit = () => {
  syncEditForms()
  isEditing.value = false
}

const openDeviceRecord = () => {
  if (!canOpenDeviceRecord.value) return
  router.push({ path: '/doctor/devices', query: { sn: patient.deviceNo } })
}

const updatePatient = async (payload, successText) => {
  saving.value = true
  try {
    const response = await patientApi.update({ ...patient, ...payload, updatedAt: formatDateTime() })
    Object.assign(patient, getPayload(response))
    syncEditForms()
    Message.success(successText)
  } finally {
    saving.value = false
  }
}

const saveBasicInfo = () => updatePatient({ ...basicForm, age: calculateAge(basicForm.birthDate) || patient.age }, '基础信息已保存')
const saveDiseaseInfo = () =>
  updatePatient(
    {
      diseases: splitTags(diseaseForm.diseasesText),
      historyDiseases: splitTags(diseaseForm.historyDiseasesText),
      allergies: parseAllergies(diseaseForm.allergiesText)
    },
    '基础疾病已保存'
  )
const addFamilyContact = () => {
  familyForm.contacts.push({
    id: `CT-${Date.now()}`,
    relation: '',
    name: '',
    phone: '',
    isPrimary: familyForm.contacts.length === 0
  })
}
const setPrimaryContact = (id) => {
  familyForm.contacts.forEach((contact) => {
    contact.isPrimary = contact.id === id
  })
}
const removeFamilyContact = (id) => {
  const index = familyForm.contacts.findIndex((contact) => contact.id === id)
  if (index < 0) return
  const removedPrimary = familyForm.contacts[index].isPrimary
  familyForm.contacts.splice(index, 1)
  if (removedPrimary && familyForm.contacts.length) familyForm.contacts[0].isPrimary = true
}
const saveFamilyInfo = () => {
  const contacts = normalizeContacts(familyForm.contacts)
  if (contacts.length && !contacts.some((item) => item.isPrimary)) contacts[0].isPrimary = true
  return updatePatient({ contacts, child: buildChildValue(contacts) }, '家属信息已保存')
}

const toggleFocusPatient = async () => {
  const nextStatus = patient.status === '重点关注' ? '正常管理' : '重点关注'
  statusSaving.value = true
  try {
    const response = await patientApi.update({ ...patient, status: nextStatus, updatedAt: formatDateTime() })
    Object.assign(patient, getPayload(response))
    syncEditForms()
    Message.success(nextStatus === '重点关注' ? '已标注为重点患者' : '已取消重点标注')
  } finally {
    statusSaving.value = false
  }
}

const loadAll = async () => {
  if (!patientId.value) {
    Object.keys(patient).forEach((key) => delete patient[key])
    medicineRecords.value = []
    isEditing.value = false
    syncEditForms()
    return
  }
  loading.value = true
  try {
    const [patientResponse, recordsResponse] = await Promise.all([
      patientApi.read(patientId.value),
      patientApi.medicineRecords(patientId.value)
    ])
    Object.keys(patient).forEach((key) => delete patient[key])
    Object.assign(patient, getPayload(patientResponse))
    medicineRecords.value = getRecords(recordsResponse)
    syncEditForms()
    isEditing.value = false
  } finally {
    loading.value = false
  }
}

watch(() => [route.query.patientId, route.query.id], loadAll)
onMounted(loadAll)
</script>
