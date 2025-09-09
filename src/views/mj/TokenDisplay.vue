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

onMounted(() => {
  funt()
  fetchUserBalance()
})
</script>

<template>
  <div class="absolute -top-6 right-12 z-10" v-if="!isMobile">
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
