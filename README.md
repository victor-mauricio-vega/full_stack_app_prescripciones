# 💊 MediPrescribe — Sistema de Prescripciones Médicas

Sistema MVP de gestión de prescripciones médicas con 3 roles: **Médico**, **Paciente** y **Admin**.

## 🌐 Demo

| Servicio  | URL                                      |
|-----------|------------------------------------------|
| Frontend  | http://localhost:3001                    |
| API       | http://localhost:3000                    |
| Swagger   | http://localhost:3000/docs               |

---

## 🔐 Cuentas de prueba

| Rol      | Email               | Contraseña  |
|----------|---------------------|-------------|
| Admin    | admin@test.com      | admin123    |
| Médico   | dr@test.com         | dr123       |
| Paciente | patient@test.com    | patient123  |


## 🚀 Levantar con Docker (recomendado)

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

### Pasos

**1. Clona el repositorio**
```bash
git clone https://github.com/victor-mauricio-vega/full_stack_app_prescripciones.git
cd mediprescribe
```

**2. Crea el archivo de variables de entorno**
```bash
cp .env.example .env
```

> Puedes dejar los valores por defecto para desarrollo local.

**3. Levanta todos los servicios**
```bash
docker compose up --build
```

Esto hace automáticamente:
- ✅ Instala dependencias del backend
- ✅ Instala dependencias del frontend
- ✅ Genera el cliente de Prisma (`prisma generate`)
- ✅ Corre las migraciones (`prisma migrate deploy`)
- ✅ Ejecuta el seed con datos de prueba (`prisma db seed`)
- ✅ Levanta PostgreSQL con volumen persistente
- ✅ Levanta el backend en el puerto 3000
- ✅ Levanta el frontend en el puerto 3001

**4. Abre la app**

