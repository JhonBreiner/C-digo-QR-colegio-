/**
 * SOFTWORKER - Sistema Cyber-SaaS de Control de Asistencia y Gestión Estudiantil por Código QR
 * Institución Educativa Técnica Francisco José de Caldas - Natagaima, Tolima
 * 
 * Controlador Principal de Escaneo QR, Consulta Firestore y Despliegue de Carnet
 */

import { db, auth, SEED_DATA_COLLECTIONS } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where 
} from "firebase/firestore";

// ============================================================================
// 1. ESTADO GLOBAL DEL ESCÁNER Y CÁMARA
// ============================================================================
export let camaraActiva = false;
export let html5QrCode = null;
export let ultimoEscaneoId = null;

// Configuración Institucional
export const CONFIG_INSTITUCIONAL = {
  nombre_colegio: "I.E.T. FRANCISCO JOSÉ DE CALDAS",
  municipio: "NATAGAIMA - TOLIMA",
  hora_limite_ingreso: "07:00:00", // Hora límite institucional para considerar "A TIEMPO"
  escudo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80"
};

// ============================================================================
// 2. REPRODUCTOR DE SONIDO SINTETIZADO (Web Audio API)
// ============================================================================
export function playConfirmationBeep(isLate = false) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Tono C6 (1046 Hz) para A Tiempo, Tono G5 (784 Hz) para Retardo
    osc.type = isLate ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(isLate ? 784 : 1046, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    console.warn("Audio Context beep aviso:", e);
  }
}

// ============================================================================
// 3. GENERADOR DE QR (ALTO CONTRASTE PURO SIN LOGOS)
// ============================================================================
export async function generatePureQRCode(textPayload, customOptions = {}) {
  const defaultOptions = {
    width: 300,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    },
    errorCorrectionLevel: "M",
    logo: null,
    image: null,
    imageSettings: undefined
  };

  const options = { ...defaultOptions, ...customOptions };

  if (typeof window !== "undefined" && window.QRCode && typeof window.QRCode.toDataURL === "function") {
    return await window.QRCode.toDataURL(textPayload, options);
  }

  return new Promise((resolve, reject) => {
    try {
      if (typeof window !== "undefined" && window.QRCode) {
        const tempDiv = document.createElement("div");
        new window.QRCode(tempDiv, {
          text: textPayload,
          width: options.width,
          height: options.width,
          colorDark: "#000000",
          colorLight: "#FFFFFF",
          correctLevel: window.QRCode.CorrectLevel?.M || 2,
          logo: null,
          image: null,
          imageSettings: undefined
        });
        setTimeout(() => {
          const img = tempDiv.querySelector("img") || tempDiv.querySelector("canvas");
          resolve(img ? (img.src || img.toDataURL("image/png")) : "");
        }, 50);
      } else {
        resolve("");
      }
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================================
// 4. CONTROLADOR DE ENCENDIDO / APAGADO DE CÁMARA
// ============================================================================
export async function iniciarEscaner(contenedorId = "reader") {
  if (typeof window === "undefined" || !window.Html5Qrcode) {
    console.warn("Html5Qrcode no está disponible en window.");
    return;
  }

  try {
    if (!html5QrCode) {
      html5QrCode = new window.Html5Qrcode(contenedorId);
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    // Iniciar con cámara trasera de forma transparente
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => onScanSuccess(decodedText),
        () => {} // Ignorar fallos continuos por frame
      );
    } catch (rearErr) {
      console.warn("Fallback a cámara estándar:", rearErr);
      await html5QrCode.start(
        { facingMode: "user" },
        config,
        (decodedText) => onScanSuccess(decodedText),
        () => {}
      );
    }

    camaraActiva = true;
    actualizarBotonCamaraUI(true);
    mostrarLaserLine(true);
  } catch (error) {
    console.error("Error al iniciar escáner:", error);
    camaraActiva = false;
    actualizarBotonCamaraUI(false);
    mostrarLaserLine(false);
  }
}

export async function detenerEscaner() {
  if (html5QrCode && camaraActiva) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }
    } catch (err) {
      console.warn("Aviso al detener escáner:", err);
    }
    try {
      const container = document.getElementById("reader");
      if (container) {
        await html5QrCode.clear();
      }
    } catch {
      // Ignorar clear
    }
    camaraActiva = false;
    actualizarBotonCamaraUI(false);
    mostrarLaserLine(false);
  }
}

export async function toggleCamara(contenedorId = "reader") {
  if (camaraActiva) {
    await detenerEscaner();
  } else {
    await iniciarEscaner(contenedorId);
  }
}

