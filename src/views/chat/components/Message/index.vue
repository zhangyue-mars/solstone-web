<script setup lang="ts">
import { computed, ref } from "vue";
import { NDropdown, useMessage, NTooltip } from "naive-ui";
import AvatarComponent from "./Avatar.vue";
import TextComponent from "./Text.vue";
import { SvgIcon } from "@/components/common";
import { useIconRender } from "@/hooks/useIconRender";
import { t } from "@/locales";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { copyToClip } from "@/utils/copy";
import { homeStore } from "@/store";
import { getSeed, mlog } from "@/api";
import CopyOutlineIcon from "@/assets/CopyOutline.svg";
import DeleteOutlinedIcon from "@/assets/DeleteOutlined.svg";

interface Props {
	dateTime?: string;
	text?: string;
	inversion?: boolean;
	error?: boolean;
	loading?: boolean;
	chat: Chat.Chat;
	index: number;
}

interface Emit {
	(ev: "regenerate"): void;
	(ev: "delete"): void;
	(ev: "edit"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();

const { isMobile } = useBasicLayout();
const { iconRender } = useIconRender();
const message = useMessage();

const textRef = ref<HTMLElement>();
const asRawText = ref(
	props.inversion && homeStore.myData.session.isCloseMdPreview
);
const messageRef = ref<HTMLElement>();

const options = computed(() => {
	const common = [];

	if (!props.inversion) {
		common.unshift({
			label: asRawText.value ? t("chat.preview") : t("chat.showRawText"),
			key: "toggleRenderType",
			icon: iconRender({
				icon: asRawText.value ? "ic:outline-code-off" : "ic:outline-code",
			}),
		});
		common.unshift({
			label: t("mj.tts"),
			key: "tts",
			icon: iconRender({ icon: "mdi:tts" }),
		});
	}

	return common;
});

function handleSelect(
	key: "copyText" | "delete" | "edit" | "toggleRenderType" | "tts"
) {
	switch (key) {
		case "tts":
			homeStore.setMyData({
				act: "gpt.ttsv2",
				actData: {
					index: props.index,
					uuid: props.chat.uuid,
					text: props.text,
				},
			});
			return;
		case "copyText":
			handleCopy();
			return;
		case "toggleRenderType":
			asRawText.value = !asRawText.value;
			return;
		case "delete":
			emit("delete");
			return;
		case "edit":
			emit("edit");
	}
}

async function handleCopy(txt?: string) {
	try {
		await copyToClip(txt || props.text || "");
		message.success(t("chat.copied"));
	} catch {
		message.error(t("mj.copyFail"));
	}
}

const sendReload = () => {
	homeStore.setMyData({ act: "mjReload", actData: { mjID: props.chat.mjID } });
};

function handleRegenerate2() {
	messageRef.value?.scrollIntoView();
	mlog("重新发送！");
	homeStore.setMyData({
		act: "gpt.resubmit",
		actData: { index: props.index, uuid: props.chat.uuid },
	});
}
</script>

<template>
	<div
		ref="messageRef"
		class="flex w-full mb-8 overflow-hidden"
		:class="[{ 'flex-row-reverse': inversion }]"
	>
		<!-- 头像 -->
		<div
			class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
			:class="[inversion ? 'ml-2' : 'mr-2']"
			v-if="!inversion"
		>
			<AvatarComponent :image="inversion" :logo="chat.logo" />
		</div>

		<div
			class="overflow-hidden text-sm flex flex-col"
			:class="[inversion ? 'items-end' : 'items-start']"
		>
			<!-- 顶部状态条 -->
			<p
				class="text-xs group text-[#b4bbc4] flex items-center space-x-2"
				:class="[inversion ? 'justify-end' : 'justify-start']"
			>
				<template v-if="chat.opt?.status == 'SUCCESS'">
					<SvgIcon
						icon="ri:restart-line"
						@click="sendReload"
						class="cursor-pointer text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
					/>
					<div @click="getSeed(chat, message)" class="cursor-pointer">
						<span v-if="chat.opt?.seed">Seed:{{ chat.opt?.seed }}</span>
						<span v-else>Seed</span>
					</div>
				</template>
			</p>

			<!-- 回答内容 -->
			<div
				class="flex items-end gap-1"
				:class="[inversion ? 'flex-row-reverse' : 'flex-row']"
			>
				<TextComponent
					ref="textRef"
					:inversion="inversion"
					:error="error"
					:text="text"
					:loading="loading"
					:as-raw-text="asRawText"
					:chat="chat"
				/>
			</div>

			<!-- 按钮行（AI 和 人类消息都有，回答结束后才显示） -->
			<div
				v-if="!chat.mjID && !loading && !error"
				class="mt-2 flex items-center"
			>
				<NTooltip
					trigger="hover"
					placement="bottom"
					style="
						--n-font-size: 12px;
						--n-border-radius: 8px;
						--n-padding: 4px 8px;
					"
					:show-delay="50"
					:hide-delay="50"
				>
					<template #trigger>
						<button
							@click="handleCopy()"
							class="p-2 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition"
						>
							<svg viewBox="0 0 512 512" class="w-4 h-4">
								<rect
									x="128"
									y="128"
									width="336"
									height="336"
									rx="57"
									ry="57"
									fill="none"
									stroke="currentColor"
									stroke-linejoin="round"
									stroke-width="32"
								/>
								<path
									d="M383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="32"
								/>
							</svg>
						</button>
					</template>
					{{ t("chat.copy") }}
				</NTooltip>

				<!-- 删除按钮 -->
				<NTooltip
					trigger="hover"
					placement="bottom"
					style="
						--n-font-size: 12px;
						--n-border-radius: 8px;
						--n-padding: 4px 8px;
					"
					:show-delay="50"
					:hide-delay="50"
				>
					<template #trigger>
						<button
							class="p-2 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition"
							@click="emit('delete')"
						>
							<svg viewBox="0 0 1024 1024" style="width: 18px; height: 18px">
								<path
									d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"
									fill="currentColor"
								/>
							</svg>
						</button>
					</template>
					{{ t("common.delete") }}
				</NTooltip>

				<!-- 刷新按钮（仅 AI 气泡显示） -->
				<NTooltip
					v-if="!inversion"
					trigger="hover"
					placement="bottom"
					style="
						--n-font-size: 12px;
						--n-border-radius: 8px;
						--n-padding: 4px 8px;
					"
					:show-delay="50"
					:hide-delay="50"
				>
					<template #trigger>
						<button
							class="p-2 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition"
							@click="handleRegenerate2"
						>
							<SvgIcon icon="ri:restart-line" class="w-4 h-4" />
						</button>
					</template>
					{{ t("chat.regenerate") }}
				</NTooltip>

				<!-- 更多下拉菜单，仅 AI 气泡显示 -->
				<NDropdown
					v-if="!inversion"
					:trigger="isMobile ? 'click' : 'hover'"
					:placement="'right'"
					:options="options"
					@select="handleSelect"
				>
					<button
						class="p-2 rounded-md text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition focus:outline-none"
					>
						<SvgIcon icon="ri:more-2-fill" class="w-4 h-4" />
					</button>
				</NDropdown>
			</div>
		</div>
	</div>
</template>
