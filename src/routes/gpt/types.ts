interface Prompts {
	system: { [key: string]: string };
	user: { [key: string]: string };
}

interface Message {
	role: 'user' | 'system';
	content: string;
	timestamp: string;
}
