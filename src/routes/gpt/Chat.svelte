<script lang="ts">
	export let systemPrompt: string;
	export let user: string = 'You';

	let messages = [
		{ role: 'system', content: systemPrompt, timestamp: new Date().toLocaleTimeString() }
	];
	let currentMessage = '';
	let elemChat: HTMLElement;
	let loading = false;

	const model = 'gpt-4-turbo-preview';

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

	function capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
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
					<small class="opacity-50">{bubble.timestamp}</small>
				</header>
				<p class="whitespace-pre">{bubble.content}</p>
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
