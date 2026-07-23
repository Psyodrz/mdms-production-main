# ==========================================
# 1. Base Image
# ==========================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ==========================================
# 2. Builder Stage
# ==========================================
FROM base AS builder
WORKDIR /app

# Copy workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy packages, prisma, and API
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY apps/api/ ./apps/api/

# Install all dependencies (including dev)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN npx prisma generate

# Build the API
RUN pnpm --filter @mdms/api build

# Prune dev dependencies for production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store CI=true pnpm config set confirmModulesPurge false && CI=true pnpm install --prod --no-frozen-lockfile

# ==========================================
# 3. Production Image
# ==========================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
