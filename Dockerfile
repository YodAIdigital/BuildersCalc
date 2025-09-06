# ---------- Builder: build the Vite PWA and compile the server ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend/server dependencies in the tools workspace
COPY tools/package*.json /app/tools/
RUN cd /app/tools && npm install

# Copy sources and build
COPY tools /app/tools
RUN set -eux; \
    cd /app/tools; \
    npm run build; \
    npm run build:server; \
    npm prune --omit=dev

# ---------- Runner: Node-only server ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy runtime deps and server
COPY --from=builder /app/tools/node_modules /app/node_modules
COPY --from=builder /app/tools/server/dist/ /app/server/

# Copy static site payload
COPY index.html /app/site/index.html
COPY assets/ /app/site/assets/
COPY --from=builder /app/tools/dist/ /app/site/tools/

# Environment for server
ENV SITE_DIR=/app/site
ENV SETTINGS_PATH=/data/settings.json
ENV PORT=80

EXPOSE 80
CMD ["node", "/app/server/index.js"]
