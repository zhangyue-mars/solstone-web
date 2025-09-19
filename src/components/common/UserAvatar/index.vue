<script setup lang='ts'>
import { computed, onMounted } from 'vue'
import { NAvatar,NButton,useMessage,NEllipsis} from 'naive-ui'
import defaultAvatar from '@/assets/avatar.jpg'
import { isString } from '@/utils/is'
import { removeToken } from '@/store/modules/auth/helper'
import { useRouter } from 'vue-router'
import { loginOut,getUserInfo} from '@/api/user'
import { UserData } from "@/typings/user"
import { defaultSetting,UserInfo } from '@/store/modules/user/helper'
import { getToken } from "@/store/modules/auth/helper";
import { useUserStore } from '@/store';
import to from "await-to-js";

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const userInfo = computed(() => userStore.userInfo)

onMounted(() => {
  // 只有当用户信息不存在时才获取用户信息
  if (getToken() && !userInfo.value.userName) {
    getLoginUserInfo()
  }
});

/**
 * 获取当前登录用户信息
 */

async function getLoginUserInfo() {
  if(!getToken()){
      return
  }

  const [err, newUserInfo] = await to(getUserInfo());
      if (err) {
        message.error(err.toString())
      }
  if(newUserInfo){ 
    // 更新用户存储中的信息
    userStore.updateUserInfo({
      avatar: newUserInfo.data.user.avatar,
      name: newUserInfo.data.user.nickName,
      userBalance: newUserInfo.data.user.userBalance,
      userName: newUserInfo.data.user.userName,
      userId: newUserInfo.data.user.userId,
      roleName: newUserInfo.data.user.roles && newUserInfo.data.user.roles.length > 0 ? newUserInfo.data.user.roles[0].roleName : '',
      createTime: newUserInfo.data.user.createTime
    })
  } 
}  

/**
 * 退出登录
 */
 async function handleReset() {
    await loginOut()
    // 删除用户token
    removeToken();
    // 跳转到登录页面
    router.push('/login')
}
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <div class="w-10 h-10 overflow-hidden rounded-full shrink-0">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar
          size="large"
          round
          :src="userInfo.avatar"
          :fallback-src="defaultAvatar"
        />
      </template>
      <template v-else>
        <NAvatar size="large" round :src="defaultAvatar" />
      </template>
    </div>
      <div class="flex-1 min-w-0 ml-2">
        <n-ellipsis style="max-width: 80px">
          {{ userInfo.name ?? '熊猫助手' }}
        </n-ellipsis>
        <NButton  size="small" type="tertiary" @click="handleReset">
          {{$t('mjset.logout')}}
        </NButton>
        <p class="overflow-hidden text-xs text-gray-500 text-ellipsis whitespace-nowrap">
          <span style="font-size: 10rpx;">{{$t('mjset.balance')}}:{{ userInfo.userBalance }}</span>
        </p>
      </div>
  </div>
</template>
