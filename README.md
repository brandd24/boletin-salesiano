==========================================
BOLETÍN SALESIANO – BACKEND (STRAPI)
==========================================

Este proyecto corresponde al BACKEND oficial del sistema del Boletín Salesiano.
Está construido con Strapi v4 y utiliza MySQL como base de datos.

Su función principal es:
- Gestionar boletines
- CRUD de noticias, artículos y galerías
- Control de usuarios y roles
- Proveer una API REST para el frontend
- Administrar archivos y recursos multimedia

------------------------------------------
REQUISITOS
------------------------------------------
1. Node.js v18 o superior
2. NPM o Yarn
3. MySQL 8.x
4. (Opcional) Docker + Docker Compose

------------------------------------------
INSTALACIÓN (SIN DOCKER)
------------------------------------------
1. Abrir la terminal en:
   C:/BS_Migracion/boletin-backend

2. Instalar dependencias:
   npm install

3. Crear archivo de entorno:
   .env

4. Configurar base de datos en .env:
   HOST=localhost
   PORT=3306
   DATABASE_NAME=boletin_salesiano
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=tu_clave

5. Iniciar Strapi:
   npm run develop

Panel administrativo disponible en:
   http://localhost:1337/admin

------------------------------------------
INSTALACIÓN CON DOCKER COMPOSE
------------------------------------------
1. Colocar docker-compose.yml en la raíz del backend.
2. Ejecutar:
   docker compose up -d

Esto inicia:
- MySQL
- Strapi conectado a MySQL

------------------------------------------
ESTRUCTURA DEL PROYECTO
------------------------------------------
/src
  /api        - Colecciones y controladores
  /extensions - Configuraciones adicionales
/config
  database.js - Configuración MySQL
  server.js   - Configuración de Strapi

------------------------------------------
USUARIOS Y ROLES
------------------------------------------
Strapi incluye:
- ADMIN (maneja todo)
- AUTENTICATED
- PUBLIC

IMPORTANTE: Configurar permisos en:
   Settings → Roles & Permissions

------------------------------------------
MEDIA LIBRARY
------------------------------------------
Los archivos se guardan en:
   /public/uploads

------------------------------------------
ENDPOINTS PRINCIPALES
------------------------------------------
Los endpoints dependen de las colecciones:
   /api/boletines
   /api/articulos
   /api/galerias
   /api/categorias

==========================================
BOLETÍN SALESIANO – FRONTEND
==========================================

Este proyecto corresponde al FRONTEND oficial del sistema del Boletín Salesiano.
Fue desarrollado con Vite + Vue 3 y consume la API generada por el backend (Strapi).

Su función principal es mostrar:
- Boletines mensuales
- Noticias y artículos
- Carrusel de imágenes
- Galerías
- Información institucional
- Contenido dinámico manejado desde el panel administrativo

------------------------------------------
REQUISITOS
------------------------------------------
1. Node.js v18 o superior
2. NPM o Yarn
3. Backend Strapi en funcionamiento

------------------------------------------
INSTALACIÓN
------------------------------------------
1. Abrir una terminal en la carpeta:
   C:/BS_Migracion/boletin-frontend

2. Instalar dependencias:
   npm install

3. Crear archivo de entorno (si no existe):
   .env

4. En .env definir la URL del backend:
   VITE_API_URL=http://localhost:1337

------------------------------------------
EJECUTAR EL PROYECTO
------------------------------------------
Iniciar el servidor de desarrollo:
   npm run dev

Abrir el navegador en:
   http://localhost:5173/

------------------------------------------
BUILD PARA PRODUCCIÓN
------------------------------------------
   npm run build

Los archivos finales estarán en: /dist

------------------------------------------
ESTRUCTURA DEL PROYECTO
------------------------------------------
src/
  assets/       - Imágenes y recursos
  components/   - Componentes reutilizables
  pages/        - Páginas principales
  router/       - Rutas del sitio
  services/     - Peticiones a la API

------------------------------------------
NOTAS
------------------------------------------
- Este frontend NO incluye contenido estático.
- Todo se obtiene desde el Strapi del Boletín Salesiano.
- Si la API no funciona, el frontend no mostrará información.



