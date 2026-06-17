FROM node:20-alpine

WORKDIR /app

# ffmpeg/ffprobe (Reading→Video, v8 Phase 2) + Fonts für resvg/SVG-Text-Rendering
RUN apk add --no-cache ffmpeg font-dejavu fontconfig && fc-cache -f

# 1. Package-Dateien zuerst (sauberer Cache)
COPY package.json package-lock.json ./

# 2. ALLE Dependencies installieren (inkl. bullmq)
RUN npm install

# 3. Restlichen Code kopieren
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]

