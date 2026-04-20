# ============================================================
# Frontend Dockerfile — Bun build → Nginx static serve
# ============================================================

# Stage 1: Install deps
FROM oven/bun:1.1 AS deps
WORKDIR /app

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
# COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

COPY packages/shared ./packages/shared
COPY frontend ./frontend

WORKDIR /app/frontend

# VITE_API_URL will be injected at runtime via Nginx proxy
# so we build without it — API calls go to /api which Nginx proxies
RUN bun run build

# Stage 3: Serve with Nginx
FROM nginx:1.25-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Our custom Nginx config
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
