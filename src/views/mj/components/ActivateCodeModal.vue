<template>
  <n-modal
    :show="visible"
    preset="card"
    title="凭码兑换"
    size="medium"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :style="{ width: '420px' }"
    @update:show="handleUpdateShow"
  >
    <n-form :model="form" label-placement="left" :label-width="72">
      <n-form-item label="兑换码">
        <n-input-group>
          <n-input
            ref="seg0"
            v-model:value="form.segments[0]"
            maxlength="4"
            placeholder="XXXX"
            @input="onSegInput(0)"
            @keydown.backspace="onSegBackspace(0)"
          />
          <span class="seg-divider">-</span>
          <n-input
            ref="seg1"
            v-model:value="form.segments[1]"
            maxlength="4"
            placeholder="XXXX"
            @input="onSegInput(1)"
            @keydown.backspace="onSegBackspace(1)"
          />
          <span class="seg-divider">-</span>
          <n-input
            ref="seg2"
            v-model:value="form.segments[2]"
            maxlength="4"
            placeholder="XXXX"
            @input="onSegInput(2)"
            @keydown.backspace="onSegBackspace(2)"
          />
          <span class="seg-divider">-</span>
          <n-input
            ref="seg3"
            v-model:value="form.segments[3]"
            maxlength="4"
            placeholder="XXXX"
            @input="onSegInput(3)"
            @keydown.backspace="onSegBackspace(3)"
          />
        </n-input-group>
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-gray-600 text-sm">账号余额：2.7元</div>
        <div class="flex gap-2">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleConfirm">兑换</n-button>
        </div>
      </div>
    </template>
  </n-modal>
  
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, NInputGroup } from 'naive-ui'
import type { InputInst } from 'naive-ui'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', code: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<{ segments: [string, string, string, string] }>({ segments: ['', '', '', ''] })

const seg0 = ref<InputInst | null>(null)
const seg1 = ref<InputInst | null>(null)
const seg2 = ref<InputInst | null>(null)
const seg3 = ref<InputInst | null>(null)

const getSegRef = (index: number): InputInst | null => {
  return index === 0 ? seg0.value : index === 1 ? seg1.value : index === 2 ? seg2.value : seg3.value
}

const onSegInput = (index: number) => {
  const raw = form.value.segments[index] || ''
  const sanitized = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  form.value.segments[index] = sanitized.slice(0, 4)
  if (form.value.segments[index].length === 4 && index < 3) {
    nextTick(() => getSegRef(index + 1)?.focus())
  }
}

const onSegBackspace = (index: number) => {
  if ((form.value.segments[index] || '').length === 0 && index > 0) {
    nextTick(() => getSegRef(index - 1)?.focus())
  }
}

const handleUpdateShow = (value: boolean) => {
  emit('update:visible', value)
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  const code = form.value.segments.join('')
  emit('confirm', code)
}
</script>



<style scoped>

</style>