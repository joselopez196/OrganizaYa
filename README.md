# OrganizaYa Backend API 🚀

Servidor API REST y servicio de sincronización en tiempo real para **OrganizaYa** (TaskFlow Hub).

## 📋 Características

- **Autenticación Segura**: Registro, inicio de sesión y validación de tokens con JWT y encriptación bcrypt.
- **Sincronización en la Nube**: Endpoints para sincronizar automáticamente el estado (tareas, proyectos, archivos, accesos y recordatorios) entre computadoras y celulares.
- **Base de Datos Flexible**: Compatible con **PostgreSQL**, **Supabase** y almacenamiento local automático en desarrollo (sin requerir base de datos externa obligatoria).
- **CRUD Completo**: Gestión directa de Tareas y Proyectos vía API.
- **Backups**: Endpoints para exportar e importar copias de seguridad JSON completas.
- **CORS Configurado**: Optimizado para admitir peticiones desde GitHub Pages (`https://joselopez196.github.io/OrganizaYa/`) y entornos locales.

---

## 🛠️ Instalación y Uso Local

### 1. Clonar e instalar dependencias

```bash
git checkout Backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura tus valores:
```env
PORT=4000
JWT_SECRET=tu_clave_secreta_aqui
DATABASE_URL=postgresql://usuario:password@localhost:5432/organizaya
ALLOWED_ORIGINS=https://joselopez196.github.io,http://localhost:3000
```
> *Nota*: Si dejas `DATABASE_URL` en blanco, el servidor funcionará automáticamente con almacenamiento local en archivo JSON en `data/local-db.json`.

### 3. Iniciar el servidor

```bash
# Modo desarrollo con recarga automática
npm run dev

# Modo producción
npm start
```

El servidor estará escuchando en `http://localhost:4000`.

---

## 🐳 Ejecución con Docker

Para levantar el servidor y una base de datos PostgreSQL con un solo comando:

```bash
docker compose up -d
```

---

## 📖 Endpoints Principales

### Salud
- `GET /api/health`: Estado del servidor y tiempo activo.

### Autenticación
- `POST /api/auth/register`: Registro de usuario (`email`, `password`, `name`).
- `POST /api/auth/login`: Inicio de sesión (`email`, `password`). Retorna `token`.
- `GET /api/auth/me`: Perfil del usuario autenticado (`Bearer <token>`).

### Sincronización
- `GET /api/sync`: Descarga el último estado guardado en la nube.
- `POST /api/sync`: Guarda o actualiza el estado (`state`).

### Tareas
- `GET /api/tasks`: Lista tareas (filtros: `?projectId=`, `?done=`, `?due=`).
- `POST /api/tasks`: Crea una tarea (`title`, `due`, `priority`, etc.).
- `PUT /api/tasks/:id`: Actualiza una tarea.
- `DELETE /api/tasks/:id`: Elimina una tarea.

### Proyectos
- `GET /api/projects`: Lista proyectos (filtro: `?archived=`).
- `POST /api/projects`: Crea un proyecto (`name`, `color`, `due`, `status`).
- `PUT /api/projects/:id`: Actualiza un proyecto.
- `DELETE /api/projects/:id`: Elimina un proyecto.

### Copias de Seguridad (Backup)
- `GET /api/backup/export`: Descarga copia de seguridad completa en JSON.
- `POST /api/backup/import`: Restaura una copia de seguridad en JSON.
