# ============================================================
# Backend Dockerfile — Multi-stage build with Bun
# ============================================================

# Stage 1: Install dependencies
FROM oven/bun:1.1 AS deps
WORKDIR /app

# Copy workspace manifests first (for layer caching)
COPY package.json bun.lockb* ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN bun install --frozen-lockfile

# Stage 2: Build
FROM oven/bun:1.1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
# COPY --from=deps /app/backend/node_modules ./backend/node_modules

COPY packages/shared ./packages/shared
COPY backend ./backend

WORKDIR /app/backend
# RUN bun build src/index.ts --outdir dist --target bun
RUN bun build src/index.ts \
  src/infrastructure/database/migrate.ts \
  src/infrastructure/database/seed.ts \
  --outdir dist --target bun

# Stage 3: Production runtime
FROM oven/bun:1.1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy what's needed at runtime
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/drizzle ./drizzle

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=deps /app/package.json ./

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 3000

CMD ["bun", "dist/index.js"]
