/**
 * SOFTWORKER - Sistema Cyber-SaaS de Control de Asistencia y Gestión Estudiantil por Código QR
 * Institución Educativa Técnica Francisco José de Caldas - Natagaima, Tolima
 * 
 * Este archivo implementa las funciones de integración cliente para lectura de cámara QR,
 * sincronización con Firebase Cloud Firestore, exportación a Excel / PDF y lógica de reportes.
 */

import { db, auth, seedFirestoreDatabase } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

/**
 * Módulo de Cámara & Escáner QR con sonido 'bip' de confirmación
 */
export class QRScannerController {
  constructor(containerId, onSuccessCallback) {
    this.containerId = containerId;
    this.onSuccessCallback = onSuccessCallback;
    this.html5QrCode = null;
  }

  // Reproductor sintetizado de beep
  playConfirmationBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1046, ctx.currentTime); // C6 Note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  // Iniciar cámara del dispositivo
  async startScanner() {
    if (typeof window.Html5Qrcode === "undefined") {
      console.warn("Html5Qrcode no detectado globalmente; usando integración modular React.");
      return;
    }

    try {
      this.html5QrCode = new window.Html5Qrcode(this.containerId);

      const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
      const onScan = (decodedText) => {
        this.playConfirmationBeep();
        if (this.onSuccessCallback) {
          this.onSuccessCallback(decodedText);
        }
      };

      try {
        await this.html5QrCode.start({ facingMode: "environment" }, scanConfig, onScan, () => {});
      } catch (e) {
        console.warn("Retrying camera start with facingMode user...", e);
        await this.html5QrCode.start({ facingMode: "user" }, scanConfig, onScan, () => {});
      }
    } catch (err) {
      console.warn("Error o permiso denegado al iniciar cámara QR:", err);
    }
  }

  // Detener cámara
  async stopScanner() {
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      await this.html5QrCode.stop();
    }
  }
}

/**
 * Servicio de Asistencia Firestore
 */
export const AsistenciaService = {
  // Registrar nueva asistencia en Firestore
  async registrarAsistencia(asistenciaData) {
    try {
      const docRef = await addDoc(collection(db, "asistencias"), {
        ...asistenciaData,
        creado_el: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error al guardar asistencia en Firestore:", error);
      return { success: false, error };
    }
  },

  // Obtener asistencias por fecha
  async obtenerAsistenciasPorFecha(fechaStr) {
    try {
      const q = query(collection(db, "asistencias"), where("fecha", "==", fechaStr));
      const querySnapshot = await getDocs(q);
      const asistencias = [];
      querySnapshot.forEach((doc) => {
        asistencias.push({ id: doc.id, ...doc.data() });
      });
      return asistencias;
    } catch (error) {
      console.error("Error al consultar asistencias:", error);
      return [];
    }
  }
};

/**
 * Inicializador de la Aplicación
 */
export function initApp() {
  console.log("Aplicación Softworker I.E.T. Francisco José de Caldas iniciada correctamente.");
}

// Ejecutar inicializador al cargar DOM
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initApp);
}
