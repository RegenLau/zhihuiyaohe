<template>
  <div class="pillbox-page page-content">
    <div class="page-header">
      <div>
        <h2>设备管理</h2>
        <p>维护药盒设备绑定关系、在线状态、开关记录和计划下发记录</p>
      </div>
    </div>

    <div class="summary-grid mb-4">
      <div v-for="item in deviceSummary" :key="item.label" class="summary-item">
        <span class="summary-number" :class="item.className">{{ item.value }}</span>
        <span class="muted">{{ item.label }}</span>
      </div>
    </div>

    <TableSearch
      v-if="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        v-model:columns="columns"
        v-model:show-search-bar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton @click="importDialogVisible = true">
            <template #icon><ArtSvgIcon icon="ri:upload-cloud-2-line" /></template>
            导入设备
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :data="data"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @sort-change="handleSortChange"
      >
        <template #status="{ row }">
          <ElTag :type="row.statusType">{{ row.status }}</ElTag>
        </template>
        <template #battery="{ row }">
          <ElProgress
            :percentage="Number(row.batteryLevel ?? String(row.battery).replace('%', '')) || 0"
            :stroke-width="8"
            :status="Number(row.batteryLevel) < 20 ? 'exception' : undefined"
          />
        </template>
        <template #operation="{ row }">
          <ElSpace>
            <SaButton
              type="success"
              icon="ri:file-list-3-line"
              tool-tip="对话记录"
              @click="router.push(`/doctor/conversations?patientId=${row.bindPatientId || ''}`)"
            />
            <SaButton type="secondary" tool-tip="编辑" @click="showDialog('edit', row)" />
            <SaButton
              type="error"
              :tool-tip="isDeviceBound(row) ? '解绑' : '未绑定'"
              :disabled="!isDeviceBound(row)"
              @click="unbindDevice(row)"
            />
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :initial-form-data="dialogData"
      :patient-readonly="isGuidedBinding"
      @success="handleBindSuccess"
    />
    <ImportDialog v-model="importDialogVisible" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import deviceApi from '@/views/plugin/smart-pillbox/api/doctor/device'
  import patientApi from '@/views/plugin/smart-pillbox/api/doctor/patient'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import { useTable } from '@/hooks/core/useTable'
  import type { Device } from '@/views/plugin/smart-pillbox/api/doctor/types'
  import EditDialog from './modules/edit-dialog.vue'
  import ImportDialog from './modules/import-dialog.vue'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'SmartPillboxDeviceManage' })

  const router = useRouter()
  const route = useRoute()
  const showSearchBar = ref(true)
  const importDialogVisible = ref(false)
  const searchForm = ref({ sn: '', status: '' })
  const guidedBindPatient = ref<{ id: number; name: string } | null>(null)
  const { dialogType, dialogVisible, dialogData, showDialog } = useSaiAdmin()

  const {
    columns,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    handleSortChange,
    refreshData,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: deviceApi.list,
      columnsFactory: () => [
        { prop: 'sn', label: '设备 SN', minWidth: 170 },
        { prop: 'patient', label: '绑定患者', minWidth: 130 },
        { prop: 'status', label: '在线状态', useSlot: true, width: 110 },
        { prop: 'battery', label: '电量', useSlot: true, width: 140 },
        { prop: 'wifi', label: 'WiFi 状态', width: 120 },
        { prop: 'lastHeartbeat', label: '最后心跳', width: 160 },
        { prop: 'operation', label: '操作', useSlot: true, width: 150, fixed: 'right' }
      ]
    }
  })

  const deviceSummary = computed(() => {
    const records = (data.value || []) as Device[]
    return [
      {
        label: '在线设备',
        value: records.filter((item) => item.status === '在线').length,
        className: 'is-success'
      },
      {
        label: '离线设备',
        value: records.filter((item) => item.status === '离线').length,
        className: 'is-danger'
      },
      {
        label: '待分配设备',
        value: records.filter((item) => item.status === '待分配').length,
        className: 'is-warning'
      },
      {
        label: '已绑定设备',
        value: records.filter((item) => item.patient !== '-').length,
        className: ''
      }
    ]
  })

  const isGuidedBinding = computed(
    () => dialogType.value === 'add' && Boolean(dialogData.value.bindPatientId)
  )

  const isDeviceBound = (row: Partial<Device>) => {
    return Boolean(row.bindPatientId || (row.patient && row.patient !== '-')) && row.status !== '待分配'
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

  const openGuidedBindDialog = async () => {
    if (route.query.action !== 'bind') return

    const patientId = Number(route.query.patientId)
    if (!patientId) return

    let patientName = String(route.query.patientName || '')
    if (!patientName) {
      const patient = await patientApi.read(patientId)
      patientName = patient.name
    }

    guidedBindPatient.value = { id: patientId, name: patientName }
    showDialog('add', {
      bindPatientId: patientId,
      patient: patientName,
      sn: '',
      status: '在线',
      statusType: 'success',
      battery: '100%',
      batteryLevel: 100,
      firmware: 'v2.1.3',
      dispatchStatus: '计划待下发',
      bindDate: new Date().toISOString().slice(0, 10)
    })
    router.replace({ path: '/doctor/devices' })
  }

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { sn: '', status: '' }
    await resetSearchParams()
    getData()
  }

  const handleBindSuccess = async (device: Partial<Device>) => {
    refreshUpdate()

    const bindPatientId = Number(device.bindPatientId || guidedBindPatient.value?.id || 0)
    if (!bindPatientId) return

    const patient = await patientApi.read(bindPatientId)
    const status = device.status === '离线' ? '离线' : '在线'
    await patientApi.update({
      ...patient,
      deviceNo: device.sn || patient.deviceNo,
      deviceStatus: status,
      deviceStatusType: device.statusType || (status === '离线' ? 'danger' : 'success'),
      taskRisk: '待设置用药计划',
      updatedAt: formatDateTime()
    })

    try {
      await ElMessageBox.confirm('设备已绑定，是否继续设置用药计划？', '继续设置用药计划', {
        confirmButtonText: '继续设置',
        cancelButtonText: '稍后处理',
        type: 'success'
      })
      router.push({
        path: '/doctor/plans',
        query: {
          patientId: bindPatientId,
          action: 'create'
        }
      })
    } catch {
      guidedBindPatient.value = null
    }
  }

  const unbindDevice = async (row: Record<string, any>) => {
    if (!isDeviceBound(row)) {
      ElMessage.warning('当前设备未绑定患者')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确认解除设备 ${row.sn} 与 ${row.patient} 的绑定关系？`,
        '确认解绑设备',
        {
          confirmButtonText: '确认解绑',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
    } catch {
      return
    }

    const payload: Partial<Device> = {
      ...row,
      bindPatientId: null,
      patient: '-',
      status: '待分配',
      statusType: 'warning',
      dispatchStatus: '未绑定'
    }
    const updatedDevice = await deviceApi.update(payload)
    Object.assign(row, updatedDevice || payload)
    ElMessage.success('设备已解绑')
    refreshUpdate()
  }

  watch(
    () => route.fullPath,
    () => {
      openGuidedBindDialog()
    }
  )

  onMounted(() => {
    openGuidedBindDialog()
  })
</script>

<style lang="scss" scoped>
  @use '../../style';
</style>
