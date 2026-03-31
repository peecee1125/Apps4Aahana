# syntax=docker/dockerfile:1
# Builder always runs on the native CI runner (amd64) — avoids QEMU Node.js crashes
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Final image is built for the target platform (amd64 + arm64)
# nginx:alpine is a tiny C binary — QEMU handles this fine
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