function actualizarBotonCamaraUI(activa) {
  const btn = document.getElementById("btnToggleCamara");
  if (btn) {
    if (activa) {
      btn.className = "btn-toggle-camera-overlay btn-camera-on";
      btn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
        <span>Apagar Cámara</span>
      `;
    } else {
      btn.className = "btn-toggle-camera-overlay btn-camera-off";
      btn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        <span>Encender Cámara</span>
      `;
    }
  }
}

function mostrarLaserLine(mostrar) {
  const laser = document.getElementById("scannerLaserLine");
  if (laser) {
    laser.style.display = mostrar ? "block" : "none";
  }
}

// ============================================================================
// 5. CONSULTA EN FIRESTORE Y DESPLIEGUE DEL CARNET AL ESCANEAR
// ============================================================================
export async function onScanSuccess(codigoEscaneado) {
  if (!codigoEscaneado) return;

  // Evitar lecturas duplicadas en el mismo segundo
  const ahoraMs = Date.now();
  if (ultimoEscaneoId === codigoEscaneado && (ahoraMs - (window._ultimoScanTime || 0)) < 2500) {
    return;
  }
  window._ultimoScanTime = ahoraMs;
  ultimoEscaneoId = codigoEscaneado;

  // Limpiar payload si viene en formato JSON estructurado
  let codigoBuscado = codigoEscaneado.trim();
  try {
    if (codigoBuscado.startsWith("{") && codigoBuscado.endsWith("}")) {
      const parsed = JSON.parse(codigoBuscado);
      codigoBuscado = parsed.cod || parsed.codigo_estudiantil || parsed.id || codigoBuscado;
    }
  } catch (e) {
    // Si no es JSON, se usa el string original
  }

  console.log("🔍 Escaneando código estudiantil:", codigoBuscado);

  // 1. Búsqueda en Firestore en la colección 'estudiantes'
  let estudianteEncontrado = null;
  try {
    const q = query(
      collection(db, "estudiantes"), 
      where("codigo_estudiantil", "==", codigoBuscado)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      estudianteEncontrado = { id: docData.id, ...docData.data() };
    } else {
      // Búsqueda secundaria por ID de documento o en seeder local de respaldo
      const localEst = (SEED_DATA_COLLECTIONS.estudiantes || []).find(
        e => e.codigo_estudiantil === codigoBuscado || e.id === codigoBuscado || e.numero_doc === codigoBuscado
      );
      if (localEst) {
        estudianteEncontrado = localEst;
      }
    }
  } catch (dbErr) {
    console.warn("Consulta Firestore en fallback local:", dbErr);
    estudianteEncontrado = (SEED_DATA_COLLECTIONS.estudiantes || []).find(
      e => e.codigo_estudiantil === codigoBuscado || e.id === codigoBuscado
    );
  }

  // Si no existe, crear objeto representativo para no bloquear el flujo
  if (!estudianteEncontrado) {
    estudianteEncontrado = {
      id: `EST-${codigoBuscado.slice(-4) || 'SCAN'}`,
      codigo_estudiantil: codigoBuscado,
      nombres: "Estudiante Caldista",
      apellidos: "(Marcación Escolar)",
      grado_id: "GRA-11",
      grupo_id: "GRP-111",
      eps_id: "EPS-01",
      rh: "O+",
      foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    };
  }

  // 2. Obtener hora exacta actual (HH:MM:SS AM/PM) y evaluar "A TIEMPO" o "RETARDO"
  const fechaObj = new Date();
  const fechaStr = fechaObj.toISOString().split("T")[0];
  const horaExactaStr = fechaObj.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const horas24 = fechaObj.getHours();
  const minutos24 = fechaObj.getMinutes();
  
  // Regla institucional: después de las 07:00 AM es Retardo/Tarde
  const esRetardo = (horas24 > 7) || (horas24 === 7 && minutos24 > 0);
  const estadoAsistencia = esRetardo ? "TARDE" : "PRESENTE";
  const textoEstadoBadge = esRetardo ? "LLEGÓ TARDE" : "A TIEMPO";

  // 3. Guardar evento en la colección 'asistencias' de Firestore
  try {
    const asignaturaSel = document.getElementById("selectAsignatura")?.value || "ASIG-01";
    const docenteSel = document.getElementById("selectDocente")?.value || "DOC-01";

    await addDoc(collection(db, "asistencias"), {
      estudiante_id: estudianteEncontrado.id,
      codigo_estudiantil: estudianteEncontrado.codigo_estudiantil,
      fecha: fechaStr,
      hora_ingreso: horaExactaStr,
      asignatura_id: asignaturaSel,
      docente_id: docenteSel,
      estado: estadoAsistencia,
      observacion: esRetardo ? "Ingreso con retardo institucional" : "Ingreso puntual institucional",
      creado_el: new Date()
    });
    console.log("✅ Asistencia registrada exitosamente en Firestore");
  } catch (errAsist) {
    console.error("Error al registrar asistencia en Firestore:", errAsist);
  }

  // 4. Emitir sonido bip
  playConfirmationBeep(esRetardo);

  // 5. Desplegar Carnet del Estudiante en Modal
  mostrarCarnetModal({
    estudiante: estudianteEncontrado,
    horaExacta: horaExactaStr,
    fecha: fechaStr,
    esRetardo: esRetardo,
    textoEstado: textoEstadoBadge
  });
}

