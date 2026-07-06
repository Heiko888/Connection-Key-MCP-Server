FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY index.js ./
# Persistenter Zustand (lastUid) liegt unter /data (Named Volume via docker-compose)
VOLUME ["/data"]
CMD ["node", "index.js"]
