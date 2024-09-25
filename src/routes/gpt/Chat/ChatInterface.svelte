<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import ChatBubble from './ChatBubble.svelte';
	import UploadIcon from '$lib/icons/UploadIcon.svelte';
	import hljs from 'highlight.js';
	import { readMessage } from './messageHandling';
	import { Chat, type Message } from '$lib/chat';

	export let chat: Chat;
	export let model: string;
	export let onclose: () => void;

	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;
	let uploading = false;
	const toastStore = getToastStore();

	async function addUserMessage(event: KeyboardEvent) {
		if (event.key !== 'Enter' || (event.key === 'Enter' && event.shiftKey)) return;
		if (currentMessage === '') return;
		if (loading) return;
		event.preventDefault();
		addMessage('user', currentMessage);
		currentMessage = '';
		await addResponse();
		if (chat.messages.length === 3) {
			chat.title = await getTitle();
		}
		chat.save();
	}

	async function getTitle() {
		const endpoint = '/api/claude/single';
		const title_messages: Message[] = [
			...chat.messages,
			{
				role: 'user',
				content:
					'Please write a title for this chat, use at most 30 characters. Respond with nothing but the title.',

				timestamp: new Date().toLocaleTimeString()
			}
		];
		return await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({
				messages: title_messages,
				model: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
			})
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error('Title response was not ok.');
			}
			return await response.text();
		});
	}

	function addMessage(role: 'assistant' | 'user', content: string) {
		chat.addMessage(role, content);
		scrollChatBottom(true);
		chat.messages = [...chat.messages];
		return chat.messages[chat.messages.length - 1];
	}

	async function addResponse() {
		const endpoint = model.startsWith('anthropic') ? '/api/claude/stream' : '/api/gpt';
		loading = true;
		try {
			await fetch(endpoint, {
				method: 'POST',
				body: JSON.stringify({ messages: chat.messages, model })
			})
				.then(async (response) => {
					if (!response.ok) {
						throw new Error('Network response was not ok.');
					}
					const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
					if (!reader) return;
					const stream = await readMessage(reader);
					const onWrite = () => {
						chat.messages = [...chat.messages]; // Needed for reactivity.
						scrollChatBottom();
					};
					const onClose = () => {
						scrollChatBottom();
						hljs.highlightAll();
					};
					await chat.addMessageStream('assistant', stream, onWrite, onClose);
				})
				.catch((error) => {
					console.error('There was a problem with the fetch operation:', error);
				});
		} finally {
			loading = false;
		}
	}

	function scrollChatBottom(force: boolean = false): void {
		if (!elemChat) return;
		const isCloseToBottom =
			elemChat.scrollHeight - elemChat.scrollTop - elemChat.clientHeight < 200;
		if (!isCloseToBottom && !force) return;
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' });
	}

	function uploadFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.pdf, .jpg, .jpeg, .png, .bmp, .tiff, .heif, .docx, .xlsx, .pptx, .html, .txt';
		input.onchange = async (event) => {
			const files = (event.target as HTMLInputElement).files;
			if (!files) return;
			if (files[0].name.split('.').slice(-1)[0] === 'txt') {
				const text = await files[0].text();
				addMessage('user', text);
				await addResponse();
				return;
			}
			const file = files[0];
			const formData = new FormData();
			formData.append('file', file);
			uploading = true;
			const response = await fetch('/api/document-intelligence', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const text = await response.text();
				addMessage('user', text);
				uploading = false;
				await addResponse();
			} else {
				uploading = false;
				const toast = {
					message:
						'Something went wrong while processing the document. Please try again. If the problem persists, please contact support.',
					background: 'variant-filled-error'
				};
				toastStore.trigger(toast);
			}
		};
		input.click();
	}

	function resizeTextArea(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		target.style.height = 'auto';
		target.style.height = Math.min(target.scrollHeight, 300) + 'px';
	}
</script>

<div class="w-auto grid grid-rows-[auto_10rem] space-y-4">
	<section
		bind:this={elemChat}
		id="chat-container"
		class="min-h-[70vh] max-h-[70vh] p-4 overflow-y-auto space-y-4"
	>
		{#each chat.messages as message}
			<ChatBubble bind:message />
		{/each}
		<p class:hidden={!uploading}>Agate is processing the document...</p>
	</section>
	<div class="flex">
		<div
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] mx-auto max-w-[70%] rounded-container-token border-surface-700 border-2"
		>
			<button class="input-group-shim border-r-2" on:click={uploadFile}>
				<UploadIcon class="text-lg text-black" />
			</button>
			<textarea
				bind:value={currentMessage}
				class="bg-transparent border-0 ring-0"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
				disabled={loading || uploading}
				style="resize: none;"
				on:keydown={addUserMessage}
				on:input={resizeTextArea}
			/>
		</div>
		<button class="btn h-10 mt-5 variant-filled-error" on:click={onclose}> End Chat </button>
	</div>
</div>
