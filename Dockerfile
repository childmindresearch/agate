FROM node:22-alpine as builder

WORKDIR /app
COPY . .

RUN npm ci && npm run build

FROM node:22-alpine

ENV OPENAI_API_KEY=overwrite-me
ENV AZURE_DOCUMENT_INTELlIGENCE_KEY=overwrite-me
ENV AZURE_DOCUMENT_INTELlIGENCE_ENDPOINT=overwrite-me
# Maximum request body size of 512MB - required for large audio files. 
ENV BODY_SIZE_LIMIT=512000000

EXPOSE 3000
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json

COPY --from=mwader/static-ffmpeg:6.1.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:6.1.1 /ffprobe /usr/local/bin/

RUN apk add --no-cache pandoc

CMD ["node", "build/index.js"]
