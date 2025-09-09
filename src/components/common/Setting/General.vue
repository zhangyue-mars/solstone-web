<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { NButton, NInput, NSelect, useMessage, NUpload, UploadFileInfo, NText } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getToken } from '@/store/modules/auth/helper'
import { getUserInfo } from '@/api/user'
import { t } from '@/locales'

const message = useMessage()
const appStore = useAppStore()
const userStore = useUserStore()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const name = ref(userInfo.value.name ?? '')

// 添加显示用户名（邮箱）的计算属性
const userName = computed(() => userInfo.value.userName ?? '')

// 添加其他用户信息的计算属性
const userId = computed(() => userInfo.value.userId ?? '')
const roleName = computed(() => userInfo.value.roleName ?? '')
const createTime = computed(() => userInfo.value.createTime ?? '')

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  // { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
  // { label: 'English', key: 'en-US', value: 'en-US' },
  // { label: '한국어', key: 'ko-KR', value: 'ko-KR' },
  // { label: 'Русский', key: 'ru-RU', value: 'ru-RU' }
]

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}

let fileList = ref<UploadFileInfo[]>([])

// 初始化头像文件列表
const initFileList = () => {
  if (userInfo.value.avatar) {
    fileList.value = [{
      id: 'avatar',
      name: '头像预览',
      status: 'finished',
      url: userInfo.value.avatar
    }]
  } else {
    fileList.value = [{
      id: 'avatar',
      name: '头像预览',
      status: 'finished',
      url: 'https://avatars.githubusercontent.com/u/32251822?v=4'
    }]
  }
}

onMounted(() => {
  initFileList()
})

const token = getToken()
const headers = {
  Authorization: `Bearer ${token}`
}

function handleFinish({
  event
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  const ext = (event?.target as XMLHttpRequest).response
  fileList.value[0].url = ext;
  // 更新用户存储中的头像信息
  userStore.updateUserInfo({ avatar: ext })
  message.success('上传成功！')
}

// 从后端获取最新的用户信息
const fetchUserInfo = async () => {
  try {
    const res: any = await getUserInfo()
    if (res.code === 200) {
      const userData = res.data.user
      // 更新用户存储中的信息
      userStore.updateUserInfo({
        avatar: userData.avatar,
        name: userData.nickName,
        userBalance: userData.userBalance,
        userGrade: userData.userGrade,
        userName: userData.userName,
        userId: userData.userId,
        roleName: userData.roles && userData.roles.length > 0 ? userData.roles[0].roleName : '',
        createTime: userData.createTime
      })

      // 更新文件列表
      initFileList()
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
        <n-upload action="/api/system/user/edit/avatar"
          :max=1
          list-type="image-card"
          :default-file-list="fileList"
          :headers="headers" @finish="handleFinish">
          点击上传
        </n-upload>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ name })">
          {{ $t('common.save') }}
        </NButton>
      </div>

      <!-- 显示用户邮箱（用户名） -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">邮箱</span>
        <div class="w-[200px]">
          <NInput v-model:value="userName" disabled placeholder="" />
        </div>
      </div>

      <!-- 显示用户ID -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">用户ID</span>
        <div class="w-[200px]">
          <NInput :value="String(userId)" disabled placeholder="" />
        </div>
      </div>

      <!-- 显示角色名 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">角色</span>
        <div class="w-[200px]">
          <NInput v-model:value="roleName" disabled placeholder="" />
        </div>
      </div>

      <!-- 显示创建时间 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">创建时间</span>
        <div class="w-[200px]">
          <NInput v-model:value="createTime" disabled placeholder="" />
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton
              size="small"
              :type="item.key === theme ? 'primary' : undefined"
              @click="appStore.setTheme(item.key)"
            >
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="language"
            :options="languageOptions"
            @update-value="value => appStore.setLanguage(value)"
          />
        </div>
      </div>

    </div>
  </div>
</template>
