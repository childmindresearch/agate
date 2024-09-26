<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';

	let files: File[];
</script>

<FileDropZone name="test" onchange={(f) => (files = f)} />
