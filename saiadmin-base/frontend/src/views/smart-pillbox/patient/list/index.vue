<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>患者管理</h2>
        <p>维护患者基本信息、疾病信息、子女绑定和知情同意状态</p>
      </div>
      <ElButton type="primary" @click="router.push('/doctor/patient-create')">
        <template #icon><ArtSvgIcon icon="ri:user-add-line" /></template>
        新增患者建档
      </ElButton>
    </div>

    <SaSearchBar v-model="searchForm" @search="handleSearch" @reset="handleReset">
      <ElCol :span="6">
        <ElFormItem label="关键词" prop="keyword">
          <ElInput v-model="searchForm.keyword" placeholder="姓名/手机号/档案编号" clearable />
        </ElFormItem>
      </ElCol>
      <ElCol :span="6">
        <ElFormItem label="药盒状态" prop="deviceStatus">
          <ElSelect v-model="searchForm.deviceStatus" placeholder="全部" clearable>
            <ElOption label="在线" value="在线" />
            <ElOption label="离线" value="离线" />
            <ElOption label="未绑定" value="未绑定" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :span="6">
        <ElFormItem label="知情同意" prop="consent">
          <ElSelect v-model="searchForm.consent" placeholder="全部" clearable>
            <ElOption label="已同意" value="已同意" />
            <ElOption label="未同意" value="未同意" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </SaSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <ArtTable :data="filteredPatients" :columns="columns" :pagination="pagination">
        <template #patient="{ row }">
          <div>
            <b>{{ row.name }}</b>
            <div class="muted text-xs">{{ row.gender }} {{ row.age }} 岁 {{ row.phone }}</div>
          </div>
        </template>
        <template #diseases="{ row }">
          <ElSpace wrap>
            <ElTag v-for="disease in row.diseases" :key="disease" effect="plain">
              {{ disease }}
            </ElTag>
          </ElSpace>
        </template>
        <template #consent="{ row }">
          <ElSpace>
            <ElTag type="primary">已登记</ElTag>
            <ElTag :type="row.consent === '已同意' ? 'success' : 'warning'">{{ row.consent }}</ElTag>
          </ElSpace>
        </template>
        <template #deviceStatus="{ row }">
          <ElTag :type="row.deviceStatusType">{{ row.deviceNo }}</ElTag>
        </template>
        <template #taskRisk="{ row }">
          <ElTag :type="row.taskRisk.includes('漏服') ? 'danger' : row.taskRisk === '正常' ? 'success' : 'warning'">
            {{ row.taskRisk }}
          </ElTag>
        </template>
        <template #operation>
          <ElSpace>
            <SaButton type="secondary" tool-tip="编辑" @click="editVisible = true" />
            <SaButton type="success" icon="ri:file-list-3-line" tool-tip="计划" @click="router.push('/doctor/plans')" />
            <SaButton type="primary" icon="ri:message-2-line" tool-tip="提醒" @click="router.push('/doctor/messages')" />
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="editVisible" title="编辑患者档案" width="760px">
      <ElForm label-width="110px">
        <ElRow :gutter="16">
          <ElCol :span="12"><ElFormItem label="患者姓名"><ElInput model-value="王秀兰" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="手机号"><ElInput model-value="138****0921" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="基础疾病"><ElInput model-value="高血压，糖尿病" /></ElFormItem></ElCol>
          <ElCol :span="12"><ElFormItem label="家属手机号"><ElInput model-value="137****8091" /></ElFormItem></ElCol>
          <ElCol :span="24">
            <ElFormItem label="诊疗备注">
              <ElInput type="textarea" :rows="3" model-value="近期有漏服记录，下次复诊需核对用药依从性。" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveEdit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { patients } from '../../data'

  defineOptions({ name: 'SmartPillboxPatientList' })

  const router = useRouter()
  const editVisible = ref(false)
  const searchForm = ref({ keyword: '', deviceStatus: '', consent: '' })
  const filteredPatients = ref([...patients])
  const pagination = { current: 1, size: 10, total: patients.length }

  const columns = [
    { prop: 'patient', label: '患者', useSlot: true, minWidth: 160 },
    { prop: 'diseases', label: '基础疾病', useSlot: true, minWidth: 160 },
    { prop: 'consent', label: '实名/同意', useSlot: true, minWidth: 160 },
    { prop: 'deviceStatus', label: '药盒', useSlot: true, minWidth: 170 },
    { prop: 'child', label: '子女绑定', minWidth: 180, showOverflowTooltip: true },
    { prop: 'taskRisk', label: '最近任务', useSlot: true, width: 120 },
    { prop: 'operation', label: '操作', useSlot: true, width: 150, fixed: 'right' }
  ]

  const handleSearch = () => {
    filteredPatients.value = patients.filter((item) => {
      const keyword = searchForm.value.keyword.trim()
      const keywordMatched =
        !keyword ||
        item.name.includes(keyword) ||
        item.phone.includes(keyword) ||
        item.recordNo.includes(keyword)
      const deviceMatched =
        !searchForm.value.deviceStatus || item.deviceStatus === searchForm.value.deviceStatus
      const consentMatched = !searchForm.value.consent || item.consent === searchForm.value.consent
      return keywordMatched && deviceMatched && consentMatched
    })
  }

  const handleReset = () => {
    searchForm.value = { keyword: '', deviceStatus: '', consent: '' }
    filteredPatients.value = [...patients]
  }

  const saveEdit = () => {
    editVisible.value = false
    ElMessage.success('患者档案已保存')
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
