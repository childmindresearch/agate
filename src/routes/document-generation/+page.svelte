<script lang="ts">
	import SectionNode from './SectionNode.svelte';
	import { Section } from './section';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { downloadBlob } from '$lib/fileHandling';
	import LoadingBar from '$lib/components/LoadingBar.svelte';
	import { customPreset, grantProposalPreset } from './presets';

	let section: Section;
	let isLoading = false;
	let presets: { [key: string]: Section } = {
		Custom: customPreset,
		'Grant Proposal': grantProposalPreset
	};
	let selected = Object.keys(presets)[0];

	const toastStore = getToastStore();

	async function generateDocument() {
		console.log('hi!');
		isLoading = true;
		try {
			const claudeBody = JSON.stringify({
				model: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
				messages: [
					{
						role: 'system',
						content:
							'You will receive a JSON formatted instruction for generating a document. The schema contains a title for each section, instructions for each section, file contents that should be used in that section and its children, and the children of a section. Your goal is to write a Markdown document based on this data.'
					},
					{ role: 'user', content: section.getPrompt() }
				]
			});
			const llm_response = await fetch('/api/claude/single', {
				method: 'POST',
				body: claudeBody
			});
			if (!llm_response.ok) {
				toastStore.trigger({
					message: 'An error occurred in getting the LLM response.',
					background: 'variant-soft-error'
				});
				return;
			}
			const md2docx_response = await fetch('/api/markdown2docx', {
				body: await llm_response.text(),
				method: 'POST'
			});
			if (!md2docx_response.ok) {
				toastStore.trigger({
					message: 'An error occurred in converting to Word.',
					background: 'variant-soft-error'
				});
				return;
			}
			downloadBlob(await md2docx_response.blob(), section.title + '.docx');
		} finally {
			isLoading = false;
		}
	}

	$: section = presets[selected].clone();
</script>

{#if isLoading}
	<LoadingBar />
{:else}
	<div class="space-y-2">
		<label>
			Presets:
			<select bind:value={selected} class="input max-w-48">
				{#each Object.keys(presets) as key}
					<option value={key}>{key}</option>
				{/each}
			</select>
		</label>
		<SectionNode bind:section onDelete={() => {}} />
		<button class="btn variant-soft-primary" on:click={async () => await generateDocument()}>
			Generate
		</button>
	</div>
{/if}
