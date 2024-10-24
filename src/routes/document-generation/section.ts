type SectionOptions = {
	title: string;
	instructions: string;
	files?: FileList | undefined;
	n_required_files?: number;
	children?: Section[];
};

export class Section {
	public title: string;
	public instructions: string;
	public files: FileList | undefined;
	public children: Section[];
	public n_required_files: number;

	constructor({
		title,
		instructions,
		files = undefined,
		children = [],
		n_required_files = 0
	}: SectionOptions) {
		if (n_required_files < 0 || !Number.isInteger(n_required_files)) {
			throw 'n_required_files must be a non-negative integer.';
		}
		this.title = title;
		this.instructions = instructions;
		this.files = files;
		this.children = children;
		this.n_required_files = n_required_files;
	}

	public getPrompt(): string {
		return JSON.stringify(this.getPromptObj());
	}

	private getPromptObj(): object {
		return {
			title: this.title,
			instructions: this.instructions,
			files: this.files
				? Array.from(this.files).map((file) => {
						return {
							fileName: file.name,
							fileContent: file.text()
						};
					})
				: undefined,
			children: this.children.map((child) => {
				return child.getPromptObj();
			})
		};
	}

	public clone() {
		return new Section({
			title: this.title,
			instructions: this.instructions,
			files: this.files,
			children: this.children.map((child): Section => {
				return child.clone();
			}),
			n_required_files: this.n_required_files
		});
	}
}
