<script lang="ts">
	import EnvelopeIcon from '$lib/icons/EnvelopeIcon.svelte';
	import GithubIcon from '$lib/icons/GithubIcon.svelte';
	import { AppBar, getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	function drawerOpen(): void {
		drawerStore.open({});
	}
</script>

<AppBar data-testid="app-bar">
	<svelte:fragment slot="lead">
		<div class="flex items-center">
			<button class="md:hidden btn btn-sm mr-4" onclick={drawerOpen} aria-label="Open Drawer">
				<span>
					<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
						<rect width="100" height="20" />
						<rect y="30" width="100" height="20" />
						<rect y="60" width="100" height="20" />
					</svg>
				</span>
			</button>
			<a href="/" data-testid="a-cmi-logo" class="hidden md:block" aria-label="Home button">
				<img src="/cmi.svg" alt="Agate" class="w-28" />
			</a>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<button class="btn hover:variant-soft-primary">
			<a
				data-testid="a-github"
				href="https://github.com/childmindresearch/agate"
				target="_blank"
				rel="noreferrer"
			>
				<GithubIcon />
				<span>GitHub</span>
			</a>
		</button>
		<button class="btn hover:variant-soft-primary">
			<a data-testid="a-mailto" href="mailto:dair@childmind.org" target="_blank" rel="noreferrer">
				<EnvelopeIcon />
				<span>Contact</span>
			</a>
		</button>
	</svelte:fragment>
</AppBar>
