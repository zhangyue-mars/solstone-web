<script lang="ts" setup>
import { computed, onMounted, onUnmounted, onUpdated, ref } from "vue";
import MarkdownIt from "markdown-it";
import mdKatex from "@traptitech/markdown-it-katex";
import mila from "markdown-it-link-attributes";
import hljs from "highlight.js";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { t } from "@/locales";
import { copyToClip } from "@/utils/copy";

import mjText from "@/views/mj/mjText.vue";
import dallText from "@/views/mj/dallText.vue";
import ttsText from "@/views/mj/ttsText.vue";
import whisperText from "@/views/mj/whisperText.vue";
import MjTextAttr from "@/views/mj/mjTextAttr.vue";
import aiTextSetting from "@/views/mj/aiTextSetting.vue";
import aiSetAuth from "@/views/mj/aiSetAuth.vue";
import { isApikeyError, isAuthSessionError, isTTS, mlog } from "@/api";

interface Props {
	inversion?: boolean;
	error?: boolean;
	text?: string;
	loading?: boolean;
	asRawText?: boolean;
	chat: Chat.Chat;
}

const props = defineProps<Props>();

const { isMobile } = useBasicLayout();

const textRef = ref<HTMLElement>();

const mdi = new MarkdownIt({
	html: true,
	linkify: true,
	breaks: true, // 把换行转换为 <br>
	// breaks: false, // 关闭自动换行
	typographer: true, // 智能标点（如 "--" -> —）
	highlight(code, language) {
		const validLang = !!(language && hljs.getLanguage(language));
		if (validLang) {
			const lang = language ?? "";
			return highlightBlock(
				hljs.highlight(code, { language: lang }).value,
				lang
			);
		}
		return highlightBlock(hljs.highlightAuto(code).value, "");
	},
});

mdi.use(mila, { attrs: { target: "_blank", rel: "noopener" } });
mdi.use(mdKatex, {
	blockClass: "katexmath-block rounded-md p-[10px]",
	errorColor: " #cc0000",
});

const wrapClass = computed(() => {
	return [
		"text-wrap",
		"min-w-[20px]",
		"max-w-[810px]",
		"rounded-md",
		isMobile.value ? "p-2" : "px-3 pb-2",
		props.inversion ? "bg-[#d2f9d1]" : "bg-[#f4f6f8]",
		props.inversion ? "dark:bg-[#a1dc95]" : "dark:bg-[#1e1e20]",
		props.inversion ? "message-request" : "message-reply",
		{ "text-red-500": props.error },
	];
});
const text = computed(() => {
	let value = props.text ?? "";
	if (!props.asRawText) {
		// value = value.replace(/\\\( *(.*?) *\\\)/g, "$$$1$$");
		// value = value.replace(/\\\((.*?)\\\)/g, "$$$1$$");
		// value = value.replace(/\\\[ *(.*?) *\\\]/g, "$$$$$1$$$$");
		// value = value.replace(/(#+)\s*\*{1,2}(.+?)\*{1,2}/g, "$1 **$2**");
		// //
		// value = value.replaceAll("\\[", "$$$$");
		// value = value.replaceAll("\\]", "$$$$");
		// value = value.replace(/^\s*-(\S)/gm, "- $1");
		// // value = value.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
		// value = value.replace(/^\*{3}([^\*])/gm, "* **$1");
		// // LaTeX 公式处理
    // value = value.replace(/\\\( *(.*?) *\\\)/g, "$$$1$$");
    // value = value.replace(/\\\((.*?)\\\)/g, "$$$1$$");
    // value = value.replace(/\\\[ *(.*?) *\\\]/g, "$$$$$1$$$$");

    // // 标题加空格，并处理两颗星号加粗
    // value = value.replace(/(#+)\s*\*{1,2}(.+?)\*{1,2}/g, "$1 **$2**");
    // value = value.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");

    // // 三颗星号转成加粗（去掉斜体效果）
    // value = value.replace(/\*{3}([^\*]+)\*{2,3}/g, "**$1**");

    // // 列表规范化
    // value = value.replace(/^\s*-\s*(\S)/gm, "- $1");

    // // 替换转义的中括号
    // value = value.replaceAll("\\[", "$$$$");
    // value = value.replaceAll("\\]", "$$$$");

		value = value.replace(
			/<think>([\s\S]*?)(?=<\/think>|$)/g,
			(match: string, content: string) => {
				const processedContent = content
					.split("\n")
					.filter((line) => line.trim() !== "")
					.join("<br>");
				return `<blockquote class="thinking-block">Thinking...<br>${processedContent}</blockquote>`;
			}
		);
		value = value.replaceAll("</think>", "");
		return mdi.render(value);
	}
	return value;
});