Navega a [http://localhost:3001](http://localhost:3001) e inicia sesión con cualquiera de las cuentas de prueba.

### Comandos útiles

```bash
# Levantar en background
docker compose up -d --build

# Ver logs del backend
docker compose logs -f backend

# Ver logs del frontend
docker compose logs -f frontend

# Ver logs de la base de datos
docker compose logs -f postgres

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (borra todos los datos)
docker compose down -v

# Reconstruir solo el backend
docker compose up --build backend

# Ejecutar comandos en el backend
docker compose exec backend npx prisma studio
```

---

## 🛠 Setup local (sin Docker)

### Requisitos
- Node.js 18+
- PostgreSQL 14+ instalado y corriendo

### Backend

```bash
cd backend
pnpm install

# Crea el archivo de variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# Crea la base de datos
psql -U postgres -c "CREATE DATABASE prescriptions_db;"

# Genera el cliente de Prisma
pnpm prisma generate

# Corre las migraciones
pnpm prisma migrate dev

# Carga los datos de prueba
pnmp prisma db seed

# Inicia el servidor de desarrollo
pnpm run dev
# API disponible en http://localhost:3000
```

### Frontend

```bash
cd frontend
pnpm install

# Crea el archivo de variables de entorno
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api" > .env.local

# Inicia el servidor de desarrollo
pnpm run dev
# App disponible en http://localhost:3001


## 🗄 Base de datos

### Volumen persistente

Los datos de PostgreSQL se guardan en el volumen Docker `postgres_data`. Esto significa que aunque detengas y vuelvas a levantar los contenedores, los datos persisten.

```bash
# Ver volúmenes de Docker
docker volume ls

# Inspeccionar el volumen
docker volume inspect mediprescribe_postgres_data
```

### Migraciones

```bash
# Crear una nueva migración (desarrollo)
cd backend
pnpm prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
pnpm prisma migrate deploy

# Ver el estado de las migraciones
pnpm prisma migrate status

# Abrir Prisma Studio (UI visual de la DB)
pnpm prisma studio
# O con Docker:
docker compose exec backend npx prisma studio
```

### Seed

```bash
# Recargar datos de prueba
cd backend
pnpm prisma db seed

# O con Docker:
docker compose exec backend npx prisma db seed
```

---

## 📡 API — Endpoints principales

### Autenticación

| Método | Ruta              | Descripción                    | Acceso  |
|--------|-------------------|--------------------------------|---------|
| POST   | /auth/login       | Login → accessToken + refreshToken | Público |
| POST   | /auth/refresh     | Renovar access token           | Público |
| GET    | /auth/profile     | Perfil del usuario autenticado | Todos   |

### Prescripciones

| Método | Ruta                        | Descripción                    | Rol            |
|--------|-----------------------------|--------------------------------|----------------|
| POST   | /prescriptions              | Crear prescripción con ítems   | Médico         |
| GET    | /prescriptions              | Listar prescripciones propias  | Médico, Admin  |
| GET    | /prescriptions/me           | Mis prescripciones             | Paciente       |
| GET    | /prescriptions/:id          | Detalle de prescripción        | Todos          |
| PUT    | /prescriptions/:id/consume  | Marcar como consumida          | Paciente       |
| GET    | /prescriptions/:id/pdf      | Descargar PDF                  | Todos          |


### Pacientes

| Método | Ruta       | Descripción             | Rol            |
|--------|------------|-------------------------|----------------|
| GET    | /patients  | Listado de pacientes    | Médico, Admin  |

### Admin

| Método | Ruta                    | Descripción                       | Rol   |
|--------|-------------------------|-----------------------------------|-------|
| GET    | /admin/metrics          | Métricas del sistema              | Admin |
| GET    | /admin/prescriptions    | Todas las prescripciones          | Admin |
| GET    | /admin/audit            | Historial de auditoría            | Admin |
| GET    | /admin/audit/:entityId  | Auditoría de una prescripción     | Admin |

> Documentación interactiva completa en [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🏗 Decisiones técnicas

### Autenticación
JWT de acceso (15 min) + refresh token (7 días). El refresh rota en cada uso generando nuevos tokens. Los tokens se almacenan en `localStorage` vía Zustand persist en el frontend.

### RBAC
Guards de NestJS (`RolesGuard`) con el decorador `@Roles()`. Cada endpoint declara explícitamente qué roles tienen acceso. El ownership se verifica a nivel de servicio — un médico solo ve sus prescripciones y un paciente solo ve las suyas.

### PDF
Generado en el backend con `pdfkit`. El endpoint devuelve un stream con `Content-Type: application/pdf`. Incluye QR code generado con la librería `qrcode` que apunta a la URL del paciente.

### Paginación
Offset/limit con respuesta que incluye `meta: { total, page, limit, totalPages }`. Los filtros se pasan como query params.


### Audit logs
Tabla `AuditLog` que registra cada acción relevante (crear, consumir) con el usuario, rol, entidad afectada y metadata.


## 🔒 Variables de entorno

### Backend (`backend/.env`)

| Variable             | Descripción                          | Default                    |
|----------------------|--------------------------------------|----------------------------|
| `DATABASE_URL`       | URL de conexión a PostgreSQL         | —                          |
| `JWT_ACCESS_SECRET`  | Secret para firmar access tokens     | —                          |
| `JWT_REFRESH_SECRET` | Secret para firmar refresh tokens    | —                          |
| `JWT_ACCESS_TTL`     | Duración del access token            | `900s`                     |
| `JWT_REFRESH_TTL`    | Duración del refresh token           | `7d`                       |
| `APP_ORIGIN`         | URL del frontend (CORS)              | `http://localhost:3001`    |
| `PORT`               | Puerto del servidor                  | `3000`                     |

### Frontend (`frontend/.env.local`)

| Variable                    | Descripción           | Default                        |
|-----------------------------|-----------------------|--------------------------------|
| `NEXT_PUBLIC_API_BASE_URL`  | URL base de la API    | `http://localhost:3000/api`    |
