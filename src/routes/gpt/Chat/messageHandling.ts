const BASE_CHARACTER_DELAY = 100;
const DELAY_EXPONENT = 1.5;

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
	if (buffer.closed) return;

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
	fillBuffer(reader, buffer);
}

async function consumeBuffer(buffer: MessageQueue) {
	if (buffer.length === 0 && !buffer.closed) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return consumeBuffer(buffer);
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
				const delay = queue.closed
					? 0
					: BASE_CHARACTER_DELAY / (queue.length + 1) ** DELAY_EXPONENT;
				for (const char of value) {
					controller.enqueue(char);
					await new Promise((resolve) => setTimeout(resolve, delay));
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

export async function uploadFileToText() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.pdf, .jpg, .jpeg, .png, .bmp, .tiff, .heif, .docx, .xlsx, .pptx, .html, .txt';
	input.onchange = async (event) => {
		const files = (event.target as HTMLInputElement).files;
		if (!files) return;
		if (files[0].name.split('.').slice(-1)[0] === 'txt') {
			return { text: await files[0].text() };
		}
		const file = files[0];
		const formData = new FormData();
		formData.append('file', file);
		const response = await fetch('/api/document-intelligence', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			return { text: await response.text() };
		} else {
			return { error: response.statusText };
		}
	};
	input.click();
}
