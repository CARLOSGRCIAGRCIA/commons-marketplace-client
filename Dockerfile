FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Full install (dev deps included): next build requires tailwindcss,
# @tailwindcss/postcss and typescript, which live in devDependencies.
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
# `-` (not `:-`): an explicitly EMPTY value must survive - empty means
# same-origin relative calls, routed by the client reverse proxy. A
# backend:5000-style default here would get BAKED into the browser
# bundle, where no docker hostname can ever resolve.
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL-}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL-}

ARG INTERNAL_API_ORIGIN
# Default targets the API blue-green proxy on commons-net; local compose
# overrides it to http://backend:5000.
ENV INTERNAL_API_ORIGIN=${INTERNAL_API_ORIGIN:-http://commons-proxy:80}

RUN npm run build

# Runtime-only dependency tree, separate from the build tree so the
# runner never carries devDependencies around.
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
