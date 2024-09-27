<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import FormBasePage from './FormBasePage.svelte';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children,
		hasBusinessAssociateAgreemment = false,
		isLoading = $bindable(false),
		enhancer = () => {
			return async ({ update }) => {
				await update();
			};
		}
	}: {
		title: string;
		description: string;
		children: Snippet;
		hasBusinessAssociateAgreemment?: boolean;
		isLoading?: boolean;
		enhancer?: SubmitFunction;
	} = $props();

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

<FormBasePage {title} {description} {isLoading} {hasBusinessAssociateAgreemment}>
	<form method="POST" class="space-y-2" use:enhance={loadingEnhancer} enctype="multipart/form-data">
		{@render children()}
	</form>
</FormBasePage>
