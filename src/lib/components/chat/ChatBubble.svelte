<script lang="ts">
	import CopyIcon from '$lib/icons/CopyIcon.svelte';
	import { getToastStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import SvelteMarkdown from 'svelte-markdown';
	import CodeBlock from './Renderers/CodeBlock.svelte';
	import OrderedListItem from './Renderers/OrderedListItem.svelte';
	import UnorderedListItem from './Renderers/UnorderedListItem.svelte';
	import './chat.postcss';
	import type { Message } from './messageHandling.svelte';

	let { message }: { message: Message } = $props();

	const toastStore = getToastStore();

	const names: { [key: string]: string } = {
		assistant: 'Agate',
		user: 'You',
		system: 'System'
	};
	const roleCss: { [key: string]: string } = {
		assistant: 'bg-primary-500/30 mr-auto w-10/12',
		user: 'bg-primary-200/30 ml-auto w-10/12',
		system: 'bg-primary-800/30 w-full'
	};

	function toClipboard(text: string) {
		return () => {
			navigator.clipboard.writeText(text);
			toastStore.trigger({
				message: 'Copied message to clipboard.',
				background: 'variant-filled-success'
			});
		};
	}

	const popupHover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};
</script>

<div
	class="card p-[0.3rem] border-2 border-gray-300"
	style="border-radius: 2rem"
	data-popup="popupHover"
>
	<p>Copy</p>
</div>

<div class={`${roleCss[message.role]} card p-4 rounded-xl space-y-2 `}>
	<header class="flex justify-between items-center">
		<p class="font-bold">{names[message.role]}</p>
		<div class="grid grid-flow-col-dense gap-2">
			<button
				onclick={toClipboard(message.content)}
				class="[&>*]:pointer-events-none hover:opacity-70"
				use:popup={popupHover}
			>
				<CopyIcon />
			</button>
			<small class="opacity-90">{message.timestamp}</small>
		</div>
	</header>
	{#if message.role === 'assistant'}
		<SvelteMarkdown
			source={message.content}
			renderers={{
				// @ts-expect-error - something breaks in the typing on Svelte 5, but it runs fine.
				code: CodeBlock,
				orderedlistitem: OrderedListItem,
				unorderedlistitem: UnorderedListItem
			}}
		/>
	{:else}
		<p>{message.content}</p>
	{/if}
</div>