// ============================================================================
// 6. RENDERIZADO DEL MODAL / CARNET DEL ESTUDIANTE
// ============================================================================
export function mostrarCarnetModal(datos) {
  const { estudiante, horaExacta, esRetardo, textoEstado } = datos;
  const modal = document.getElementById("carnetModal");
  if (!modal) return;

  // Grado y Grupo amigable (ej: 11-1 o 10-01)
  const gradoNombre = estudiante.grado_id === "GRA-11" ? "11°" : (estudiante.grado_id === "GRA-10" ? "10°" : "Bachillerato");
  const grupoNombre = estudiante.grupo_id === "GRP-111" ? "11-1" : (estudiante.grupo_id === "GRP-101" ? "10-1" : "01");

  // EPS y RH
  const epsTexto = estudiante.eps_id === "EPS-01" ? "Asmet Salud EPS" : (estudiante.eps_id === "EPS-02" ? "Nueva EPS" : "Coosalud");
  const rhTexto = estudiante.rh || "O+";

  // Foto del estudiante con fallback estético
  const fotoUrl = estudiante.foto_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`;

  // Asignar datos a los elementos del modal
  const elFoto = document.getElementById("carnetFoto");
  if (elFoto) elFoto.src = fotoUrl;

  const elNombre = document.getElementById("carnetNombre");
  if (elNombre) elNombre.textContent = `${estudiante.nombres} ${estudiante.apellidos}`;

  const elCodigo = document.getElementById("carnetCodigo");
  if (elCodigo) elCodigo.textContent = estudiante.codigo_estudiantil || estudiante.id;

  const elGradoGrupo = document.getElementById("carnetGradoGrupo");
  if (elGradoGrupo) elGradoGrupo.textContent = `${gradoNombre} • Grupo ${grupoNombre}`;

  const elEpsRh = document.getElementById("carnetEpsRh");
  if (elEpsRh) elEpsRh.textContent = `EPS: ${epsTexto} | RH: ${rhTexto}`;

  const elHora = document.getElementById("carnetHora");
  if (elHora) elHora.textContent = horaExacta;

  const elBadge = document.getElementById("carnetEstadoBadge");
  if (elBadge) {
    elBadge.className = `badge-estado ${esRetardo ? 'badge-retardo' : 'badge-a-tiempo'}`;
    elBadge.innerHTML = `
      <span class="w-2 h-2 rounded-full ${esRetardo ? 'bg-amber-400 animate-ping' : 'bg-[#00FF66] animate-pulse'}"></span>
      <span>${textoEstado}</span>
    `;
  }

  // Activar modal visualmente
  modal.classList.add("active");
}

export function cerrarCarnetModal() {
  const modal = document.getElementById("carnetModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// ============================================================================
// 7. INICIALIZACIÓN DE LISTENERS DOM Y AUTO-INICIO DE CÁMARA
// ============================================================================
export function initApp() {
  // Botón Encender / Apagar Cámara sobre el visor
  const btnToggle = document.getElementById("btnToggleCamara");
  if (btnToggle) {
    btnToggle.addEventListener("click", () => toggleCamara("reader"));
  }

  // Botón Escanear Siguiente
  const btnNext = document.getElementById("btnEscanearSiguiente");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      cerrarCarnetModal();
      ultimoEscaneoId = null;
    });
  }

  // Cerrar modal al hacer clic en el backdrop
  const modal = document.getElementById("carnetModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cerrarCarnetModal();
        ultimoEscaneoId = null;
      }
    });
  }

  // Auto-inicio automático de la cámara trasera sin requerir botones extra
  const readerElement = document.getElementById("reader");
  if (readerElement) {
    setTimeout(() => {
      iniciarEscaner("reader");
    }, 200);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initApp);
}
