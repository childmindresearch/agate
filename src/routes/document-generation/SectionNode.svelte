<script lang="ts">
	import EditIcon from '$lib/icons/EditIcon.svelte';
	import PlusIcon from '$lib/icons/PlusIcon.svelte';
	import SaveIcon from '$lib/icons/SaveIcon.svelte';
	import TrashIcon from '$lib/icons/TrashIcon.svelte';
	import { Section } from './section';

	export let section: Section;
	export let onDelete: () => void;
	export let isRoot = true;

	let editable = false;

	function addSection() {
		section.children = [
			...section.children,
			new Section({ title: 'Section Title', instructions: 'Section instructions' })
		];
	}

	function onChildDelete(child: Section) {
		section.children = section.children.filter((c) => c !== child);
	}
</script>

<div class="card max-w-[48rem]">
	<header class="card-header text-lg font-semibold flex justify-between items-center">
		{#if editable}
			<input type="text" class="input" bind:value={section.title} />
		{:else}
			{section.title}
		{/if}
		<div class="pl-3 space-x-2">
			<button on:click={addSection}> <PlusIcon /> </button>
			<button on:click={() => (editable = !editable)}>
				{#if editable}
					<SaveIcon />
				{:else}
					<EditIcon />
				{/if}
			</button>
			{#if !isRoot}
				<button on:click={onDelete}>
					<TrashIcon />
				</button>
			{/if}
		</div>
	</header>
	<section class="p-4 overflow-y-scroll max-h-96">
		{#if editable}
			<textarea class="input" bind:value={section.instructions} />
			<input type="file" class="input" multiple bind:files={section.files} accept=".txt" />
		{:else}
			{#if (section.files?.length ?? 0) < section.n_required_files}
				<aside class="alert variant-soft-error">
					<div class="alert-message">
						This section requires at least {section.n_required_files} file upload{section.n_required_files ==
						1
							? ''
							: 's'}. Click the edit button to upload.
					</div>
				</aside>
			{/if}
			<div class="whitespace-pre-wrap">
				{section.instructions}
			</div>
		{/if}
	</section>
	<footer class="card-footer space-y-4">
		{#each section.children as child}
			<svelte:self section={child} onDelete={() => onChildDelete(child)} isRoot={false} />
		{/each}
	</footer>
</div>
