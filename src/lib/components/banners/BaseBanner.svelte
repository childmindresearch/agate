<script lang="ts">
	import { modeCurrent } from '@skeletonlabs/skeleton';
	export let title: string;
	export let message: string;

	export let variant: 'success' | 'error' | 'warning';
	let currentClass: string;

	const colorLightClass = `alert variant-soft-${variant}`;
	const colorDarkClass = `alert variant-filled-${variant}`;

	$: currentClass = $modeCurrent ? colorLightClass : colorDarkClass;
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
/>

<aside class={currentClass}>
	<div class="alert-message">
		<h3 class="h3">{title}</h3>
		<p>{message}</p>
	</div>
</aside>
