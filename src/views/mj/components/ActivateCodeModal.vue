<template>
	<n-modal
		:show="visible"
		preset="card"
		title="凭码兑换"
		size="medium"
		:bordered="false"
		:segmented="{ content: 'soft', footer: 'soft' }"
		:style="{ width: '460px' }"
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
            @paste="onPaste"
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
						clearable
						@clear="clearCode"
						@input="onSegInput(3)"
						@keydown.backspace="onSegBackspace(3)"
             class="custom-clear"
					/>
				</n-input-group>
				<!-- feedback 插槽，始终占位 -->
				<template #feedback>
					<div class="min-h-[40px] text-sm leading-5">
						<div
							:class="[
								redeemResult?.msg?.includes('成功')
									? 'text-green-600'
									: redeemResult?.msg?.includes('已兑换')
									? 'text-red-600'
									: 'text-gray-600',
							]"
						>
							{{ redeemResult ? `结果：${redeemResult.msg}` : "" }}
						</div>
						<!-- 只有在兑换成功或已兑换时显示卡号 -->
						<div
							v-if="
								redeemResult &&
								(redeemResult.msg.includes('成功') ||
									redeemResult.msg.includes('已兑换'))
							"
							class="text-gray-600"
						>
							卡号：{{ redeemResult.cardNo }}
						</div>
					</div>
				</template>
			</n-form-item>
		</n-form>

		<template #footer>
			<div class="flex items-center justify-between">
				<div class="text-gray-600 text-sm">
					账号剩余Tokens：{{ userBalanceDisplay }}
				</div>
				<div class="flex gap-2">
					<n-button @click="handleCancel">取消</n-button>
					<n-button type="primary" :loading="loading" @click="handleConfirm"
						>兑换</n-button
					>
				</div>
			</div>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from "vue";
import {
	NModal,
	NForm,
	NFormItem,
	NInput,
	NButton,
	NInputGroup,
	useMessage,
} from "naive-ui";
import type { InputInst } from "naive-ui";
import { redeemCode } from "@/api/redeem";
import { getUserInfo } from "@/api/user";

interface Props {
	visible: boolean;
}

interface Emits {
	(e: "update:visible", value: boolean): void;
	(e: "confirm", code: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref<{ segments: [string, string, string, string] }>({
	segments: ["", "", "", ""],
});
const loading = ref(false);
const redeemResult = ref<{ cardNo: string; msg: string } | null>(null);
const userBalance = ref<string | number | null>(null);
const message = useMessage();

const seg0 = ref<InputInst | null>(null);
const seg1 = ref<InputInst | null>(null);
const seg2 = ref<InputInst | null>(null);
const seg3 = ref<InputInst | null>(null);

const getSegRef = (index: number): InputInst | null => {
	return index === 0
		? seg0.value
		: index === 1
		? seg1.value
		: index === 2
		? seg2.value
		: seg3.value;
};

const onSegInput = (index: number) => {
	const raw = form.value.segments[index] || "";
	const sanitized = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
	form.value.segments[index] = sanitized.slice(0, 4);
	if (form.value.segments[index].length === 4 && index < 3) {
		nextTick(() => getSegRef(index + 1)?.focus());
	}
};

const onSegBackspace = (index: number) => {
	if ((form.value.segments[index] || "").length === 0 && index > 0) {
		nextTick(() => getSegRef(index - 1)?.focus());
	}
};

const handleUpdateShow = (value: boolean) => {
	emit("update:visible", value);
};

const handleCancel = () => {
	emit("update:visible", false);
};

const userBalanceDisplay = computed(() => {
	if (userBalance.value === null || userBalance.value === undefined) return "—";
	return `${Number(userBalance.value)} 百万`;
});

const fetchUserBalance = async () => {
	try {
		const userRes = await getUserInfo();
		userBalance.value = userRes?.data?.user?.userBalance ?? userBalance.value;
	} catch (e) {
		// ignore
	}
};

watch(
	() => props.visible,
	(val) => {
		if (val) {
			fetchUserBalance();
			redeemResult.value = null;
		}
	}
);

const handleConfirm = async () => {
	const code = form.value.segments.join("");
	if (!code || code.length !== 16) {
		message.warning("请输入完整的16位兑换码");
		return;
	}
	loading.value = true;
	redeemResult.value = null;
	try {
		const userRes = await getUserInfo();
		const userId = userRes?.data?.user?.userId;
		userBalance.value = userRes?.data?.user?.userBalance ?? userBalance.value;
		if (!userId) {
			message.error("无法获取用户信息，请重新登录");
			loading.value = false;
			return;
		}
		const res = await redeemCode({ code, userId });
		const data = (res as any)?.data || {};
		redeemResult.value = { cardNo: data.cardNo, msg: data.msg || "兑换完成" };
		// 更新最新余额（如果返回了）
		if (data.userBalance !== undefined && data.userBalance !== null) {
			userBalance.value = data.userBalance;
		}
	} catch (e: any) {
		message.error(e?.message || "兑换失败");
	} finally {
		loading.value = false;
	}
};

const clearCode = () => {
	form.value.segments = ["", "", "", ""];
	redeemResult.value = null;
	nextTick(() => seg0.value?.focus()); // 清空后自动聚焦第一个输入框
};

const onPaste = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData('text') || ''
  if (!pasted) return

  // 只保留字母和数字，并转大写
  const clean = pasted.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // 截取前16位
  const trimmed = clean.slice(0, 16)

  // 分配到四个输入框，每段最多4位
  const segs: [string, string, string, string] = [
    trimmed.slice(0, 4),
    trimmed.slice(4, 8),
    trimmed.slice(8, 12),
    trimmed.slice(12, 16)
  ]

  form.value.segments = segs

  event.preventDefault()

  // 自动聚焦到最后一个非空输入框
  nextTick(() => {
    if (segs[3]) {
      seg3.value?.focus()
    } else if (segs[2]) {
      seg2.value?.focus()
    } else if (segs[1]) {
      seg1.value?.focus()
    } else {
      seg0.value?.focus()
    }
  })
}



</script>

<style scoped>
.custom-clear {
  /* 调整 clear 按钮距离右边的距离 */
  --n-input-clear-padding: 0 8px 0 0; /* 上右下左 */
}
</style>

