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
	public title: string;
	public messages: Message[];
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

	public addMessage(role: 'assistant' | 'user', content: string) {
		this.messages.push({ role, content, timestamp: new Date().toLocaleTimeString() });
		this._last_modified = new Date();
	}

	public async addMessageStream(
		role: 'assistant' | 'user',
		stream: ReadableStream<string>,
		onWrite: () => void,
		onClose: () => void
	) {
		this.messages.push({ role, content: '', timestamp: new Date().toLocaleTimeString() });
		const thisRef = this;
		const index = this.messages.length - 1;
		await stream.pipeTo(
			new WritableStream({
				write(chunk) {
					thisRef.messages[index].content += chunk;
					onWrite();
				},
				close() {
					onClose();
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

	private generateUuidV4() {
		let cryptoObj;
		if (typeof window !== 'undefined' && window.crypto) {
			cryptoObj = window.crypto;
		} else {
			cryptoObj = require('crypto').webcrypto;
		}

		const buffer = new Uint8Array(16);
		cryptoObj.getRandomValues(buffer);

		buffer[6] = (buffer[6] & 0x0f) | 0x40;
		buffer[8] = (buffer[8] & 0x3f) | 0x80;

		const hex = Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}

	private serialize() {
		const serialized: { [key: string]: any } = {};
		for (const [key, value] of Object.entries(this)) {
			if (typeof value !== 'function') {
				serialized[key] = value;
			}
		}
		return JSON.stringify(serialized);
	}
}
