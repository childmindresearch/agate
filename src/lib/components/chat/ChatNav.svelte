<script lang="ts">
	import PlusIcon from '$lib/icons/PlusIcon.svelte';
	import ThreeBarsIcon from '$lib/icons/ThreeBarsIcon.svelte';
	import { LlmModels, type modelTags } from './constants';

	type Props = {
		llm: modelTags;
		onNewChat: () => void;
		onHistoryClick: () => void;
	};
	let { llm = $bindable(), onNewChat, onHistoryClick }: Props = $props();
</script>

<div class="flex flex-row flex-1 w-max gap-2 py-2">
	<button class="btn variant-soft-primary align-middle" onclick={onHistoryClick}>
		<ThreeBarsIcon class="text-lg pr-2" />
		History
	</button>
	<button class="btn variant-soft-primary align-middle" onclick={onNewChat}>
		<PlusIcon class="text-lg pr-2" />
		New Chat
	</button>
	<select class="btn variant-soft-primary align-middle w-56 border-none">
		{#each LlmModels as model}
			<option selected={model.tag === llm} value={model.tag} onclick={() => (llm = model.tag)}>
				{model.name}
			</option>
		{/each}
	</select>
</div>
