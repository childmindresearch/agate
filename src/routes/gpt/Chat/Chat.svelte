<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import ChatBubble from './ChatBubble.svelte';
	import UploadIcon from '$lib/icons/UploadIcon.svelte';

	export let systemPrompt: string;

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;
	let uploading = false;

	const model = 'gpt-4o';
	const toastStore = getToastStore();

	async function addUserMessage(event: KeyboardEvent) {
		if (event.key !== 'Enter' || (event.key === 'Enter' && event.shiftKey)) return;
		if (currentMessage === '') return;
		if (loading) return;
		event.preventDefault();
		addMessage(currentMessage, 'user');
		addResponse();
	}

	function addMessage(content: string, role: 'assistant' | 'user') {
		const timestamp = new Date().toLocaleTimeString();
		messages = [
			...messages,
			{
				content,
				role,
				timestamp
			}
		];
		currentMessage = '';
		// Timeout prevents race condition
		setTimeout(() => {
			scrollChatBottom();
		}, 0);
	}

	async function addResponse() {
		loading = true;
		await fetch('/api/gpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ messages, model })
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error('Network response was not ok.');
			})
			.then((data) => {
				addMessage(data.message, 'assistant');
				loading = false;
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
			});
		loading = false;
	}

	function scrollChatBottom(): void {
		if (!elemChat) return;
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' });
	}

	function uploadFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.pdf, .jpg, .jpeg, .png, .bmp, .tiff, .heif, .docx, .xlsx, .pptx, .html';
		input.onchange = async (event) => {
			const files = (event.target as HTMLInputElement).files;
			if (!files) return;
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
		target.style.height = Math.min(target.scrollHeight, 200) + 'px';
	}
</script>

<div class="chat w-full">
	<section
		bind:this={elemChat}
		id="chat-container"
		class="w-full max-h-[70vh] min-h-[100px] p-4 overflow-y-auto space-y-4"
	>
		{#each messages as message}
			<ChatBubble {message} />
		{/each}
		<p class:hidden={!loading}>Agate is typing...</p>
		<p class:hidden={!uploading}>Agate is processing the document...</p>
	</section>
	<div
		class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token border-surface-700 border-2"
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
			on:keydown={addUserMessage}
			on:input={resizeTextArea}
		/>
	</div>
</div>
