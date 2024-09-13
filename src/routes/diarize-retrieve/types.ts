export type TranscriptionResponse = {
	values: Transcription[];
};

export type Transcription = {
	self: string;
	model: {
		self: string;
	};
	links: {
		files: string;
	};
	properties: {
		diarizationEnabled: boolean;
		wordLevelTimestampsEnabled: boolean;
		displayFormWordLevelTimestampsEnabled: boolean;
		channels: number[];
		punctuationMode: string;
		profanityFilterMode: string;
		error?: {
			code: string;
			message: string;
		};
		email: string;
	};
	lastActionDateTime: string;
	status: string;
	createdDateTime: string;
	locale: string;
	displayName: string;
	email: string;
};
