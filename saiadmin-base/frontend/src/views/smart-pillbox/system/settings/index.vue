<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>系统设置</h2>
        <p>维护知情同意书内容和业务基础配置</p>
      </div>
      <ElButton type="primary" @click="saveSettings">
        <template #icon><ArtSvgIcon icon="ri:save-3-line" /></template>
        保存并启用
      </ElButton>
    </div>

    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="15">
        <ElCard shadow="never">
          <template #header>
            <div>
              <b>知情同意书设置</b>
              <div class="muted text-sm mt-1">患者或家属在小程序端阅读并确认，后台负责维护内容、版本和启用状态</div>
            </div>
          </template>
          <ElForm label-width="110px">
            <ElRow :gutter="16">
              <ElCol :span="12"><ElFormItem label="协议名称"><ElInput v-model="agreement.name" /></ElFormItem></ElCol>
              <ElCol :span="12"><ElFormItem label="当前版本"><ElInput v-model="agreement.version" /></ElFormItem></ElCol>
              <ElCol :span="12"><ElFormItem label="启用状态"><SaSwitch v-model="agreement.status" /></ElFormItem></ElCol>
              <ElCol :span="12"><ElFormItem label="适用端"><ElInput model-value="小程序患者端 / 子女端" /></ElFormItem></ElCol>
              <ElCol :span="24"><ElFormItem label="协议摘要"><ElInput v-model="agreement.summary" type="textarea" :rows="4" /></ElFormItem></ElCol>
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
          <ElCard shadow="never">
            <h3>{{ agreement.name }}</h3>
            <div class="muted mb-3">版本 {{ agreement.version }}</div>
            <p>{{ agreement.summary }}</p>
            <ElCheckbox :model-value="true">我已阅读并同意上述内容</ElCheckbox>
            <ElButton type="primary" class="w-full mt-4">确认并继续</ElButton>
          </ElCard>
          <ElTimeline class="mt-4">
            <ElTimelineItem type="primary" timestamp="当前启用">{{ agreement.version }} 已启用</ElTimelineItem>
            <ElTimelineItem type="warning" timestamp="历史版本">V2026.04 已归档</ElTimelineItem>
          </ElTimeline>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'SmartPillboxSettings' })

  const agreement = reactive({
    name: '智慧药盒服务知情同意书',
    version: 'V2026.05',
    status: 1,
    summary:
      '本服务用于协助患者进行用药计划提醒、服药任务记录、药盒设备绑定、用药相关问答和必要的信息上报。',
    content:
      '<p>一、服务目的：智慧药盒用于辅助用药提醒和用药管理，不替代医生诊疗意见。</p><p>二、信息采集：系统将采集患者基础信息、用药计划、药盒设备状态、服药任务记录和语音问答记录。</p><p>三、风险提示：如出现胸闷、严重不适、疑似不良反应等情况，请及时联系医药师或前往医疗机构。</p><p>四、授权确认：患者或家属点击同意后，表示已阅读并理解上述内容。</p>'
  })

  const saveSettings = () => {
    ElMessage.success('知情同意书设置已保存')
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
