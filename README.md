# SOFTWORKER — Sistema de Control de Asistencia QR & Gestión Escolar
### Institución Educativa Técnica Francisco José de Caldas — Natagaima, Tolima

Bienvenido al sistema integral **SOFTWORKER**, una plataforma web moderna diseñada para la gestión académica, control de asistencia por código QR en aulas de clase, emisión de carnés digitales e impresos (CR80) en alto contraste, alertas tempranas de inasistencia escolar y gestión de pases de salida en portería.

---

## 📋 Características Principales

### 1. 📇 Módulo de Carnetización QR Estudiantil (CR80)
- Generación de carnés con formato estándar **CR80** (frente y reverso).
- Escudo institucional oficial en alta resolución con emblema triangular.
- Datos completos: Código estudiantil, Nombres, Grado, Grupo, RH, EPS, ARL y Teléfonos de contacto.
- **Códigos QR de alto contraste** (Negro puro `#000000` sobre blanco `#FFFFFF`), sin interferencias visuales para lectura instantánea en cualquier cámara o lector físico.
- Visualizador interactivo **3D** con efecto hover y brillo glassmorphic.
- Descarga individual en PNG y exportación masiva en **PDF listo para impresión**.

### 2. ⚡ Control de Asistencia QR en Aulas de Clase
- **Lectura en Vivo por Cámara**: Compatible con cámaras web de portátiles, tabletas y teléfonos móviles (cámara trasera y delantera).
- **Subida de Archivo QR**: Permite escanear fotos o capturas de carnés tomadas previamente.
- **Registro Manual de Asistencia**: Búsqueda rápida por nombre, TI o código para estudiantes que hayan olvidado su carné físico.
- **Cálculo Automático de Puntualidad**: Clasificación en tiempo real entre *Presente (A tiempo)* y *Retardo (Tarde)* según el horario establecido.
- Registro asociado a la **Asignatura**, **Docente Titular**, **Grado** y **Grupo**.

### 3. 🚨 Módulo de Alertas Tempranas de Asistencia
- Monitoreo continuo de inasistencias por materia y por estudiante.
- Cálculo automático de riesgo de pérdida por inasistencia (**> 20% de inasistencias** de acuerdo con la Intensidad Horaria Semanal - IHS).
- Canal directo de comunicación con acudientes vía **WhatsApp** con plantillas de notificación institucional preconfiguradas.

### 4. 🚪 Control de Pases de Salida en Portería
- Emisión y validación digital de permisos de salida autorizados por Rectoría o Coordinación.
- Verificación en portería mediante escaneo QR o búsqueda por número de documento / código de pase.
- Registro de hora efectiva de salida y control de acudiente autorizado para el retiro del menor.

### 5. 📊 Reportes y Estadísticas Oficiales
- Gráficos interactivos de porcentaje de asistencia y ausentismo por grado, grupo y asignatura.
- Exportación de reportes a **Excel (.xlsx)** y documentos formales en **PDF** con membrete institucional.

### 6. 🔐 Autenticación Multi-Rol con Ingreso Rápido
- **Rectoría / Administrador**: Acceso total al sistema y configuración.
- **Docentes**: Registro de asistencia en sus asignaturas y grupos asignados (Ingreso con Cédula de Ciudadanía - **CC**).
- **Acudientes**: Monitoreo del historial de asistencia y novedades de sus hijos (Ingreso con **CC**).
- **Estudiantes**: Acceso a su carné digital interactivo y estadísticas personales (Ingreso con Tarjeta de Identidad - **TI**).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18+, TypeScript, Vite
- **Estilos & Diseño**: Tailwind CSS, Lucide Icons, Glassmorphism, Neon Cyber-HUD Theme
- **Procesamiento QR**: `html5-qrcode` para lectura por cámara y archivos, `qrcode` para generación de imágenes vectoriales y matriciales
- **Generación de Documentos**: `jspdf`, `jspdf-autotable`, `xlsx`
- **Gráficos**: Recharts
- **Persistencia**: Firebase Firestore & Almacenamiento local optimizado con sincronización en tiempo real

---

## 🚀 Puesta en Marcha en Desarrollo

Para ejecutar el proyecto en tu entorno local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 👥 Cuentas de Acceso Rápido para Pruebas

| Rol | Usuario / Documento | Contraseña |
| :--- | :--- | :--- |
| **Rectoría (Admin)** | `rector@ietcaldas.edu.co` | `admin123` |
| **Docente** | `14256789` | `docente123` |
| **Acudiente** | `28549302` | `acudiente123` |
| **Estudiante** | `1098234561` | `1098234561` |

---

*Desarrollado para la Institución Educativa Técnica Francisco José de Caldas — Natagaima, Tolima.*
