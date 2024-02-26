<script lang="ts">
	import { onMount } from 'svelte';

	export let systemPrompt: string;

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;

	const model = 'gpt-4';

	async function addUserMessage(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		if (currentMessage === '') return;
		if (loading) return;
		event.preventDefault();
		addMessage(currentMessage, 'user');
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

	function scrollChatBottom(): void {
		if (!elemChat) return;
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior: 'smooth' });
	}

	onMount(() => {
		scrollChatBottom();
	});
</script>

<div class="chat w-full">
	<section
		bind:this={elemChat}
		id="chat-container"
		class="w-full max-h-[400px] min-h-[100px] p-4 overflow-y-auto space-y-4"
	>
		{#each messages.slice(1) as bubble}
			<div class="grid grid-cols-[auto_1fr] gap-2 min-w-full">
				<div class="card p-4 rounded-tl-none space-y-2 bg-primary-200/30">
					<header class="flex justify-between items-center">
						<p class="font-bold">{bubble.role === 'assistant' ? 'Agate' : 'You'}</p>
						<small class="opacity-50">{bubble.timestamp}</small>
					</header>
					<p>{bubble.content}</p>
				</div>
			</div>
		{/each}
		{#if loading}
			<p>Agate is typing...</p>
		{/if}
	</section>
	<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
		<button class="input-group-shim">+</button>
		<textarea
			bind:value={currentMessage}
			class="bg-transparent border-0 ring-0"
			name="prompt"
			id="prompt"
			placeholder="Write a message..."
			rows="4"
			on:keydown={addUserMessage}
		/>
	</div>
</div>
