FROM node:18-alpine as builder

ARG OPENAI_API_KEY

WORKDIR /app
COPY . .

RUN npm ci && npm run build

FROM node:18-alpine

EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json

CMD ["node", "build/index.js"]
