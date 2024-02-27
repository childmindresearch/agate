<script lang="ts">
	import { AppBar, LightSwitch, getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open({});
	}
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<div class="flex items-center">
			<button class="md:hidden btn btn-sm mr-4" on:click={drawerOpen}>
				<span>
					<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
						<rect width="100" height="20" />
						<rect y="30" width="100" height="20" />
						<rect y="60" width="100" height="20" />
					</svg>
				</span>
			</button>
			<a href="/" class="hidden md:block">
				<img src="/cmi.svg" alt="Agate" class="w-28" />
			</a>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<button class="btn hover:variant-soft-primary">
			<a href="https://github.com/childmindresearch/agate" target="_blank" rel="noreferrer">
				<i class="fa-brands fa-github text-lg" />
				<span>GitHub</span>
			</a>
		</button>
		<button class="btn hover:variant-soft-primary">
			<a href="mailto:dair@childmind.org" target="_blank" rel="noreferrer">
				<i class="fa-solid fa-envelope text-lg" />
				<span>Contact</span>
			</a>
		</button>
		<LightSwitch />
	</svelte:fragment>
</AppBar>
