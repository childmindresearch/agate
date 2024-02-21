<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let systemPrompt: string;

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;

	const model = 'gpt-4';

	const user_avatar = 'https://i.pravatar.cc/150?img=31';
	const server_avatar = 'https://i.pravatar.cc/150?img=54';

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

<div class="chat w-full h-full">
	<section
		bind:this={elemChat}
		id="chat-container"
		class="w-full max-h-[600px] min-h-[600px] p-4 overflow-y-auto space-y-4"
	>
		{#each messages as bubble}
			{#if bubble.role === 'assistant'}
				<div class="grid grid-cols-[auto_1fr] gap-2">
					<Avatar src={server_avatar} width="w-12" />
					<div class="card p-4 rounded-tl-none space-y-2 bg-primary-200/30">
						<header class="flex justify-between items-center">
							<p class="font-bold">Agate</p>
							<small class="opacity-50">{bubble.timestamp}</small>
						</header>
						<p class="whitespace-pre">{bubble.content}</p>
					</div>
				</div>
			{:else if bubble.role === 'user'}
				<div class="grid grid-cols-[1fr_auto] gap-2">
					<div class="card p-4 rounded-tr-none space-y-2 bg-primary-500/30">
						<header class="flex justify-between items-center">
							<p class="font-bold">You</p>
							<small class="opacity-50">{bubble.timestamp}</small>
						</header>
						<p class="whitespace-pre">{bubble.content}</p>
					</div>
					<Avatar src={user_avatar} width="w-12" />
				</div>
			{/if}
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
