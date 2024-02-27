export interface Prompts {
	system: { [key: string]: string };
	user: { [key: string]: string };
}

export interface Message {
	role: 'user' | 'system' | 'assistant';
	content: string;
	timestamp: string;
}

export type whisperLanguagesTypes =
	| 'af'
	| 'ar'
	| 'hy'
	| 'az'
	| 'be'
	| 'bs'
	| 'bg'
	| 'ca'
	| 'zh'
	| 'hr'
	| 'cs'
	| 'da'
	| 'nl'
	| 'en'
	| 'et'
	| 'fi'
	| 'fr'
	| 'gl'
	| 'de'
	| 'el'
	| 'he'
	| 'hi'
	| 'hu'
	| 'is'
	| 'id'
	| 'it'
	| 'ja'
	| 'kn'
	| 'kk'
	| 'ko'
	| 'lv'
	| 'lt'
	| 'mk'
	| 'ms'
	| 'mr'
	| 'mi'
	| 'ne'
	| 'no'
	| 'fa'
	| 'pl'
	| 'pt'
	| 'ro'
	| 'ru'
	| 'sr'
	| 'sk'
	| 'sl'
	| 'es'
	| 'sw'
	| 'sv'
	| 'tl'
	| 'ta'
	| 'th'
	| 'tr'
	| 'uk'
	| 'ur'
	| 'vi'
	| 'cy';
