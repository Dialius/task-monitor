# ========================
# Stage 1: Build TypeScript
# ========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better Docker cache)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# ========================
# Stage 2: Production
# ========================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy scripts (needed for deploy-commands etc.)
COPY scripts/ ./scripts/

# Create auth_info directory (fallback for file-based sessions)
RUN mkdir -p auth_info logs

# Set environment
ENV NODE_ENV=production

# Expose API port (if API_ENABLED=true)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));" || exit 0

# Start the bot
CMD ["node", "dist/index.js"]
