<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import ChatBubble from './ChatBubble.svelte';
	import UploadIcon from '$lib/icons/UploadIcon.svelte';
	import hljs from 'highlight.js';
	import { readMessage } from './messageHandling';

	export let systemPrompt: string;
	export let model: string;

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
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
		addMessage(currentMessage, 'user');
		currentMessage = '';
		addResponse();
	}

	function addMessage(content: string, role: 'assistant' | 'user') {
		const timestamp = new Date().toLocaleTimeString();
		const newMessage = {
			content,
			role,
			timestamp
		};
		messages = [...messages, newMessage];
		scrollChatBottom();
		return newMessage;
	}

	async function addResponse() {
		loading = true;
		let endpoint: string;
		if (model === 'gpt-4o') {
			endpoint = '/api/gpt';
		} else {
			endpoint = '/api/claude';
		}
		await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ messages, model })
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok.');
				}
				const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
				if (!reader) return;
				const stream = await readMessage(reader);
				let message: { content: string; role: 'assistant' | 'user'; timestamp: string };
				stream.pipeTo(
					new WritableStream({
						write(chunk) {
							if (!message) {
								message = addMessage('', 'assistant');
							}
							message.content += chunk;
							messages = [...messages.slice(0, -1), message]; // Needed for svelte reactivity.
							scrollChatBottom();
						},
						close() {
							scrollChatBottom();
							hljs.highlightAll();
							loading = false;
						}
					})
				);
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
			});
	}

	function scrollChatBottom(): void {
		if (!elemChat) return;
		const isCloseToBottom =
			elemChat.scrollHeight - elemChat.scrollTop - elemChat.clientHeight < 200;
		if (!isCloseToBottom) return;
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
				addMessage(text, 'user');
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
				addMessage(text, 'user');
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
		{#each messages as message}
			<ChatBubble bind:message />
		{/each}
		<p class:hidden={!uploading}>Agate is processing the document...</p>
	</section>
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
</div>
