# 🚀 Guía de Instalación, Configuración y Publicación
## Sistema de Control de Asistencia QR & Gestión Escolar — SOFTWORKER
### Institución Educativa Técnica Francisco José de Caldas (Natagaima - Tolima)

---

## ⚡ Inicio Rápido (Modo Cero Configuración)
> **¡Nota importante!** Esta aplicación cuenta con un **motor de persistencia local y autónomo integrado**. No es obligatorio configurar Firebase ni crear archivos `.env` para usarla. Puedes clonar, instalar dependencias y empezar a utilizarla inmediatamente.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local
npm run dev
```
La aplicación abrirá en **`http://localhost:3000`** con todos los módulos y datos de prueba listos para usar.

---

## 📌 Tabla de Contenidos
1. [Requisitos Previos](#1-requisitos-previos)
2. [Instalación del Proyecto](#2-instalación-del-proyecto)
3. [Ejecución en Entorno de Desarrollo](#3-ejecución-en-entorno-de-desarrollo)
4. [Configuración Opcional (Variables de Entorno / Firebase)](#4-configuración-opcional-variables-de-entorno--firebase)
5. [Compilación y Construcción para Producción](#5-compilación-y-construcción-para-producción)
6. [Publicación y Despliegue](#6-publicación-y-despliegue)
   - [Opción A: Vercel (Recomendado - Gratuito)](#opción-a-despliegue-en-vercel-recomendado---gratuito)
   - [Opción B: Firebase Hosting](#opción-b-despliegue-en-firebase-hosting)
   - [Opción C: Netlify / Render](#opción-c-despliegue-en-netlify--render)
   - [Opción D: Servidor VPS Propio / Linux (Nginx)](#opción-d-despliegue-en-servidor-vps-propio--linux-nginx)
7. [Cuentas de Acceso Rápido para Pruebas](#7-cuentas-de-acceso-rápido-para-pruebas)
8. [Solución de Problemas Comunes](#8-solución-de-problemas-comunes)

---

## 1. Requisitos Previos

Para ejecutar o publicar el proyecto necesitas:

- **Node.js**: Versión `18.x`, `20.x` o superior ([Descargar Node.js](https://nodejs.org/))
- **NPM** (incluido con Node.js), **Yarn**, **PNPM** o **Bun**
- **Git**: Para clonar y versionar el código ([Descargar Git](https://git-scm.com/))
- **Navegador Web Moderno** (Google Chrome, Microsoft Edge, Safari o Firefox).

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
   *(También puedes usar `yarn install` o `bun install`)*

---

## 3. Ejecución en Entorno de Desarrollo

Para iniciar el servidor de desarrollo local:

```bash
npm run dev
```

- **URL Local:** `http://localhost:3000`
- **Acceso desde Celulares en la misma red Wi-Fi:** Puedes ingresar desde el navegador de tu celular usando la IP local mostrada en tu terminal (ejemplo: `http://192.168.1.45:3000`).

---

## 4. Configuración Opcional (Variables de Entorno / Firebase)

> 💡 **Este paso es totalmente opcional.** Si deseas conectar tu propia base de datos de Google Firebase Firestore en la nube para sincronización multi-dispositivo permanente:

1. Crea un archivo `.env` en la raíz copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Completa tus credenciales de Firebase en el archivo `.env`:
   ```env
   # Configuración de Firebase (Opcional)
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

*(Si dejas el archivo `.env` sin crear o vacío, el sistema continuará funcionando al 100% con su motor de almacenamiento local).*

---

## 5. Compilación y Construcción para Producción

Antes de publicar en internet, genera los archivos optimizados para producción:

```bash
# 1. Comprobar que no existan errores de código o tipos
npm run lint

# 2. Compilar el proyecto para producción
npm run build
```

El resultado compilado y minificado se guardará en la carpeta **`/dist`**.

Para probar localmente la versión de producción antes de subirla:
```bash
npm run preview
```

---

## 6. Publicación y Despliegue

### Opción A: Despliegue en Vercel (Recomendado - Gratuito)
1. Sube tu código a GitHub o GitLab.
2. Ingresa a [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New Project"** e importa tu repositorio.
4. Parámetros de compilación detectados automáticamente:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Haz clic en **Deploy**. ¡Tu aplicación estará publicada con certificado SSL (HTTPS) gratuito en minutos!

---

### Opción B: Despliegue en Firebase Hosting
1. Instala las herramientas de Firebase:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Inicializa Hosting en la carpeta del proyecto:
   ```bash
   firebase init hosting
   ```
   - Directorio público: `dist`
   - ¿Configurar como SPA?: `Yes`
   - ¿Sobrescribir index.html?: `No`
3. Construye y publica:
   ```bash
   npm run build
   firebase deploy
   ```

---

### Opción C: Despliegue en Netlify / Render
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Configuración SPA:** En caso de Netlify, el archivo `_redirects` o regla `/* /index.html 200` asegura la navegación interna fluida.

---

### Opción D: Despliegue en Servidor VPS Propio / Linux (Nginx)
1. Sube el contenido de la carpeta `/dist` a tu servidor (ej. `/var/www/softworker`).
2. Configura tu bloque de Nginx (`/etc/nginx/sites-available/softworker`):
   ```nginx
   server {
       listen 80;
       server_name asistencia.tucolegio.edu.co;

       root /var/www/softworker;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Activa el sitio y reinicia Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/softworker /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```
4. **Instalar certificado SSL gratuito (HTTPS obligatorio para activar cámara web):**
   ```bash
   sudo certbot --nginx -d asistencia.tucolegio.edu.co
   ```

---

## 7. Cuentas de Acceso Rápido para Pruebas

El sistema incluye las siguientes credenciales predeterminadas para cada rol:

| Rol / Portal | Documento / Usuario | Contraseña | Funciones Principales |
| :--- | :--- | :--- | :--- |
| 🛡️ **Rectoría / Admin** | `rector@ietcaldas.edu.co` | `admin123` | Control total, reportes, pases de salida, carnetización |
| 👨‍🏫 **Docente (CC)** | `14256789` | `docente123` | Escáner QR de aula, registro de asistencia, reportes |
| 👥 **Acudiente (CC)** | `28549302` | `acudiente123` | Monitoreo de inasistencias y alertas tempranas del acudido |
| 🎓 **Estudiante (TI)** | `1098234561` | `1098234561` | Carné digital interactivo con QR en alta resolución |

---

## 8. Solución de Problemas Comunes

### 📷 La cámara no se abre al escanear QR
- **Causa**: La API de cámara de los navegadores (`getUserMedia`) requiere por seguridad un entorno seguro (`localhost` o `https://`).
- **Solución**: En producción, asegúrate de que tu sitio tenga certificado SSL (`https://`). Si no tienes cámara disponible, utiliza la opción **"Subir Foto / Archivo QR"** o el **"Simulador Rápido de 1 Clic"** incluido en el sistema.

### 🔄 Error 404 al recargar la página en producción
- **Causa**: El servidor web busca una carpeta en el disco en lugar de redirigir a `index.html`.
- **Solución**: Configura la regla de reescritura SPA (`try_files $uri $uri/ /index.html;` en Nginx, o rewrites en Vercel/Netlify/Firebase).

### 📦 Limpieza y reinstalación de módulos
- Si experimentas problemas con paquetes:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run build
  ```

---

*Desarrollado para la Institución Educativa Técnica Francisco José de Caldas — Natagaima, Tolima.*
