# ---------- Builder stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Bring over the built assets and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app will listen on
EXPOSE 80

# Run the built server (adjust if your entry point differs)
CMD ["node", "dist/server.js"]
