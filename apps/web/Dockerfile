# ==========================================
# 1. Base Image
# ==========================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ==========================================
# 2. Dependencies & Builder Stage
# ==========================================
FROM base AS builder
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy packages and Web app
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

# Set environment variables for build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Build the Next.js app
RUN pnpm --filter web build

# ==========================================
# 3. Production Runner Stage
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
