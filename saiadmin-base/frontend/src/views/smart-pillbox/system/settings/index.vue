<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>知情同意书设置</h2>
        <p>维护患者端知情同意书内容、版本和启用状态</p>
      </div>
      <ElButton type="primary" @click="saveSettings">
        <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
        保存
      </ElButton>
    </div>

    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="15">
        <ElCard v-loading="loading" shadow="never">
          <template #header>
            <div>
              <b>知情同意书设置</b>
              <div class="muted text-sm mt-1"
                >患者或家属在小程序端阅读并确认，后台负责维护内容、版本和启用状态</div
              >
            </div>
          </template>
          <ElForm label-width="110px">
            <ElRow :gutter="16">
              <ElCol :span="12"
                ><ElFormItem label="协议名称"
                  ><ElInput v-model="agreement.name" placeholder="请输入协议名称" /></ElFormItem
              ></ElCol>
              <ElCol :span="12"
                ><ElFormItem label="当前版本"
                  ><ElInput v-model="agreement.version" placeholder="请输入版本号" /></ElFormItem
              ></ElCol>
              <ElCol :span="12"
                ><ElFormItem label="启用状态"><SaSwitch v-model="agreement.status" /></ElFormItem
              ></ElCol>
              <ElCol :span="12"
                ><ElFormItem label="适用端"
                  ><ElInput model-value="小程序患者端 / 子女端" readonly /></ElFormItem
              ></ElCol>
              <ElCol :span="24"
                ><ElFormItem label="协议摘要"
                  ><ElInput
                    v-model="agreement.summary"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入协议摘要" /></ElFormItem
              ></ElCol>
              <ElCol :span="24">
                <ElFormItem label="协议正文">
                  <SaEditor v-model="agreement.content" height="320px" />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :lg="9">
        <ElCard shadow="never">
          <template #header><b>小程序展示预览</b></template>
          <div class="phone-preview">
            <h3 class="form-step-title">{{ agreement.name }}</h3>
            <div class="muted mb-3">更新时间 {{ agreement.updatedAt || '2026-05-21 14:08' }}</div>
            <p>{{ agreement.summary }}</p>
            <ElCheckbox :model-value="true">我已阅读并同意上述内容</ElCheckbox>
            <ElButton type="primary" class="w-full mt-4">
              <template #icon><ArtSvgIcon icon="ri:check-line" /></template>
              确认并继续
            </ElButton>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import settingsApi from '@/views/plugin/smart-pillbox/api/doctor/settings'

  defineOptions({ name: 'SmartPillboxConsentSettings' })

  const loading = ref(false)
  const agreement = reactive({
    name: '智慧药盒服务知情同意书',
    version: 'V2026.05',
    status: 1,
    updatedAt: '2026-05-21 14:08',
    summary:
      '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
    content:
      '<p>一、服务目的：智慧药盒用于辅助用药提醒和用药管理，不替代医生诊疗意见。</p><p>二、信息采集：系统将采集患者基础信息、用药计划、药盒设备状态、服药任务记录和语音问答记录。</p><p>三、风险提示：如出现胸闷、严重不适、疑似不良反应等情况，请及时联系医药师或前往医疗机构。</p><p>四、授权确认：患者或家属点击同意后，表示已阅读并理解上述内容。</p>'
  })

  const loadSettings = async () => {
    loading.value = true
    try {
      Object.assign(agreement, await settingsApi.read())
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async () => {
    await settingsApi.update(agreement)
    ElMessage.success('知情同意书设置已保存')
  }

  onMounted(() => {
    loadSettings()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';

  .phone-preview {
    padding: var(--pillbox-gap);
    background: var(--pillbox-surface-soft);
    border: 1px solid var(--pillbox-border);
    border-radius: var(--pillbox-card-radius);
  }
</style>
