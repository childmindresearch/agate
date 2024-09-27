<script lang="ts">
	import { modeCurrent } from '@skeletonlabs/skeleton';

	let {
		title,
		message,
		variant
	}: {
		title: string;
		message: string;
		variant: 'success' | 'error' | 'warning';
	} = $props();

	const colorLightClass = `alert variant-soft-${variant}`;
	const colorDarkClass = `alert variant-filled-${variant}`;

	const currentClass = $derived($modeCurrent ? colorLightClass : colorDarkClass);
</script>

<!--Ensure dynamic classes aren't purged.-->
<span
	class:hidden={`
		variant-soft-success 
		variant-soft-error 
		variant-soft-warning 
		variant-filled-success 
		variant-filled-error 
		variant-filled-warning
	`}
></span>

<aside class={currentClass}>
	<div class="alert-message">
		<h3 class="h3">{title}</h3>
		<p>{message}</p>
	</div>
</aside>
