FROM node:20-alpine

WORKDIR /app

# Instala dependencias del frontend
COPY package*.json ./
RUN pnpm install

# Copia el código fuente
COPY . .

# Build de producción de Next.js
RUN pnpm run build

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "start"]
