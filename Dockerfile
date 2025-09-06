# ---------- Builder: build the Vite PWA and compile the server ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend/server dependencies in the tools workspace
COPY tools/package*.json /app/tools/
RUN cd /app/tools && npm ci

# Copy sources and build
COPY tools /app/tools
RUN set -eux; \
    cd /app/tools; \
    npm run build; \
    npm run build:server; \
    npm prune --omit=dev

# ---------- Runner: Node-only server ----------
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

ENV NODE_ENV=production
WORKDIR /app

# Create data directory with proper permissions
RUN mkdir -p /data && chown nextjs:nodejs /data

# Copy runtime deps and server
COPY --from=builder --chown=nextjs:nodejs /app/tools/node_modules /app/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/tools/server/dist/ /app/server/

# Copy static site payload
COPY --chown=nextjs:nodejs index.html /app/site/index.html
COPY --chown=nextjs:nodejs assets/ /app/site/assets/
COPY --from=builder --chown=nextjs:nodejs /app/tools/dist/ /app/site/tools/

# Environment for server
ENV SITE_DIR=/app/site
ENV SETTINGS_PATH=/data/settings.json
ENV PORT=80

# Switch to non-root user
USER nextjs

EXPOSE 80

# Add healthcheck for monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "/app/server/index.js"]
