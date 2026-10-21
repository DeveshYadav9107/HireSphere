# ============================================================
# HireSphere Multi-Stage Production Dockerfile
# Builds client frontend + Express server in a single image
# ============================================================

# Step 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Step 2: Build Server & Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy server source
COPY server/ ./

# Copy built frontend assets from Step 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
