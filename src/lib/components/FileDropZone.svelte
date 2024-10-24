<script lang="ts">
	import { FileDropzone } from '@skeletonlabs/skeleton';

	export let name: string;
	export let onchange: (file: File[]) => void;

	let files: FileList;
	let fileArray: File[] = [];
</script>

<FileDropzone {name} bind:files />
{#each fileArray as file}
	<button class="chip" on:click={() => (fileArray = fileArray.filter((f) => f !== file))}>
		X {file.name}
	</button>
{/each}
