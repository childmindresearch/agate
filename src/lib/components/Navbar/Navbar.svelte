<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton';
	import NavbarLead from './NavbarLead.svelte';
	import NavbarLink from './NavbarLink.svelte';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<NavbarLead />
	</svelte:fragment>

	<NavbarLink href="gpt" title="Chatbot" />
	<NavbarLink href="embedding" title="Embedding" />
	<NavbarLink href="dalle" title="Image Generation" />
	<NavbarLink href="text-to-speech" title="Text To Speech" />
	<NavbarLink href="transcription" title="Transcription" />
</AppBar>
