# ============================================
# BACKEND - NestJS (CPU Only - Sem GPU)
# ============================================
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache postgresql-client
RUN mkdir -p /home/node/.interviewed && chown -R node:node /home/node
COPY apps/backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=backend-builder /app/dist ./dist
RUN chown -R node:node /app
USER node
ENV NODE_ENV=production
ENV PORT=3000
ENV HOME=/home/node
EXPOSE 3000
COPY apps/backend/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]