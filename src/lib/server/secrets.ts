// @ts-expect-error because vite will throw an error if env variable is not defined.
export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY;
