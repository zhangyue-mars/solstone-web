<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { NTag, NPopover } from "naive-ui"
import { SvgIcon } from "@/components/common"
import { useBasicLayout } from "@/hooks/useBasicLayout"
import { t } from "@/locales"
import { countTokens } from "@/api"
import { useChatStore, gptConfigStore, homeStore } from "@/store"
import { useRoute } from "vue-router"
import { getUserInfo } from "@/api/user"

const { isMobile } = useBasicLayout()
const route = useRoute()
const chatStore = useChatStore()

const props = defineProps<{
  modelValue: string
}>()

const myToken = ref({ remain: 0, modelTokens: "4k" })
const userBalance = ref<number | null>(null)
const forceUpdateKey = ref(0) // 强制更新key

const { uuid } = route.params as { uuid: string }
const uuid1 = chatStore.active
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))

const funt = async () => {
  const d = await countTokens(
    dataSources.value,
    props.modelValue,
    chatStore.active ?? 1002
  )
  myToken.value = d
  return d
}

// 新增方法：强制更新用户余额
const updateUserBalance = async () => {
  await fetchUserBalance()
  forceUpdateKey.value++ // 强制组件重新渲染
}

defineExpose({
  funt,
  updateUserBalance // 暴露更新用户余额的方法
})

// 获取用户余额
const fetchUserBalance = async () => {
  try {
    const userRes = await getUserInfo()
    userBalance.value = userRes?.data?.user?.userBalance ?? null
  } catch (e) {
    // 忽略错误
  }
}

// 计算显示的余额（以百万为单位，保留7位小数）
const displayBalance = computed(() => {
  if (userBalance.value === null) return "—"
  // 转换为百万单位并保留7位小数
  return (userBalance.value ).toFixed(6)
})

watch(() => props.modelValue, funt)
watch(() => dataSources.value, funt)
watch(() => gptConfigStore.myData, funt, { deep: true })
watch(() => homeStore.myData.isLoader, funt, { deep: true })

// 移除对聊天记录长度变化的监听，避免在AI回答过程中频繁更新tokens数量
// 添加对loading状态的监听，只在AI回答完全结束后更新用户余额
watch(() => homeStore.myData.isLoader, (newLoadingState) => {
  // 当loading状态从true变为false时，表示AI回答结束，此时更新tokens数量
  if (!newLoadingState && !homeStore.myData.isLoader) {
    // AI回答完成，更新用户余额
    fetchUserBalance()
    forceUpdateKey.value++ // 强制组件重新渲染
  }
})

// 监听homeStore中的act变化，当AI回答完成时更新用户余额
// watch(() => homeStore.myData.act, (newAct) => {
//   if (newAct === 'stopLoading' || newAct === 'scrollToBottomIfAtBottom') {
//     // AI回答完成，更新用户余额
//     fetchUserBalance()
//     forceUpdateKey.value++ // 强制组件重新渲染
//   }
// })

onMounted(() => {
  funt()
  fetchUserBalance()
})
</script>

<template>
  <div :key="forceUpdateKey" class="absolute -top-6 right-12 z-10" v-if="!isMobile">
    <NPopover trigger="hover">
      <template #trigger>
        <NTag
          type="info"
          round
          size="small"
          style="cursor: pointer"
          :bordered="false"
        >
          <div class="opacity-60 flex">
            <SvgIcon icon="material-symbols:token-outline" />
            {{ $t("剩：") }}{{ displayBalance }} 百万
          </div>
        </NTag>
      </template>
      <div class="w-[300px]">
        {{ $t("mj.tokenInfo1") }}
        <p class="py-1" v-text="$t('mj.tokenInfo2')"></p>
      </div>
    </NPopover>
  </div>
</template>