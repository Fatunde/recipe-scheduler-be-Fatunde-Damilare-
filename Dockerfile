FROM node:18-alpine AS base


FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force


FROM base AS build-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM build-deps AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs backend

COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules

RUN mkdir -p /app/data && chown backend:nodejs /app/data

USER backend

EXPOSE 6000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:6000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["node", "dist/app.js"]

LABEL org.opencontainers.image.title="Event Reminder Backend"
LABEL org.opencontainers.image.description="Node.js backend for event reminders with push notifications"
LABEL org.opencontainers.image.vendor="Event Reminder App"