import fs from 'fs';
import yaml from 'js-yaml';

export function load() {
	const promptFile = 'static/prompts.yaml';
	const fileContents = fs.readFileSync(promptFile, 'utf8');
	const data = yaml.load(fileContents) as Prompts;
	return { systemPrompts: data };
}
