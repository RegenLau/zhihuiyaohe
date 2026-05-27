<template>
  <div class="smart-page">
    <a-spin :loading="loading">
      <template v-if="patient.id">
        <div class="patient-detail-stack">
          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <div class="detail-hero">
              <div>
                <h3>{{ patient.name }} · {{ patient.recordNo }}</h3>
                <p class="smart-muted" style="margin: 6px 0 0">
                  {{ patient.gender }} · {{ patient.age }} 岁 · {{ patient.phone }} ·
                  {{ patient.managementPharmacist || '未分配药师' }}
                </p>
                <div class="chip-row" style="margin-top: 12px">
                  <a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag>
                  <a-tag :color="patient.status === '重点关注' ? 'orange' : 'green'">
                    {{ patient.status || '正常管理' }}
                  </a-tag>
                </div>
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
                <a-space wrap>
                  <a-button @click="router.push(`/doctor/plans?patientId=${patient.id}`)">
                    <template #icon><sa-icon icon="ri:calendar-check-line" :size="16" /></template>
                    用药计划
                  </a-button>
                  <a-button @click="router.push(`/doctor/tasks?patientId=${patient.id}`)">
                    <template #icon><sa-icon icon="ri:checkbox-circle-line" :size="16" /></template>
                    今日任务
                  </a-button>
                  <a-button @click="router.push(`/doctor/conversations?patientId=${patient.id}`)">
                    <template #icon><sa-icon icon="ri:message-3-line" :size="16" /></template>
                    对话记录
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-card>
          </div>

          <div class="ma-content-block p-4">
            <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16">
              <a-grid-item :span="6">
                <a-space direction="vertical" :size="2"><a-typography-text type="secondary">服药完成率</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ patient.completionRate }}%</a-typography-title></a-space>
              </a-grid-item>
              <a-grid-item :span="6">
                <a-space direction="vertical" :size="2"><a-typography-text type="secondary">今日用药</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ patient.todayDrugs }} 种</a-typography-title></a-space>
              </a-grid-item>
              <a-grid-item :span="6">
                <a-space direction="vertical" :size="2"><a-typography-text type="secondary">下一提醒</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ patient.nextReminder }}</a-typography-title></a-space>
              </a-grid-item>
              <a-grid-item :span="6">
                <a-space direction="vertical" :size="2"><a-typography-text type="secondary">最近风险</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ patient.taskRisk }}</a-typography-title></a-space>
              </a-grid-item>
            </a-grid>
          </div>

          <div class="ma-content-block p-3">
          <a-card :bordered="false">
            <a-tabs v-model:active-key="activeTab">
              <a-tab-pane key="basic" title="基础信息">
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
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="出生年月">{{ patient.birthDate || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="管理药师">{{ patient.managementPharmacist || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="药盒设备">{{ patient.deviceNo }}</a-descriptions-item>
                    <a-descriptions-item label="设备状态"><a-tag :color="statusColor(patient.deviceStatus)">{{ patient.deviceStatus }}</a-tag></a-descriptions-item>
                    <a-descriptions-item label="知情同意">{{ patient.consent }}</a-descriptions-item>
                    <a-descriptions-item label="最近互动">{{ patient.recentInteraction || '-' }}</a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>

              <a-tab-pane key="health" title="健康数据">
                <div class="health-tab-pane">
                  <div class="tab-toolbar">
                    <div>
                      <h4>健康数据</h4>
                      <p>展示最近上报数据和基础趋势。</p>
                    </div>
                    <a-button size="small" @click="router.push(`/doctor/health-data?patientId=${patient.id}`)">
                      查看全部
                    </a-button>
                  </div>
                  <a-descriptions :column="4" bordered>
                    <a-descriptions-item label="平均血压">{{ averageBloodPressure }}</a-descriptions-item>
                    <a-descriptions-item label="平均空腹血糖">{{ averageGlucose }}</a-descriptions-item>
                    <a-descriptions-item label="响应率">{{ healthSummary.complianceRate ?? 0 }}%</a-descriptions-item>
                    <a-descriptions-item label="趋势">{{ healthTrendText }}</a-descriptions-item>
                  </a-descriptions>
                  <a-table
                    v-if="healthRecords.length"
                    row-key="id"
                    :data="healthRecords"
                    :pagination="false"
                    size="small"
                    :scroll="{ x: 640 }"
                    bordered
                  >
                    <template #columns>
                      <a-table-column title="日期" data-index="date" :width="120" />
                      <a-table-column title="晨间血压" data-index="morningBP" :width="120">
                        <template #cell="{ record }">{{ record.morningBP || '未上报' }}</template>
                      </a-table-column>
                      <a-table-column title="晚间血压" data-index="eveningBP" :width="120">
                        <template #cell="{ record }">{{ record.eveningBP || '未上报' }}</template>
                      </a-table-column>
                      <a-table-column title="空腹血糖" data-index="fastingGlucose" :width="130">
                        <template #cell="{ record }">{{ formatGlucose(record.fastingGlucose) }}</template>
                      </a-table-column>
                      <a-table-column title="风险" data-index="riskLevel" :width="100">
                        <template #cell="{ record }"><a-tag :color="statusColor(record.riskLevel)">{{ record.riskLevel }}</a-tag></template>
                      </a-table-column>
                      <a-table-column title="备注" data-index="note" />
                    </template>
                  </a-table>
                  <a-empty v-else description="暂无健康数据" />
                </div>
              </a-tab-pane>

              <a-tab-pane key="shortage" title="缺药上报">
                <div class="tab-toolbar">
                  <div>
                    <h4>缺药上报</h4>
                    <p>展示患者、子女端和药盒余量规则上报的补药风险。</p>
                  </div>
                  <a-button size="small" @click="router.push(`/doctor/health-data?tab=shortage&patientId=${patient.id}`)">查看全部</a-button>
                </div>
                <a-table row-key="id" :data="shortageRecords" :pagination="false" :scroll="{ x: 680 }" bordered>
                  <template #columns>
                    <a-table-column title="药品" data-index="medicine" />
                    <a-table-column title="剩余量" data-index="remainingAmount" :width="110" />
                    <a-table-column title="预计可用" data-index="expectedDays" :width="110">
                      <template #cell="{ record }">{{ record.expectedDays }} 天</template>
                    </a-table-column>
                    <a-table-column title="来源" data-index="source" :width="130" />
                    <a-table-column title="状态" data-index="status" :width="100">
                      <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
                    </a-table-column>
                    <a-table-column title="处理结果" data-index="result" />
                  </template>
                </a-table>
              </a-tab-pane>

              <a-tab-pane key="consent" title="知情同意">
                <div class="tab-toolbar">
                  <div>
                    <h4>知情同意记录</h4>
                    <p>展示患者或子女端确认的协议版本和确认时间。</p>
                  </div>
                </div>
                <a-table row-key="id" :data="consentRecords" :pagination="false" :scroll="{ x: 620 }" bordered>
                  <template #columns>
                    <a-table-column title="协议版本" data-index="version" :width="120" />
                    <a-table-column title="确认时间" data-index="confirmTime" :width="170">
                      <template #cell="{ record }">{{ record.confirmTime || '-' }}</template>
                    </a-table-column>
                    <a-table-column title="确认端" data-index="confirmTerminal" :width="140" />
                    <a-table-column title="状态" data-index="status" :width="110">
                      <template #cell="{ record }"><a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag></template>
                    </a-table-column>
                  </template>
                </a-table>
              </a-tab-pane>

            <a-tab-pane key="contacts" title="联系人">
              <div class="tab-toolbar">
                <div><h4>联系人</h4><p>维护家属联系人和主要联系人信息</p></div>
              </div>
              <div v-if="isEditing" class="edit-stack">
                <a-table v-if="contactDrafts.length" row-key="id" :data="contactDrafts" :pagination="false" :scroll="{ x: 560 }" bordered>
                  <template #columns>
                    <a-table-column title="关系" data-index="relation" :width="120" />
                    <a-table-column title="姓名" data-index="name" :width="140" />
                    <a-table-column title="电话" data-index="phone" />
                    <a-table-column title="主要联系人" :width="140">
                      <template #cell="{ record }">
                        <a-tag v-if="record.isPrimary" color="green">主要</a-tag>
                        <a-link v-else @click="setPrimaryContact(record.id)">设为主要</a-link>
                      </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="100">
                      <template #cell="{ record }"><a-link status="danger" @click="removeContactDraft(record.id)">删除</a-link></template>
                    </a-table-column>
                  </template>
                </a-table>
                <a-empty v-else description="暂无联系人信息" />
                <div v-if="contactFormVisible" class="smart-block-gap-sm">
                  <div class="panel-header">
                    <div><h5>添加联系人</h5><p>补充家属或紧急联系信息，保存后会同步到当前患者档案。</p></div>
                    <a-avatar :size="32" style="color: rgb(var(--primary-6)); background-color: rgb(var(--primary-1))">
                      <sa-icon icon="ri:add-line" :size="18" />
                    </a-avatar>
                  </div>
                  <a-row :gutter="12">
                    <a-col :xs="24" :md="8"><a-input v-model="contactForm.relation" placeholder="关系，例如：配偶" /></a-col>
                    <a-col :xs="24" :md="8"><a-input v-model="contactForm.name" placeholder="姓名" /></a-col>
                    <a-col :xs="24" :md="8"><a-input v-model="contactForm.phone" placeholder="电话" /></a-col>
                  </a-row>
                  <div class="inline-actions" style="margin-top: 14px">
                    <a-button @click="resetContactForm">取消</a-button>
                    <a-button type="primary" @click="addContactDraft">添加到列表</a-button>
                  </div>
                </div>
                <div v-else style="text-align: center">
                  <a-button shape="round" @click="contactFormVisible = true">
                    <template #icon><sa-icon icon="ri:user-add-line" :size="16" /></template>
                    添加联系人
                  </a-button>
                </div>
                <div class="detail-edit-actions">
                  <a-button @click="cancelEdit">取消</a-button>
                  <a-button type="primary" :loading="saving" @click="saveContacts">保存联系人</a-button>
                </div>
              </div>
              <a-table v-else row-key="id" :data="patient.contacts || []" :pagination="false" :scroll="{ x: 520 }" bordered>
                <template #columns>
                  <a-table-column title="关系" data-index="relation" :width="120" />
                  <a-table-column title="姓名" data-index="name" :width="140" />
                  <a-table-column title="电话" data-index="phone" />
                  <a-table-column title="主联系人" :width="120">
                    <template #cell="{ record }"><a-tag :color="record.isPrimary ? 'green' : 'gray'">{{ record.isPrimary ? '是' : '否' }}</a-tag></template>
                  </a-table-column>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="allergies" title="病史&过敏史">
              <div class="tab-toolbar">
                <div><h4>病史&过敏史</h4><p>用于药品审核与复诊建议，可留空。</p></div>
              </div>
              <div v-if="isEditing" class="history-edit">
                <div class="history-section">
                  <h5>慢病史</h5>
                  <a-space direction="vertical" fill>
                    <div v-if="diseaseDrafts.length" class="chip-row">
                      <a-tag v-for="item in diseaseDrafts" :key="item" closable @close="removeDisease(item)">{{ item }}</a-tag>
                    </div>
                    <a-typography-text v-else type="secondary">暂无慢病史记录</a-typography-text>
                  </a-space>
                  <a-space direction="vertical" fill class="smart-block-gap-sm">
                    <a-typography-text type="secondary">待选项</a-typography-text>
                    <div class="preset-row">
                      <a-button v-for="option in chronicDiseasePresets" :key="option" shape="round" :type="diseaseDrafts.includes(option) ? 'primary' : 'secondary'" @click="toggleDisease(option)">
                        {{ option }}
                      </a-button>
                    </div>
                    <div class="tag-add-row"><a-input v-model="newDisease" placeholder="新增慢病，例如：慢性肾病" /><a-button type="primary" @click="addDisease">添加慢病</a-button></div>
                  </a-space>
                </div>
                <div class="history-section">
                  <h5>过敏史</h5>
                  <a-space direction="vertical" fill>
                    <div v-if="allergyDrafts.length" class="chip-row">
                      <a-tag v-for="item in allergyDrafts" :key="item" closable @close="removeAllergy(item)">{{ item }}</a-tag>
                    </div>
                    <a-typography-text v-else type="secondary">暂无过敏史记录</a-typography-text>
                  </a-space>
                  <a-space direction="vertical" fill class="smart-block-gap-sm">
                    <a-typography-text type="secondary">待选项</a-typography-text>
                    <div class="preset-row">
                      <a-button v-for="option in allergyPresets" :key="option" shape="round" :type="allergyDrafts.includes(option) ? 'primary' : 'secondary'" @click="toggleAllergy(option)">
                        {{ option }}
                      </a-button>
                    </div>
                    <div class="tag-add-row"><a-input v-model="newAllergy" placeholder="新增过敏，例如：海鲜" /><a-button type="primary" @click="addAllergy">添加过敏</a-button></div>
                  </a-space>
                </div>
                <div class="detail-edit-actions">
                  <a-button @click="cancelEdit">取消</a-button>
                  <a-button type="primary" :loading="saving" @click="saveAllergies">保存病史&过敏史</a-button>
                </div>
              </div>
              <div v-else class="history-edit">
                <div class="history-section">
                  <h5>慢病史</h5>
                  <a-space direction="vertical" fill><div v-if="patient.diseases?.length" class="chip-row"><a-tag v-for="item in patient.diseases" :key="item">{{ item }}</a-tag></div><a-typography-text v-else type="secondary">暂无慢病史记录</a-typography-text></a-space>
                </div>
                <div class="history-section">
                  <h5>过敏史</h5>
                  <a-space direction="vertical" fill><div v-if="displayAllergyNames.length" class="chip-row"><a-tag v-for="item in displayAllergyNames" :key="item">{{ item }}</a-tag></div><a-typography-text v-else type="secondary">暂无过敏史记录</a-typography-text></a-space>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="routine" title="作息时间">
              <a-form v-if="isEditing" :model="routineForm" layout="vertical">
                <a-row :gutter="16">
                  <a-col :xs="24" :md="12"><a-form-item label="早餐"><a-time-picker v-model="routineForm.breakfastTime" placeholder="请选择早餐时间" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
                  <a-col :xs="24" :md="12"><a-form-item label="午餐"><a-time-picker v-model="routineForm.lunchTime" placeholder="请选择午餐时间" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
                  <a-col :xs="24" :md="12"><a-form-item label="晚餐"><a-time-picker v-model="routineForm.dinnerTime" placeholder="请选择晚餐时间" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
                  <a-col :xs="24" :md="12"><a-form-item label="睡眠"><a-time-picker v-model="routineForm.sleepTime" placeholder="请选择睡眠时间" format="HH:mm" style="width: 100%" /></a-form-item></a-col>
                </a-row>
                <div class="detail-edit-actions"><a-button @click="cancelEdit">取消</a-button><a-button type="primary" :loading="saving" @click="saveRoutine">保存作息时间</a-button></div>
              </a-form>
              <div v-else class="summary-grid">
                  <a-grid :cols="{ xs: 1, sm: 12, md: 24 }" :row-gap="16" style="width: 100%">
                    <a-grid-item v-for="item in routineItems" :key="item.label" :span="6">
                    <a-space direction="vertical" :size="2"><a-typography-text type="secondary">{{ item.label }}</a-typography-text><a-typography-title :heading="5" style="margin: 0">{{ item.value }}</a-typography-title></a-space>
                  </a-grid-item>
                </a-grid>
              </div>
            </a-tab-pane>

            <a-tab-pane key="records" title="用药记录">
              <a-table row-key="id" :data="medicineRecords" :pagination="false" :scroll="{ x: 700 }" bordered>
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
import { healthApi, patientApi, settingsApi, shortageApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { calculateAge, formatDateTime, getPayload, getRecords, pickQueryValue, statusColor, unwrapAllergyNames } from '@/views/smart-pillbox/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const statusSaving = ref(false)
const activeTab = ref('basic')
const isEditing = ref(false)
const patient = reactive({})
const medicineRecords = ref([])
const healthSummary = reactive({})
const healthRecords = ref([])
const shortageRecords = ref([])
const consentRecords = ref([])

const basicForm = reactive({ name: '', phone: '', gender: '男', birthDate: '', managementPharmacist: '' })
const routineForm = reactive({ breakfastTime: '', lunchTime: '', dinnerTime: '', sleepTime: '' })
const contactDrafts = ref([])
const contactFormVisible = ref(false)
const contactForm = reactive({ relation: '', name: '', phone: '' })
const diseaseDrafts = ref([])
const allergyDrafts = ref([])
const newDisease = ref('')
const newAllergy = ref('')

const chronicDiseasePresets = ['高血压', '糖尿病', '高血脂', '冠心病', '高尿酸']
const allergyPresets = ['青霉素', '头孢菌素', '磺胺类', '阿司匹林', '他汀类']

const patientId = computed(() => {
  const value = pickQueryValue(route.query.patientId, route.query.id)
  return value ? String(value) : ''
})
const riskSummaryClass = computed(() => {
  if (!patient.taskRisk) return ''
  if (String(patient.taskRisk).includes('漏服') || String(patient.taskRisk).includes('异常')) return 'is-danger'
  if (patient.taskRisk === '正常') return 'is-success'
  return 'is-warning'
})
const routineItems = computed(() => [
  { label: '早餐', value: patient.breakfastTime || '-' },
  { label: '午餐', value: patient.lunchTime || '-' },
  { label: '晚餐', value: patient.dinnerTime || '-' },
  { label: '睡眠', value: patient.sleepTime || '-' }
])
const displayAllergyNames = computed(() => unwrapAllergyNames(patient.allergies || []))
const averageBloodPressure = computed(() => {
  return healthSummary.avgSystolic ? `${healthSummary.avgSystolic}/${healthSummary.avgDiastolic}` : '-'
})
const averageGlucose = computed(() => (healthSummary.avgGlucose ? `${healthSummary.avgGlucose} mmol/L` : '-'))
const healthTrendText = computed(() => {
  const bpTrend = Number(healthSummary.systolicTrend || 0)
  const glucoseTrend = Number(healthSummary.glucoseTrend || 0)
  const bpText = bpTrend > 0 ? `收缩压 +${bpTrend}` : `收缩压 ${bpTrend}`
  const glucoseText = glucoseTrend > 0 ? `血糖 +${glucoseTrend}` : `血糖 ${glucoseTrend}`
  return `${bpText}，${glucoseText}`
})
const formatGlucose = (value) => (typeof value === 'number' ? `${value} mmol/L` : '未上报')

const getUniqueValues = (values = []) => Array.from(new Set(values.map((item) => String(item).trim()).filter(Boolean)))
const normalizeContacts = (contacts = []) => {
  const next = contacts
    .map((item, index) => ({
      id: item.id || `CT-DETAIL-${index}`,
      relation: item.relation || '其他',
      name: item.name || '',
      phone: item.phone || '',
      isPrimary: Boolean(item.isPrimary)
    }))
    .filter((item) => item.name && item.phone)
  if (next.length && !next.some((item) => item.isPrimary)) next[0].isPrimary = true
  return next
}

const syncEditForms = () => {
  Object.assign(basicForm, {
    name: patient.name || '',
    phone: patient.phone || '',
    gender: patient.gender || '男',
    birthDate: patient.birthDate || '',
    managementPharmacist: patient.managementPharmacist || ''
  })
  Object.assign(routineForm, {
    breakfastTime: patient.breakfastTime || '',
    lunchTime: patient.lunchTime || '',
    dinnerTime: patient.dinnerTime || '',
    sleepTime: patient.sleepTime || ''
  })
  contactDrafts.value = normalizeContacts(patient.contacts || [])
  diseaseDrafts.value = getUniqueValues(patient.diseases || [])
  allergyDrafts.value = displayAllergyNames.value
  resetContactForm()
  newDisease.value = ''
  newAllergy.value = ''
}

const startEdit = () => {
  syncEditForms()
  isEditing.value = true
}

const cancelEdit = () => {
  syncEditForms()
  isEditing.value = false
}

const resetContactForm = () => {
  Object.assign(contactForm, { relation: '', name: '', phone: '' })
  contactFormVisible.value = false
}

const addContactDraft = () => {
  if (!contactForm.name.trim() || !contactForm.phone.trim()) {
    Message.warning('请填写联系人姓名和电话')
    return
  }
  contactDrafts.value = normalizeContacts([
    ...contactDrafts.value,
    { id: `CT-DETAIL-${Date.now()}`, relation: contactForm.relation || '其他', name: contactForm.name, phone: contactForm.phone, isPrimary: contactDrafts.value.length === 0 }
  ])
  resetContactForm()
}

const removeContactDraft = (id) => {
  contactDrafts.value = normalizeContacts(contactDrafts.value.filter((item) => item.id !== id))
}
const setPrimaryContact = (id) => {
  contactDrafts.value = contactDrafts.value.map((item) => ({ ...item, isPrimary: item.id === id }))
}
const getChildInfo = (contacts) => {
  const primary = contacts.find((item) => item.isPrimary) || contacts[0]
  return primary ? `${primary.relation} ${primary.name} ${primary.phone}` : '未绑定'
}

const toggleDisease = (value) => {
  diseaseDrafts.value = diseaseDrafts.value.includes(value) ? diseaseDrafts.value.filter((item) => item !== value) : [...diseaseDrafts.value, value]
}
const toggleAllergy = (value) => {
  allergyDrafts.value = allergyDrafts.value.includes(value) ? allergyDrafts.value.filter((item) => item !== value) : [...allergyDrafts.value, value]
}
const addDisease = () => {
  const value = newDisease.value.trim()
  if (!value || diseaseDrafts.value.includes(value)) return
  diseaseDrafts.value.push(value)
  newDisease.value = ''
}
const addAllergy = () => {
  const value = newAllergy.value.trim()
  if (!value || allergyDrafts.value.includes(value)) return
  allergyDrafts.value.push(value)
  newAllergy.value = ''
}
const removeDisease = (value) => {
  diseaseDrafts.value = diseaseDrafts.value.filter((item) => item !== value)
}
const removeAllergy = (value) => {
  allergyDrafts.value = allergyDrafts.value.filter((item) => item !== value)
}
const buildAllergyPayload = () => {
  const existing = new Map((patient.allergies || []).map((item) => [item.allergen, item]))
  return allergyDrafts.value.map((allergen, index) => existing.get(allergen) || { id: `ALG-DETAIL-${patient.id}-${index}`, allergenType: 'other', allergen, severity: 'mild', reaction: '' })
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
const saveRoutine = () => updatePatient({ ...routineForm }, '作息时间已保存')
const saveContacts = () => {
  const contacts = normalizeContacts(contactDrafts.value)
  return updatePatient({ contacts, child: getChildInfo(contacts) }, '联系人已保存')
}
const saveAllergies = () => updatePatient({ allergies: buildAllergyPayload(), diseases: getUniqueValues(diseaseDrafts.value) }, '病史&过敏史已保存')

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
    Object.keys(healthSummary).forEach((key) => delete healthSummary[key])
    healthRecords.value = []
    shortageRecords.value = []
    consentRecords.value = []
    isEditing.value = false
    syncEditForms()
    return
  }
  loading.value = true
  try {
    const [patientResponse, recordsResponse, healthSummaryResponse, healthRecordsResponse, shortageResponse, consentResponse] = await Promise.all([
      patientApi.read(patientId.value),
      patientApi.medicineRecords(patientId.value),
      healthApi.summary(patientId.value),
      healthApi.list({ patientId: patientId.value, page: 1, limit: 3 }),
      shortageApi.list({ patientId: patientId.value, page: 1, limit: 5 }),
      settingsApi.consentRecords({ patientId: patientId.value, page: 1, limit: 5 })
    ])
    Object.keys(patient).forEach((key) => delete patient[key])
    Object.assign(patient, getPayload(patientResponse))
    medicineRecords.value = getRecords(recordsResponse)
    Object.keys(healthSummary).forEach((key) => delete healthSummary[key])
    Object.assign(healthSummary, getPayload(healthSummaryResponse))
    healthRecords.value = getRecords(healthRecordsResponse)
    shortageRecords.value = getRecords(shortageResponse)
    consentRecords.value = getRecords(consentResponse)
    syncEditForms()
    isEditing.value = false
  } finally {
    loading.value = false
  }
}

watch(() => [route.query.patientId, route.query.id], loadAll)
onMounted(loadAll)
</script>
