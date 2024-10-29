export type modelNames =
	| 'GPT-4o'
	| 'Claude 3 Opus'
	| 'Claude 3.5 Sonnet V1'
	| 'Claude 3.5 Sonnet V2';
export type modelTags =
	| 'gpt-4o'
	| 'anthropic.claude-3-opus-20240229-v1:0'
	| 'anthropic.claude-3-5-sonnet-20240620-v1:0'
	| 'anthropic.claude-3-5-sonnet-20241022-v2:0';

export const LlmModels: { name: modelNames; tag: modelTags }[] = [
	{
		name: 'GPT-4o',
		tag: 'gpt-4o'
	},
	{
		name: 'Claude 3 Opus',
		tag: 'anthropic.claude-3-opus-20240229-v1:0'
	},
	{
		name: 'Claude 3.5 Sonnet V1',
		tag: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
	},
	{
		name: 'Claude 3.5 Sonnet V2',
		tag: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
	}
];
