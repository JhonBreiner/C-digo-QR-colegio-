# 🚀 Guía de Instalación y Publicación — SOFTWORKER
## Sistema de Control de Asistencia QR & Gestión Escolar
### Institución Educativa Técnica Francisco José de Caldas (Natagaima - Tolima)

---

## ⚡ Inicio Inmediato (Sin Configuración Requerida)

> **💡 ¡No necesitas configurar Firebase ni crear archivos `.env`!**  
> El sistema viene con persistencia local integrada y datos de prueba preconfigurados. No requiere cuentas externas, claves de API ni configuraciones complejas para funcionar.

Solo ejecuta estos dos comandos en tu terminal:

```bash
# 1. Instalar librerías
npm install

# 2. Iniciar el sistema en tu navegador
npm run dev
```

Abre tu navegador en: **`http://localhost:3000`**

---

## 🔑 Cuentas de Acceso Rápido

Puedes ingresar inmediatamente con cualquiera de los siguientes perfiles de prueba:

| Rol | Tipo de Documento / Usuario | Documento / Usuario | Contraseña | Funciones |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Rectoría / Admin** | Correo Institucional | `rector@ietcaldas.edu.co` | `admin123` | Control total, reportes, pases de salida, carnetización |
| 👨‍🏫 **Docente** | Cédula de Ciudadanía (CC) | `14256789` | `docente123` | Escáner QR de aula, asistencia, reportes |
| 👥 **Acudiente** | Cédula de Ciudadanía (CC) | `28549302` | `acudiente123` | Monitoreo y alertas de inasistencias |
| 🎓 **Estudiante** | Tarjeta de Identidad (TI) | `1098234561` | `1098234561` | Carné digital interactivo con QR |

---

## 📋 Requisitos Previos

Para ejecutar o publicar el proyecto solo necesitas:

- **Node.js**: Versión `18.x`, `20.x` o superior ([Descargar Node.js](https://nodejs.org/))
- **Git**: ([Descargar Git](https://git-scm.com/))
- **Navegador Web Moderno**: Google Chrome, Edge, Safari o Firefox con soporte para cámara web.

---

## 📦 Instalación Paso a Paso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/softworker-asistencia-qr.git
   cd softworker-asistencia-qr
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🏗️ Compilación para Producción

Para compilar y empaquetar el proyecto optimizado:

```bash
npm run build
```

Los archivos finales listos para publicar se generarán en la carpeta **`/dist`**.

---

## 🌐 Publicación y Despliegue en Internet

### 1. Despliegue en Vercel (Recomendado - 100% Gratuito)
1. Sube tu proyecto a GitHub.
2. Ve a [vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New Project"** y selecciona tu repositorio.
4. Parámetros detectados automáticamente:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Deja la sección de "Environment Variables" vacía** (no se requieren variables obligatorias).
6. Haz clic en **Deploy**. ¡Tu sistema estará en línea con HTTPS gratis!

---

### 2. Despliegue en Netlify
1. Conecta tu repositorio en [netlify.com](https://netlify.com).
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. Haz clic en **Deploy Site**.

---

### 3. Despliegue en Servidor VPS Propio / Nginx
1. Sube la carpeta `/dist` a tu servidor (ej. `/var/www/softworker`).
2. Configuración en Nginx:
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
3. Activa certificado SSL gratis para habilitar el uso de la cámara web:
   ```bash
   sudo certbot --nginx -d asistencia.tucolegio.edu.co
   ```

---

## ❓ Preguntas Frecuentes

### ¿Es obligatorio configurar Firebase o un archivo `.env`?
**No.** El sistema funciona de forma autónoma con almacenamiento local y datos predeterminados. No requiere configurar nada en Firebase ni crear archivos `.env`.

### 📷 ¿Por qué la cámara del escáner QR no se activa?
Los navegadores web requieren una conexión segura (`https://` o `localhost`) para permitir el acceso a la cámara. En producción, asegúrate de que el sitio tenga certificado SSL (en Vercel y Netlify se incluye automáticamente). Además, siempre puedes usar la opción **"Subir Foto / Archivo QR"** o el botón de simulación rápida.

---

*Institución Educativa Técnica Francisco José de Caldas — Natagaima, Tolima.*
