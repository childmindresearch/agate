<script lang="ts">
	export let title: string;
	export let message: string;

	export let variant: 'success' | 'error' | 'warning';

	const colorClass = `alert variant-soft-${variant}`;
</script>

<!--Ensure dynamic classes aren't purged.-->
<span class:hidden={'variant-soft-success variant-soft-error variant-soft-warning'} />

<aside class={colorClass}>
	<div class="alert-message">
		<h3 class="h3">{title}</h3>
		<p>{message}</p>
	</div>
</aside>
