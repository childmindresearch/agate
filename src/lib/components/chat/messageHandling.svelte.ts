import type { modelTags } from './constants';

const BASE_CHARACTER_DELAY = 50;
const DELAY_EXPONENT = 5;

export type Message = {
	role: 'user' | 'system' | 'assistant';
	content: string;
	timestamp: string;
};

export type chatOptions = {
	id?: string;
	systemPrompt?: string;
};

export class Chat {
	readonly id: string;
	readonly fileSeparator: string = '\n\n -- File Follows -- \n\n';
	public title: string = $state('');
	public messages: Message[] = $state([]);
	private _last_modified: Date;

	get last_modified() {
		return this._last_modified;
	}

	constructor(options: chatOptions) {
		if (Number(options.id === undefined) + Number(options.systemPrompt === undefined) !== 1) {
			throw 'Options must contain only id or system prompt.';
		}

		if (options.systemPrompt) {
			this.id = 'agate-chat-' + this.generateUuidV4();
			this.messages = [
				{
					role: 'system',
					content: options.systemPrompt,
					timestamp: new Date().toLocaleTimeString()
				}
			];
			this.title = new Date().toLocaleDateString();
			this._last_modified = new Date();
		} else {
			if (!options.id) throw 'options.id not defined.';
			const stored = localStorage.getItem(options.id);
			if (!stored) throw 'Chat not found.';
			const data = JSON.parse(stored);
			this.id = data.id;
			this.messages = data.messages;
			this.title = data.title;
			this._last_modified = new Date(data._last_modified);
		}
	}

	public async addMessage(role: 'assistant' | 'user', content: string, files: File[] = []) {
		let fileText = '';
		if (files.length > 0) {
			const responses = files.map(async (file) => {
				const formData = new FormData();
				formData.append('file', file);
				const response = await fetch('/api/document-intelligence', {
					method: 'POST',
					body: formData
				});
				return await response.text();
			});
			fileText =
				this.fileSeparator +
				(await Promise.all(responses).then((texts) => texts.join(this.fileSeparator)));
		}

		this.messages.push({
			role,
			content: content + fileText,
			timestamp: new Date().toLocaleTimeString()
		});
		this._last_modified = new Date();
	}

	public async respond(model: modelTags) {
		const endpoint = model.startsWith('anthropic') ? '/api/claude/stream' : '/api/gpt';
		await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({ messages: this.messages, model })
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok.');
				}
				const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
				if (!reader) return;
				const stream = await readMessage(reader);
				await this.addMessageStream('assistant', stream);
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
			});
		if (this.hasDefaultTitle()) {
			await this.createTitle();
		}
		this.save();
	}

	public async addMessageStream(role: 'assistant' | 'user', stream: ReadableStream<string>) {
		this.messages.push({ role, content: '', timestamp: new Date().toLocaleTimeString() });
		const thisRef = this; // eslint-disable-line @typescript-eslint/no-this-alias
		const index = this.messages.length - 1;
		await stream.pipeTo(
			new WritableStream({
				write(chunk) {
					thisRef.messages[index].content += chunk;
				}
			})
		);
	}

	public save() {
		localStorage.setItem(this.id, this.serialize());
	}

	public delete() {
		localStorage.removeItem(this.id);
	}

	private hasDefaultTitle(): boolean {
		const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
		return datePattern.test(this.title);
	}

	private async createTitle() {
		const endpoint = '/api/claude/single';
		const title_messages: Message[] = [
			...this.messages,
			{
				role: 'user',
				content:
					'Please write a title for this chat, use at most 30 characters. Respond with nothing but the title.',

				timestamp: new Date().toLocaleTimeString()
			}
		];
		this.title = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify({
				messages: title_messages,
				model: 'anthropic.claude-3-5-sonnet-20240620-v1:0'
			})
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error('Title response was not ok.');
			}
			return await response.text();
		});
	}

	private generateUuidV4() {
		let cryptoObj;
		if (typeof window !== 'undefined' && window.crypto) {
			cryptoObj = window.crypto;
		} else {
			cryptoObj = require('crypto').webcrypto; // eslint-disable-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
		}

		const buffer = new Uint8Array(16);
		cryptoObj.getRandomValues(buffer);

		buffer[6] = (buffer[6] & 0x0f) | 0x40;
		buffer[8] = (buffer[8] & 0x3f) | 0x80;

		const hex = Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}

	private serialize() {
		return JSON.stringify({
			id: this.id,
			title: this.title,
			messages: this.messages,
			_last_modified: this._last_modified
		});
	}
}

class MessageQueue {
	public queue: string[] = [];
	public closed: boolean = false;

	public push(value: string) {
		this.queue.push(value);
	}

	public shift() {
		return this.queue.shift();
	}

	public get length() {
		return this.queue.length;
	}
}

async function fillBuffer(reader: ReadableStreamDefaultReader<string>, buffer: MessageQueue) {
	while (!buffer.closed) {
		const { done, value } = await reader.read();
		if (done) {
			buffer.closed = true;
			return;
		}
		const chunks = value.split('\n\n');
		for (const chunk of chunks) {
			if (!chunk) continue;
			const item = JSON.parse(chunk);
			if (!item?.data?.content) continue;
			buffer.push(item.data.content);
		}
	}
}

async function consumeBuffer(buffer: MessageQueue) {
	while (buffer.length === 0 && !buffer.closed) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	return buffer.shift();
}

export async function readMessage(
	reader: ReadableStreamDefaultReader<string>
): Promise<ReadableStream<string>> {
	const queue = new MessageQueue();
	fillBuffer(reader, queue);
	const stream = new ReadableStream({
		async start(controller) {
			while (queue.length > 0 || !queue.closed) {
				const value = await consumeBuffer(queue);
				if (!value) continue;

				if (queue.closed) {
					controller.enqueue(value);
					while (queue.length > 0) {
						controller.enqueue(queue.shift()!);
					}
				} else {
					console.log(queue.length);
					const delay = BASE_CHARACTER_DELAY / (queue.length + 1) ** DELAY_EXPONENT;
					for (const char of value) {
						controller.enqueue(char);
						await new Promise((resolve) => setTimeout(resolve, delay));
					}
				}
			}
			controller.close();
		},
		cancel(controller) {
			queue.closed = true;
			controller.close();
		}
	});
	return stream;
}
