<template>
  <div class="smart-page">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="15">
        <a-card class="smart-panel" :loading="loading" :bordered="false">
          <div class="smart-card-heading">
            <div>
              <strong>知情同意书设置</strong>
              <div class="smart-section-note">患者或家属在小程序端阅读并确认，后台负责维护内容、版本和启用状态</div>
            </div>
            <a-button type="primary" :loading="saving" @click="saveSettings">
              <template #icon><sa-icon icon="ri:save-3-line" :size="16" /></template>
              保存
            </a-button>
          </div>
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
      </a-col>
      <a-col :xs="24" :lg="9">
        <a-card class="smart-panel" title="小程序展示预览" :bordered="false">
          <div class="phone-preview">
            <h3 class="form-step-title">{{ agreement.name }}</h3>
            <div class="smart-muted" style="margin: 8px 0 14px">更新时间 {{ agreement.updatedAt || '2026-05-21 14:08' }}</div>
            <p>{{ agreement.summary }}</p>
            <a-checkbox :model-value="true">我已阅读并同意上述内容</a-checkbox>
            <a-button type="primary" long style="margin-top: 16px">
              <template #icon><sa-icon icon="ri:check-line" :size="16" /></template>
              确认并继续
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { settingsApi } from '@/views/plugin/smart-pillbox/api/doctor'
import { getPayload } from '@/views/smart-pillbox/utils'

const loading = ref(false)
const saving = ref(false)
const agreement = reactive({
  name: '智慧药盒服务知情同意书',
  version: 'V2026.05',
  status: 1,
  updatedAt: '2026-05-21 14:08',
  summary: '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
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

onMounted(loadSettings)
</script>
