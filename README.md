# Agate

Agate (working name) is a web interface for various OpenAI tools. It is built using Sveltekit and Typescript.
Running Agate requires that an OpenAI API key is set in the environment variable `OPENAI_API_KEY`.

## Installation

To install Agate, clone the repository and install the dependencies using npm:

```bash
npm install
```

## Developing

The development server requires that an OpenAI API key is set in the environment variable. This need not
be a real key (though any request to OpenAI will fail, and failure handling is not done elegantly yet).

```bash
export OPENAI_API_KEY=your-key
npm run dev
```
