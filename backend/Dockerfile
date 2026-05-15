FROM node:20-alpine

WORKDIR /app

# Instala dependencias del backend
COPY package*.json ./
RUN pnpm install

# Copia el código fuente
COPY . .

# Genera el cliente de Prisma con el schema
RUN pnmp prisma generate

# Compila TypeScript a JavaScript
RUN npm run build

EXPOSE 3000

# Al iniciar: corre migraciones + seed + servidor
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm prisma db seed && node dist/main"]
