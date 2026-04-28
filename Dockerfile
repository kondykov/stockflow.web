FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=1536" npx nuxi generate

FROM alpine:latest
RUN mkdir -p /var/www/frontend
COPY --from=builder /app/.output/public/ /var/www/frontend/
RUN ls -la /var/www/frontend
