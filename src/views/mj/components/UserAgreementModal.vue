<template>
  <n-modal 
    :show="visible" 
    preset="card" 
    title="服务协议" 
    size="medium"
    :bordered="false"
    :segmented="{
      content: 'soft',
      footer: 'soft'
    }"
    :style="{ width: '500px' }"
    @update:show="handleUpdateShow"
  >
    <div class="space-y-4">
      <!-- 第一行：用户协议 -->
      <div class="flex items-center justify-between py-3 px-2 border-b border-gray-100">
        <span class="text-gray-700 font-medium">用户协议</span>
        <n-button size="small" type="primary" @click="openUserAgreement">
          查看
        </n-button>
      </div>
      
      <!-- 第二行：用户隐私 -->
      <div class="flex items-center justify-between py-3 px-2">
        <span class="text-gray-700 font-medium">用户隐私</span>
        <n-button size="small" type="info" @click="openPrivacyPolicy">
          查看
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NButton } from 'naive-ui'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleUpdateShow = (value: boolean) => {
  emit('update:visible', value)
}

const openUserAgreement = () => {
  // 在新标签页中打开用户协议Vue组件页面
  window.open('/#/user-agreement', '_blank')
}

const openPrivacyPolicy = () => {
  // 在新标签页中打开隐私政策Vue组件页面
  window.open('/#/privacy-policy', '_blank')
}
</script>
