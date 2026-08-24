FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]