<script>
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	let { show = $bindable(true) } = $props();
</script>

<div class={`flex items-center justify-center m-3 ${show ? '' : 'hidden'}`}>
	<ProgressRadial
		stroke={60}
		meter="stroke-primary-500"
		track="stroke-primary-500/30"
		strokeLinecap="round"
		width="w-16"
	/>
</div>
