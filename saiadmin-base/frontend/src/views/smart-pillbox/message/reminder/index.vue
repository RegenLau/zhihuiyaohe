<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>提醒消息</h2>
        <p>创建复诊提醒、子女提醒和系统提醒，当前以小程序消息中心为主</p>
      </div>
      <ElButton type="primary" @click="dialogVisible = true">
        <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
        创建提醒
      </ElButton>
    </div>

    <SaSearchBar v-model="searchForm">
      <ElCol :span="6">
        <ElFormItem label="提醒类型">
          <ElSelect v-model="searchForm.type" clearable placeholder="全部">
            <ElOption label="复诊提醒" value="复诊提醒" />
            <ElOption label="子女提醒" value="子女提醒" />
            <ElOption label="系统提醒" value="系统提醒" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="6"><ElFormItem label="患者"><ElInput v-model="searchForm.patient" clearable /></ElFormItem></ElCol>
    </SaSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <ArtTable :data="messages" :columns="columns" :pagination="{ current: 1, size: 10, total: messages.length }">
        <template #message="{ row }">
          <div>
            <b>{{ row.title }}</b>
            <div class="muted text-xs">{{ row.content }}</div>
          </div>
        </template>
        <template #status="{ row }"><ElTag :type="row.statusType">{{ row.status }}</ElTag></template>
        <template #operation>
          <SaButton type="success" icon="ri:eye-line" tool-tip="查看" />
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="dialogVisible" title="创建提醒" width="760px">
      <ElForm label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12"><ElFormItem label="提醒类型"><ElSelect model-value="子女提醒"><ElOption label="子女提醒" value="子女提醒" /><ElOption label="复诊提醒" value="复诊提醒" /></ElSelect></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="患者"><ElInput model-value="王秀兰" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="接收方"><ElInput model-value="子女 王敏" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="渠道"><ElInput model-value="小程序消息中心" /></ElFormItem></ElCol>
          <ElCol :span="24"><ElFormItem label="消息正文"><ElInput type="textarea" :rows="4" model-value="系统显示老人近 3 天有漏服记录，请关注服药情况并协助确认药盒是否正常使用。" /></ElFormItem></ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveMessage">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { messages } from '../../data'

  defineOptions({ name: 'SmartPillboxReminder' })

  const dialogVisible = ref(false)
  const searchForm = ref({ type: '', patient: '' })
  const columns = [
    { prop: 'message', label: '消息', useSlot: true, minWidth: 220 },
    { prop: 'patient', label: '患者', width: 120 },
    { prop: 'receiver', label: '接收方', minWidth: 150 },
    { prop: 'channel', label: '渠道', minWidth: 150 },
    { prop: 'status', label: '状态', useSlot: true, width: 110 },
    { prop: 'createTime', label: '创建时间', width: 140 },
    { prop: 'operation', label: '操作', useSlot: true, width: 90, fixed: 'right' }
  ]

  const saveMessage = () => {
    dialogVisible.value = false
    ElMessage.success('提醒消息已保存')
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
