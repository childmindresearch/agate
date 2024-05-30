import hljs from 'highlight.js';
import showdown from 'showdown';

showdown.extension('highlight', function () {
	return [
		{
			type: 'output',
			filter: function (text, converter, options) {
				var left = '<pre><code\\b[^>]*>',
					right = '</code></pre>',
					flags = 'g';
				var replacement = function (
					wholeMatch: string,
					match: string,
					left: string,
					right: string
				) {
					var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
					left = left.slice(0, 18) + 'hljs ' + left.slice(18);
					if (lang && hljs.getLanguage(lang)) {
						return left + hljs.highlight(lang, match).value + right;
					} else {
						return left + hljs.highlightAuto(match).value + right;
					}
				};
				return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
			}
		}
	];
});

export function markdownToSkeletonHtml(markdown: string): string {
	const converter = new showdown.Converter({ tables: true, extensions: ['highlight'] });
	const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

	let html = converter.makeHtml(markdown);
	tags.forEach((tag) => {
		const tagRegex = new RegExp(`<${tag}`, 'g');
		html = html.replace(tagRegex, `<${tag} class="${tag}"`);
	});

	html = html.replace(
		/<table/g,
		'<div class="table-container"><table class="table table-compact table-hover"'
	);
	html = html.replace(/<\/table>/g, '</table></div>');
	const codeBlocks = html.match(/<pre><code>[\s\S]*?<\/code><\/pre>/g) || [];
	codeBlocks.forEach((block) => {
		const code = block.replace(/<pre><code>/, '').replace(/<\/code><\/pre>/, '');
		const highlighted = hljs.highlightAuto(code).value;
		html = html.replace(block, `<pre><code>${highlighted}</code></pre>`);
	});

	// Remove \n at the end of a block.
	html = html.replace(/\n<\//g, '</');

	return html;
}
