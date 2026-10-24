FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=8080 \
    TESSERACT_CACHE_PATH=/tmp/tesseract.js-cache

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY index.js server.js ./

USER node
EXPOSE 8080

CMD ["node", "server.js"]
