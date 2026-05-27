<template>
  <div class="smart-page">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="15">
        <div class="ma-content-block p-3">
        <a-card title="知情同意书设置" :loading="loading" :bordered="false">
          <template #extra>
            <a-button type="primary" :loading="saving" @click="saveSettings">
              <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
              保存
            </a-button>
          </template>
          <a-form :model="agreement" layout="vertical">
            <a-row :gutter="16">
              <a-col :xs="24" :md="12"><a-form-item label="协议名称"><a-input v-model="agreement.name" placeholder="请输入协议名称" /></a-form-item></a-col>
              <a-col :xs="24" :md="12"><a-form-item label="当前版本"><a-input v-model="agreement.version" placeholder="请输入版本号" /></a-form-item></a-col>
              <a-col :xs="24" :md="12"><a-form-item label="启用状态"><a-switch v-model="agreement.status" :checked-value="1" :unchecked-value="0" /></a-form-item></a-col>
              <a-col :xs="24" :md="12"><a-form-item label="适用端"><a-input model-value="小程序患者端 / 子女端" readonly /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="协议摘要"><a-textarea v-model="agreement.summary" placeholder="请输入协议摘要" :auto-size="{ minRows: 4, maxRows: 5 }" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="协议正文"><a-textarea v-model="agreement.content" :auto-size="{ minRows: 12, maxRows: 18 }" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </a-card>
        </div>
      </a-col>
      <a-col :xs="24" :lg="9">
        <div class="ma-content-block p-3">
        <a-card title="患者知情同意记录" :bordered="false" :loading="recordsLoading">
          <a-table row-key="id" :data="consentRecords" :pagination="false" size="small" :scroll="{ x: 520 }">
            <template #columns>
              <a-table-column title="患者" data-index="patient" :width="90" />
              <a-table-column title="版本" data-index="version" :width="92" />
              <a-table-column title="确认端" data-index="confirmTerminal" :width="120" />
              <a-table-column title="状态" data-index="status" :width="90">
                <template #cell="{ record }"><a-tag :color="record.status === '已同意' ? 'green' : 'red'">{{ record.status }}</a-tag></template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { settingsApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getPayload, getRecords } from '@/views/smart-pillbox/utils'

const loading = ref(false)
const saving = ref(false)
const recordsLoading = ref(false)
const consentRecords = ref([])
const agreement = reactive({
  name: '智慧药盒服务知情同意书',
  version: 'V2026.05',
  status: 1,
  updatedAt: '2026-05-21 14:08',
  summary: '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
  ocrEnabled: true,
  ocrFileTypes: 'jpg、png、pdf',
  ocrFields: '药品名称、规格、剂量、频次、服药时段、疗程、注意事项',
  ocrProvider: 'mock 识别服务',
  content:
    '<p>一、服务目的：智慧药盒用于辅助用药提醒和用药管理，不替代医生诊疗意见。</p><p>二、信息采集：系统将采集患者基础信息、用药计划、药盒设备状态、服药任务记录和语音问答记录。</p><p>三、风险提示：如出现胸闷、严重不适、疑似不良反应等情况，请及时联系医药师或前往医疗机构。</p><p>四、授权确认：患者或家属点击同意后，表示已阅读并理解上述内容。</p>'
})

const loadSettings = async () => {
  loading.value = true
  try {
    const response = await settingsApi.read()
    Object.assign(agreement, getPayload(response))
  } finally {
    loading.value = false
  }
}

const loadConsentRecords = async () => {
  recordsLoading.value = true
  try {
    const response = await settingsApi.consentRecords({ limit: 100 })
    consentRecords.value = getRecords(response)
  } finally {
    recordsLoading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const response = await settingsApi.update(agreement)
    Object.assign(agreement, getPayload(response))
    Message.success('知情同意书设置已保存')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
  loadConsentRecords()
})
</script>
