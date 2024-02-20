<script lang="ts">
	export let href: string;
	export let title: string;
</script>

<a {href}>
	<button class="btn hover:variant-soft-primary">
		<span class="font-semibold">{title}</span>
	</button>
</a>
