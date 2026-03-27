FROM node:18-alpine

WORKDIR /app

# 1. Package-Dateien zuerst (sauberer Cache)
COPY package.json package-lock.json ./

# 2. ALLE Dependencies installieren (inkl. bullmq)
RUN npm install

# 3. Restlichen Code kopieren
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]

