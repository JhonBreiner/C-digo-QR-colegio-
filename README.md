# 🚀 Guía de Instalación, Configuración y Publicación
## Sistema de Control de Asistencia QR & Gestión Escolar — SOFTWORKER
### Institución Educativa Técnica Francisco José de Caldas (Natagaima - Tolima)

---

## 📌 Tabla de Contenidos
1. [Requisitos Previos](#1-requisitos-previos)
2. [Instalación del Proyecto](#2-instalación-del-proyecto)
3. [Configuración de Variables de Entorno](#3-configuración-de-variables-de-entorno)
4. [Ejecución en Entorno de Desarrollo](#4-ejecución-en-entorno-de-desarrollo)
5. [Compilación y Construcción para Producción](#5-compilación-y-construcción-para-producción)
6. [Publicación y Despliegue](#6-publicación-y-despliegue)
   - [Opción A: Vercel](#opción-a-despliegue-en-vercel-recomendado)
   - [Opción B: Firebase Hosting](#opción-b-despliegue-en-firebase-hosting)
   - [Opción C: Cloud Run / Servidor Docker / VPS (Nginx)](#opción-c-despliegue-en-servidor-vps--nginx--docker)
7. [Configuración de Base de Datos y Permisos](#7-configuración-de-base-de-datos-y-permisos)
8. [Solución de Problemas Comunes](#8-solución-de-problemas-comunes)

---

## 1. Requisitos Previos

Asegúrate de tener instalado en tu máquina o servidor:

- **Node.js**: Versión `18.x`, `20.x` o superior ([Descargar Node.js](https://nodejs.org/))
- **NPM** (incluido con Node.js) o **Yarn** / **PNPM** / **Bun**
- **Git**: Para el control de versiones ([Descargar Git](https://git-scm.com/))
- **Navegador Web Moderno** (Google Chrome, Microsoft Edge, Safari o Firefox) con soporte para cámara web y protocolos HTTPS/localhost.

---

## 2. Instalación del Proyecto

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/softworker-asistencia-qr.git
   cd softworker-asistencia-qr
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```
   *(Si usas Yarn: `yarn install` | Si usas Bun: `bun install`)*

---

## 3. Configuración de Variables de Entorno

Copia el archivo de ejemplo `.env.example` para crear tu archivo local `.env`:

```bash
cp .env.example .env
```

Abre `.env` en tu editor de código y completa los parámetros según tus necesidades:

```env
# ----------------------------------------------------
# CONFIGURACIÓN GENERAL
# ----------------------------------------------------
APP_URL=http://localhost:3000

# ----------------------------------------------------
# CONFIGURACIÓN DE FIREBASE (Opcional)
# Si no se definen, el sistema opera con base de datos local y almacenamiento reactivo
# ----------------------------------------------------
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

---

## 4. Ejecución en Entorno de Desarrollo

Para iniciar el servidor local con recarga rápida y soporte de red local:

```bash
npm run dev
```

- La aplicación iniciará en: **`http://localhost:3000`**
- Para probarla desde un teléfono celular en la misma red Wi-Fi, abre la IP local mostrada en la terminal (ejemplo: `http://192.168.1.50:3000`).

---

## 5. Compilación y Construcción para Producción

Para compilar y empaquetar la aplicación optimizada para producción:

```bash
# 1. Verificar tipos y sintaxis
npm run lint

# 2. Generar el paquete de producción en la carpeta /dist
npm run build
```

Una vez finalizada la compilación, la carpeta estática generada será **`/dist`**.

Para previsualizar localmente la versión de producción:
```bash
npm run preview
```

---

## 6. Publicación y Despliegue

### Opción A: Despliegue en Vercel (Recomendado)

1. Instala el CLI de Vercel (opcional) o conecta tu repositorio en [vercel.com](https://vercel.com).
2. Configuración en Vercel:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Agrega las variables de entorno (`VITE_FIREBASE_*`) en el panel de **Environment Variables** del proyecto.
4. Despliega con un clic o ejecutando `vercel --prod`.

---

### Opción B: Despliegue en Firebase Hosting

1. Instala el CLI de Firebase:
   ```bash
   npm install -g firebase-tools
   ```
2. Inicia sesión en Firebase:
   ```bash
   firebase login
   ```
3. Inicializa Firebase Hosting en la raíz:
   ```bash
   firebase init hosting
   ```
   - **Directorio público**: `dist`
   - **Configurar como SPA**: `Yes` (reescribir todas las URLs a `/index.html`)
   - **Sobrescribir index.html**: `No`
4. Despliega la aplicación y las reglas de seguridad:
   ```bash
   npm run build
   firebase deploy
   ```

---

### Opción C: Despliegue en Servidor VPS / Nginx / Docker

Si dispones de un servidor Linux propio (Ubuntu/Debian) con **Nginx**:

1. Copia el contenido de la carpeta `/dist` a `/var/www/softworker`.
2. Configura tu bloque de Nginx (`/etc/nginx/sites-available/softworker`):
   ```nginx
   server {
       listen 80;
       server_name asistencia.tu-colegio.edu.co;

       root /var/www/softworker;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Soporte SSL recomendado con Certbot / Let's Encrypt
   }
   ```
3. Habilita el sitio y reinicia Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/softworker /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

> ⚠️ **Importante**: Para que la cámara del navegador web funcione en dispositivos móviles y portátiles, el sitio **DEBE contar con certificado HTTPS** (SSL). Puedes instalarlo gratis con `sudo certbot --nginx`.

---

## 7. Configuración de Base de Datos y Permisos

### Reglas de Seguridad de Firestore (`firestore.rules`)
El proyecto incluye el archivo `firestore.rules` listo para proteger las colecciones:
- `estudiantes`, `docentes`, `acudientes`
- `asistencias` (registros de aula)
- `pases_salida` (control de portería)
- `asignaturas`, `grados`, `grupos`, `sedes`

Para desplegar las reglas directamente a Firebase:
```bash
firebase deploy --only firestore:rules
```

---

## 8. Solución de Problemas Comunes

### 📷 La cámara no se activa al escanear
- **Causa**: El navegador bloquea la cámara si el sitio no está bajo `localhost` o un dominio seguro `https://`.
- **Solución**: Asegúrate de tener certificado SSL activado (`https://`) y otorga los permisos correspondientes cuando el navegador lo solicite. También puedes usar la opción **Subir Archivo / Foto QR**.

### 🚫 Error 404 al recargar páginas o rutas
- **Causa**: El servidor web no está redirigiendo todas las peticiones a `index.html`.
- **Solución**: Configura el fallback de SPA en Nginx (`try_files $uri $uri/ /index.html;`) o en tu proveedor de hosting (`rewrites` en Vercel/Firebase).

### ⚡ Error de compilación en dependencias
- **Solución**: Ejecuta una instalación limpia:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run build
  ```

---

### 🔑 Cuentas Preconfiguradas para Pruebas Iniciales

| Perfil | Identificador / Documento | Contraseña |
| :--- | :--- | :--- |
| **Rectoría / Admin** | `rector@ietcaldas.edu.co` | `admin123` |
| **Docente** | `14256789` (CC) | `docente123` |
| **Acudiente** | `28549302` (CC) | `acudiente123` |
| **Estudiante** | `1098234561` (TI) | `1098234561` |
