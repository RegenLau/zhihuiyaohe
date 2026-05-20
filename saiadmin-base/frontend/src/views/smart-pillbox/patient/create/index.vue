<template>
  <div class="pillbox-page">
    <div class="page-header">
      <div>
        <h2>新增患者建档</h2>
        <p>按步骤完成患者信息、用药计划、设备绑定和任务生成</p>
      </div>
      <ElTag type="primary" size="large">当前进度 {{ activeStep + 1 }}/5</ElTag>
    </div>

    <ElCard shadow="never">
      <ElSteps :active="activeStep" finish-status="success" align-center>
        <ElStep title="患者信息" description="建立基础档案" />
        <ElStep title="诊疗信息" description="疾病和联系人" />
        <ElStep title="用药计划" description="药品和处方" />
        <ElStep title="设备绑定" description="药盒和小程序" />
        <ElStep title="确认建档" description="生成服药任务" />
      </ElSteps>
    </ElCard>

    <ElCard class="mt-4" shadow="never">
      <ElForm label-width="110px">
        <template v-if="activeStep === 0">
          <h3>添加患者信息</h3>
          <p class="muted mb-4">先建立患者基础档案，身份证号为选填，用于后续系统对接。</p>
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="12"><ElFormItem label="患者姓名"><ElInput v-model="form.name" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="手机号"><ElInput v-model="form.phone" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12">
              <ElFormItem label="性别">
                <ElSelect v-model="form.gender"><ElOption label="男" value="男" /><ElOption label="女" value="女" /></ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="年龄"><ElInputNumber v-model="form.age" :min="1" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="档案编号"><ElInput v-model="form.recordNo" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="身份证号"><ElInput placeholder="选填" /></ElFormItem></ElCol>
            <ElCol :span="24"><ElFormItem label="居住地址"><ElInput v-model="form.address" /></ElFormItem></ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 1">
          <h3>补充诊疗信息和联系人</h3>
          <p class="muted mb-4">记录基础疾病、诊疗备注和家庭联系人，便于后续提醒和随访。</p>
          <ElRow :gutter="16">
            <ElCol :span="24"><ElFormItem label="基础疾病"><ElInput v-model="form.diseases" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="家属姓名"><ElInput v-model="form.familyName" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="家属手机号"><ElInput v-model="form.familyPhone" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="复诊周期"><ElSelect v-model="form.reviewCycle"><ElOption label="30 天" value="30 天" /><ElOption label="60 天" value="60 天" /></ElSelect></ElFormItem></ElCol>
            <ElCol :span="24"><ElFormItem label="诊疗备注"><ElInput v-model="form.remark" type="textarea" :rows="4" /></ElFormItem></ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 2">
          <h3>添加用药计划</h3>
          <p class="muted mb-4">首次建档时同步创建用药计划；后续复诊仍可在独立的用药计划模块维护。</p>
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="12"><ElFormItem label="计划名称"><ElInput v-model="form.planName" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="开始日期"><ElDatePicker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" /></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="处方来源"><ElSelect v-model="form.source"><ElOption label="手动录入" value="手动录入" /><ElOption label="处方照片" value="处方照片" /><ElOption label="HIS 截图" value="HIS 截图" /></ElSelect></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="复诊提醒"><ElSelect v-model="form.reviewReminder"><ElOption label="自动推算" value="自动推算" /><ElOption label="手动设置" value="手动设置" /></ElSelect></ElFormItem></ElCol>
            <ElCol :span="24"><ElFormItem label="药品明细"><ElInput v-model="form.drugs" type="textarea" :rows="4" /></ElFormItem></ElCol>
            <ElCol :span="24">
              <ElFormItem label="处方附件">
                <ElUpload drag :auto-upload="false">
                  <ArtSvgIcon icon="ri:upload-cloud-2-line" class="text-3xl" />
                  <div>上传处方照片 / HIS 截图</div>
                </ElUpload>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 3">
          <h3>绑定药盒和小程序</h3>
          <p class="muted mb-4">选择待绑定设备并生成小程序绑定入口，知情同意由患者或家属在小程序端确认。</p>
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="12"><ElFormItem label="药盒设备"><ElSelect v-model="form.device"><ElOption label="PBX-202605-021 待分配" value="PBX-202605-021" /><ElOption label="暂不绑定" value="暂不绑定" /></ElSelect></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="绑定方式"><ElSelect v-model="form.bindMode"><ElOption label="后台选择设备" value="后台选择设备" /><ElOption label="患者小程序扫码" value="患者小程序扫码" /></ElSelect></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="小程序绑定"><ElSelect v-model="form.miniProgram"><ElOption label="发送给患者" value="发送给患者" /><ElOption label="发送给家属" value="发送给家属" /></ElSelect></ElFormItem></ElCol>
            <ElCol :xs="24" :md="12"><ElFormItem label="知情同意"><ElInput model-value="等待小程序端确认" readonly /></ElFormItem></ElCol>
            <ElCol :span="24"><ElAlert show-icon type="info" :closable="false" title="后台仅配置协议内容、查看确认状态，不代替患者确认。" /></ElCol>
          </ElRow>
        </template>

        <template v-if="activeStep === 4">
          <h3>确认建档并生成服药任务</h3>
          <p class="muted mb-4">确认后保存患者档案、用药计划和设备绑定关系，并生成服药任务。</p>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="患者信息">患者信息完整</ElDescriptionsItem>
            <ElDescriptionsItem label="用药计划">保存后生成每日服药任务</ElDescriptionsItem>
            <ElDescriptionsItem label="知情同意">等待小程序端确认</ElDescriptionsItem>
            <ElDescriptionsItem label="设备绑定">保存后下发用药计划</ElDescriptionsItem>
          </ElDescriptions>
        </template>
      </ElForm>
    </ElCard>

    <ElCard class="mt-4" shadow="never">
      <div class="flex justify-end gap-3">
        <ElButton @click="router.push('/doctor/patients')">取消</ElButton>
        <ElButton :disabled="activeStep === 0" @click="activeStep--">上一步</ElButton>
        <ElButton type="primary" @click="handleNext">{{ activeStep === 4 ? '完成建档' : '下一步' }}</ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'SmartPillboxPatientCreate' })

  const router = useRouter()
  const activeStep = ref(0)
  const form = reactive({
    name: '陈德明',
    phone: '135****3378',
    gender: '男',
    age: 81,
    recordNo: 'MR-004',
    address: '武汉市汉阳区五里墩社区',
    diseases: '帕金森，高血压',
    familyName: '陈女士',
    familyPhone: '136****2281',
    reviewCycle: '30 天',
    remark: '行动不便，需要家属协助确认每日服药情况。',
    planName: '首次用药计划',
    startDate: '2026-05-20',
    source: '手动录入',
    reviewReminder: '自动推算',
    drugs: '左旋多巴片，1片，每日三次；苯磺酸氨氯地平片，1片，每日一次。',
    device: 'PBX-202605-021',
    bindMode: '后台选择设备',
    miniProgram: '发送给家属'
  })

  const handleNext = () => {
    if (activeStep.value < 4) {
      activeStep.value += 1
      return
    }
    ElMessage.success('已完成患者建档，系统将生成服药任务')
    router.push('/doctor/patients')
  }
</script>

<style lang="scss" scoped>
  @use '../../style.scss';
</style>
