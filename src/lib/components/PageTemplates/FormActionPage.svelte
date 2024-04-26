<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import FormBasePage from './FormBasePage.svelte';

	export let title: string;
	export let description: string;
	export let enhancer: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
		};
	};
	export let isLoading = false;

	export let azureBaa = false;
	export let openAiBaa = false;

	const loadingEnhancer: SubmitFunction = ({
		formElement,
		formData,
		action,
		controller,
		cancel,
		submitter
	}) => {
		const updateFunction = enhancer({
			formElement,
			formData,
			action,
			controller,
			cancel,
			submitter
		});
		isLoading = true;
		return async ({ update }) => {
			try {
				// @ts-expect-error because enhancer returns a maybe promise. This should always work.
				await updateFunction({ update });
			} finally {
				isLoading = false;
			}
		};
	};
</script>

<FormBasePage {title} {description} {isLoading} {azureBaa} {openAiBaa}>
	<svelte:fragment slot="form">
		<form
			method="POST"
			class="space-y-2"
			use:enhance={loadingEnhancer}
			enctype="multipart/form-data"
		>
			<slot name="form" />
		</form>
	</svelte:fragment>
</FormBasePage>
