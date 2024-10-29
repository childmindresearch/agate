<script lang="ts">
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import UploadIcon from '$lib/icons/UploadIcon.svelte';

	type Props = {
		onsend: (arg0: string, arg1?: File[]) => Promise<void>;
		disabled?: boolean;
	};
	let { onsend }: Props = $props();

	let currentMessage = $state('');
	let files: File[] = $state([]);
	let disabled = $state(false);

	function resizeTextArea(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		target.style.height = 'auto';
		target.style.height = `${target.scrollHeight}px`;
	}

	function uploadFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = '.pdf, .jpg, .jpeg, .png, .bmp, .tiff, .heif, .docx, .xlsx, .pptx, .html, .txt';
		input.onchange = async (event) => {
			const addedFiles = (event.target as HTMLInputElement).files;
			if (!addedFiles) return;
			files = [...new Set(files.concat(Array.from(addedFiles)))];
		};
		input.click();
	}

	async function sendOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (!disabled) {
				disabled = true;
				const promise = onsend(currentMessage, files);
				currentMessage = '';
				files = [];
				await promise;
				disabled = false;
			}
		}
	}
</script>

<div class="space-y-1">
	<div class="space-x-2">
		{#each files as file}
			<button class="chip variant-filled" onclick={() => (files = files.filter((f) => f !== file))}>
				<DeleteIcon class="text-lg pr-2" />
				{file.name}
			</button>
		{/each}
	</div>
	<div
		class="input-group input-group-divider grid-cols-[auto_1fr_auto] mx-auto border-surface-700 border-2"
	>
		<button class="input-group-shim border-r-2" onclick={uploadFile}>
			<UploadIcon class="text-lg text-black" />
		</button>
		<textarea
			bind:value={currentMessage}
			class="bg-transparent border-0 ring-0 max-h-24"
			name="prompt"
			id="prompt"
			placeholder="Write a message..."
			rows="4"
			onkeydown={sendOnEnter}
			oninput={resizeTextArea}
		></textarea>
	</div>
</div>
