const sveltePreprocess = require('svelte-preprocess');

module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {}
	},
	module: {
		rules: [
			{
        test: /\.(html|svelte)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: sveltePreprocess({
              postcss: true
            })
          }
        }
      }
	]
	}
};
