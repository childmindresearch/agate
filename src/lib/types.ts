export interface Prompts {
	system: { [key: string]: string };
	user: { [key: string]: string };
}

export interface Message {
	role: 'user' | 'system' | 'assistant';
	content: string;
	timestamp: string;
}
