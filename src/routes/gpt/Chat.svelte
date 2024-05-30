<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import SvelteMarkdown from 'svelte-markdown';
	import Code from './Code.svelte';
	import './chat.postcss';

	export let systemPrompt: string;
	export let user = 'You';

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;
	let uploading = false;

	const model = 'gpt-4o';
	const toastStore = getToastStore();

	const names: { [key: string]: string } = {
		assistant: 'Agate',
		user: capitalizeFirstLetter(user.split('.')[0]),
		system: 'System'
	};
	const roleCss: { [key: string]: string } = {
		assistant: 'bg-primary-500/30 mr-auto w-10/12',
		user: 'bg-primary-200/30 ml-auto w-10/12',
		system: 'bg-primary-800/30 w-full'
	};

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

	function capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
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
		{#each messages as bubble}
			<div class={`${roleCss[bubble.role]} card p-4 rounded-tl-none space-y-2 `}>
				<header class="flex justify-between items-center">
					<p class="font-bold">{names[bubble.role]}</p>
					<small class="opacity-90">{bubble.timestamp}</small>
				</header>
				<SvelteMarkdown source={bubble.content} renderers={{ code: Code }} />
			</div>
		{/each}
		{#if loading}
			<p>Agate is typing...</p>
		{/if}
		{#if uploading}
			<p>Agate is processing the document.</p>
		{/if}
	</section>
	<div
		class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token border-surface-700 border-2"
	>
		<button class="input-group-shim border-r-2" on:click={uploadFile}
			><i class="fas fa-file-upload text-lg text-black"></i></button
		>
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