function highlightBlock(str: string, lang?: string) {
	return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t(
		"chat.copyCode"
	)}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
}

const isSolstoneModel = computed(() => {
	// console.log("chat", props.chat);
	// console.log("model", props.chat.model);
	return (
		(props.chat.model || props.model) &&
		(props.chat.model || props.model)
			?.toLowerCase()
			.includes("deepseek/deepseek-v3.1")
	);
});

const showSolstoneTip = computed(() => {
	// 确保是太阳石模型、消息加载完成、有文本内容且不是用户消息
	// 添加额外判断：确保不是流式响应中（loading结束且有内容）
	return (
		isSolstoneModel.value && !props.loading && props.text && !props.inversion
	);
});

function addCopyEvents() {
	if (textRef.value) {
		const copyBtn = textRef.value.querySelectorAll(".code-block-header__copy");
		copyBtn.forEach((btn) => {
			btn.addEventListener("click", () => {
				const code = btn.parentElement?.nextElementSibling?.textContent;
				if (code) {
					copyToClip(code).then(() => {
						btn.textContent = "复制成功";
						setTimeout(() => {
							btn.textContent = "复制代码";
						}, 1000);
					});
				}
			});
		});
	}
}

function removeCopyEvents() {
	if (textRef.value) {
		const copyBtn = textRef.value.querySelectorAll(".code-block-header__copy");
		copyBtn.forEach((btn) => {
			btn.removeEventListener("click", () => {});
		});
	}
}

onMounted(() => {
	addCopyEvents();
});

onUpdated(() => {
	addCopyEvents();
});

onUnmounted(() => {
	removeCopyEvents();
});
</script>

<template>
	<div class="text-black" :class="wrapClass">
		<div ref="textRef" class="leading-relaxed break-words">
			<div v-if="!inversion">
				<aiTextSetting v-if="!inversion && isApikeyError(text)" />
				<aiSetAuth v-if="!inversion && isAuthSessionError(text)" />

				<dallText
					:chat="chat"
					v-if="chat.model && chat.model?.indexOf('chat') == -1"
					class="whitespace-pre-wrap"
				/>
				<mjText
					v-if="chat.mjID"
					class="whitespace-pre-wrap"
					:chat="chat"
					:mdi="mdi"
				></mjText>
				<ttsText
					v-else-if="chat.model && isTTS(chat.model) && chat.text == 'ok'"
					:chat="chat"
				/>
				<template v-else>
					<div
						v-if="!asRawText"
						class="markdown-body"
						:class="{ 'markdown-body-generate': loading }"
						v-html="text"
					/>
					<div v-else class="whitespace-pre-wrap" v-text="text" />
				</template>
				<!-- 太阳石矿山大模型提示 -->
				<div
					v-if="!inversion && showSolstoneTip"
					class="mt-2 text-xs text-gray-500 text-left opacity-80"
				>
					<em>此回答由太阳石矿山大模型生成，请仔细甄别。</em>
				</div>
			</div>
			<whisperText
				v-else-if="text == 'whisper' && chat.opt?.lkey"
				:chat="chat"
			/>
			<div v-else-if="asRawText" class="whitespace-pre-wrap" v-text="text" />
			<div
				v-else
				class="markdown-body"
				style="--color-fg-default: #24292f"
				v-html="text"
			/>
			<!-- <div v-else class="whitespace-pre-wrap" v-text="text" /> -->
			<MjTextAttr
				:image="chat.opt?.images[0]"
				v-if="chat.opt?.images"
			></MjTextAttr>
			<whisperText
				v-if="
					chat.model && chat.model.indexOf('whisper') > -1 && chat.opt?.lkey
				"
				:isW="true"
				:chat="chat"
				class="w-full"
			/>
			<ttsText
				v-if="
					!inversion &&
					chat.opt?.duration &&
					chat.opt?.duration > 0 &&
					chat.opt?.lkey
				"
				:isW="true"
				:chat="chat"
				class="w-full"
			/>
		</div>
	</div>
</template>

<style lang="less">
@import url(./style.less);
</style>
