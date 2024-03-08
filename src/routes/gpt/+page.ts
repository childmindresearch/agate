export async function load({ fetch }): Promise<{ user: string }> {
	return await fetch('/api/user')
		.then(async (response) => {
			return await response.json();
		})
		.catch(() => {
			return {
				user: 'User not found.'
			};
		});
}
