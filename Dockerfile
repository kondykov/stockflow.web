FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx nuxi generate

FROM alpine:latest
WORKDIR /var/www/frontend
COPY --from=builder /app/.output/public .
CMD ["sh"]
