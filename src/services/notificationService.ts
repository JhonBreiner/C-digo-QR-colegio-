import type { 
  NotificacionPush, 
  ConfiguracionPushAcudiente, 
  TipoAlertaNotificacion, 
  Estudiante, 
  Acudiente,
  Grado,
  Grupo,
  Docente,
  Asignatura
} from '../types';

// Default configuration for notifications
const DEFAULT_CONFIG: ConfiguracionPushAcudiente = {
  pushHabilitado: true,
  sonidoHabilitado: true,
  alertaTardanzas: true,
  alertaInasistencias: true,
  alertaSalidas: true,
  alertaConvivencia: true,
  telefonoWhatsApp: ''
};

const CONFIG_STORAGE_KEY = 'softworker_push_config_v1';
const NOTIFICATIONS_STORAGE_KEY = 'softworker_notifications_history_v1';

// In-memory subscribers for real-time in-app toast updates
type NotificationListener = (notification: NotificacionPush) => void;
const notificationListeners: Set<NotificationListener> = new Set();

/**
 * Check if Web Notifications API is supported by the browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request Web Push / Desktop Notification permissions from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    console.warn('Web Notifications no están soportadas en este navegador.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Register service worker if supported
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (swErr) {
          console.log('Service Worker registration skipped or restricted in iframe:', swErr);
        }
      }
    }
    return permission;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return Notification.permission;
  }
}

/**
 * Synthesize custom web audio alerts for notifications
 */
export function playNotificationSound(tipo: TipoAlertaNotificacion = 'TARDANZA') {
  const config = getConfiguracionPush();
  if (!config.sonidoHabilitado) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (tipo === 'INASISTENCIA') {
      // Urgent double tone for Absence (Inasistencia)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(440, now); // A4
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.35); // A3

      osc2.frequency.setValueAtTime(554.37, now + 0.2); // C#5
      osc2.frequency.exponentialRampToValueAtTime(277.18, now + 0.55);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.6);
    } else if (tipo === 'TARDANZA') {
      // Alert chime for Late arrival (Tardanza)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.setValueAtTime(880, now + 0.12); // A5

      osc2.frequency.setValueAtTime(987.77, now + 0.24); // B5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.24);
      osc2.start(now + 0.24);
      osc2.stop(now + 0.48);
    } else {
      // General informational chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

/**
 * Mobile vibration trigger
 */
export function triggerVibration(pattern: number[] = [200, 100, 200]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

/**
 * Load user push configuration from LocalStorage
 */
export function getConfiguracionPush(): ConfiguracionPushAcudiente {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Save user push configuration to LocalStorage
 */
export function guardarConfiguracionPush(config: Partial<ConfiguracionPushAcudiente>): ConfiguracionPushAcudiente {
  const current = getConfiguracionPush();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando configuración push:', e);
  }
  return updated;
}

/**
 * Load stored notifications history
 */
export function getHistorialNotificaciones(): NotificacionPush[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save a notification to the persistent history
 */
export function guardarEnHistorialNotificaciones(notif: NotificacionPush): void {
  try {
    const history = getHistorialNotificaciones();
    // Keep last 100 notifications
    const updated = [notif, ...history.filter(n => n.id !== notif.id)].slice(0, 100);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando historial de notificaciones:', e);
  }
}

/**
 * Mark notification as read
 */
export function marcarNotificacionLeida(id: string): void {
  try {
    const history = getHistorialNotificaciones();
    const updated = history.map(n => n.id === id ? { ...n, leido: true } : n);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error marcando notificación:', e);
  }
}

/**
 * Subscribe to real-time in-app notification toasts
 */
export function subscribeToInAppNotifications(listener: NotificationListener): () => void {
  notificationListeners.add(listener);
  return () => {
    notificationListeners.delete(listener);
  };
}

/**
 * Emit an in-app toast notification to all active subscribers
 */
function emitInAppNotification(notif: NotificacionPush): void {
  notificationListeners.forEach(listener => {
    try {
      listener(notif);
    } catch (e) {
      console.error('Error en listener de notificación:', e);
    }
  });
}

/**
 * Format Colombian phone numbers to international WhatsApp standard (+57)
 */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('57') && digitsOnly.length >= 12) {
    return digitsOnly;
  }
  if (digitsOnly.length === 10) {
    return `57${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Generate official WhatsApp notification URL with pre-filled message
 */
export function generarEnlaceWhatsApp(telefono?: string, mensaje: string = ''): string {
  const cleanPhone = formatWhatsAppPhone(telefono);
  const encodedMsg = encodeURIComponent(mensaje);
  if (!cleanPhone) {
    return `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
}

/**
 * Generate standardized institutional notification message
 */
export function buildMensajeAlerta({
  tipo,
  estudianteNombre,
  estudianteDoc,
  gradoGrupo,
  fecha,
  hora,
  materia,
  docenteNombre
}: {
  tipo: TipoAlertaNotificacion;
  estudianteNombre: string;
  estudianteDoc?: string;
  gradoGrupo?: string;
  fecha: string;
  hora: string;
  materia?: string;
  docenteNombre?: string;
}): { titulo: string; mensaje: string; whatsappText: string } {
  const instName = 'I.E.T. FRANCISCO JOSÉ DE CALDAS - NATAGAIMA';

  if (tipo === 'TARDANZA') {
    const titulo = `⚠️ Alerta de Tardanza: ${estudianteNombre}`;
    const mensaje = `El estudiante ${estudianteNombre} (${gradoGrupo || 'Estudiante'}) registró ingreso con RETARDO hoy ${fecha} a las ${hora}${materia ? ` en la clase de ${materia}` : ''}.`;
    const whatsappText = `🏛️ *${instName}*\n🔔 *NOTIFICACIÓN OFICIAL DE RETARDO*\n\nEstimado Acudiente,\nLe informamos que el estudiante *${estudianteNombre}* (${gradoGrupo || ''}) ha ingresado a la institución con *RETARDO* el día *${fecha}* a las *${hora}*.\n${materia ? `• Materia: ${materia}\n` : ''}${docenteNombre ? `• Docente: ${docenteNombre}\n` : ''}\nPor favor dialogar con el estudiante sobre el hábito de puntualidad escolar. Ante cualquier inquietud o justificación, puede radicar la excusa en el portal de acudientes.`;
    return { titulo, mensaje, whatsappText };
  }

  if (tipo === 'INASISTENCIA') {
    const titulo = `🚨 Alerta Crítica: Inasistencia de ${estudianteNombre}`;
    const mensaje = `El estudiante ${estudianteNombre} (${gradoGrupo || 'Estudiante'}) NO registra asistencia el día ${fecha}${materia ? ` en la asignatura de ${materia}` : ''}.`;
    const whatsappText = `🏛️ *${instName}*\n🚨 *ALERTA DE INASISTENCIA ESCOLAR*\n\nEstimado Acudiente,\nLe informamos que el estudiante *${estudianteNombre}* (${gradoGrupo || ''}) se encuentra reportado como *AUSENTE / NO ASISTIÓ* el día de hoy *${fecha}*.\n${materia ? `• Asignatura: ${materia}\n` : ''}${docenteNombre ? `• Docente a cargo: ${docenteNombre}\n` : ''}\n⚠️ *Importante*: Recuerde que la acumulación de inasistencias sin justificar (20%) genera riesgo de reprobación según el SIEE y el Decreto 1290. Favor comunicarse con la coordinación o radicar la excusa médica en nuestro portal.`;
    return { titulo, mensaje, whatsappText };
  }

  if (tipo === 'SALIDA') {
    const titulo = `🚪 Control de Salida: ${estudianteNombre}`;
    const mensaje = `Se ha validado la salida de la institución del estudiante ${estudianteNombre} a las ${hora} el día ${fecha}.`;
    const whatsappText = `🏛️ *${instName}*\n🚪 *RETIRO / PASE DE SALIDA EN PORTERÍA*\n\nEstimado Acudiente,\nLe confirmamos que el estudiante *${estudianteNombre}* ha registrado su salida oficial en portería el día *${fecha}* a las *${hora}* con autorización previa.`;
    return { titulo, mensaje, whatsappText };
  }

  if (tipo === 'CONVIVENCIA') {
    const titulo = `📋 Novedad de Convivencia: ${estudianteNombre}`;
    const mensaje = `Se ha registrado una anotación en el observador escolar de ${estudianteNombre} el día ${fecha}.`;
    const whatsappText = `🏛️ *${instName}*\n📋 *OBSERVADOR DIGITAL DEL ESTUDIANTE*\n\nEstimado Acudiente,\nLe notificamos que se ha registrado una novedad de convivencia escolar para *${estudianteNombre}* el día *${fecha}*. Ingrese al Portal de Acudientes para conocer los compromisos y firmar digitalmente.`;
    return { titulo, mensaje, whatsappText };
  }

  const titulo = `📢 Aviso Institucional: ${estudianteNombre}`;
  const mensaje = `Novedad escolar registrada para ${estudianteNombre} el ${fecha} a las ${hora}.`;
  const whatsappText = `🏛️ *${instName}*\n📢 *AVISO ESCOLAR*\n\nNovedad para *${estudianteNombre}* (${fecha} - ${hora}).`;
  return { titulo, mensaje, whatsappText };
}

/**
 * Display native browser push notification
 */
export async function emitNativeBrowserNotification(titulo: string, body: string, tag: string = 'softworker-alert') {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') {
    try {
      // Try service worker first for rich actions
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).showNotification(titulo, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag,
          vibrate: [200, 100, 200],
          data: { url: '/' }
        });
        return true;
      }
    } catch (e) {
      console.log('SW notification fallback to window.Notification:', e);
    }

    try {
      const notif = new Notification(titulo, {
        body,
        icon: '/favicon.ico',
        tag
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Native notification failed:', e);
      return false;
    }
  }

  return false;
}

/**
 * Central Dispatcher: Alerts parent/acudiente in real-time when a student has a late arrival or absence
 */
export async function despacharAlertaAsistencia({
  estudiante,
  acudiente,
  tipo,
  fecha,
  hora,
  materia,
  docenteNombre,
  gradoNombre,
  grupoNombre
}: {
  estudiante: Estudiante;
  acudiente?: Acudiente;
  tipo: TipoAlertaNotificacion;
  fecha: string;
  hora: string;
  materia?: string;
  docenteNombre?: string;
  gradoNombre?: string;
  grupoNombre?: string;
}): Promise<NotificacionPush> {
  const config = getConfiguracionPush();

  // Check if this type of alert is active in settings
  if (tipo === 'TARDANZA' && !config.alertaTardanzas) {
    console.log('Alertas de tardanza desactivadas en configuración local');
  }
  if (tipo === 'INASISTENCIA' && !config.alertaInasistencias) {
    console.log('Alertas de inasistencia desactivadas en configuración local');
  }

  const gradoGrupo = `${gradoNombre || ''} ${grupoNombre || ''}`.trim();
  const { titulo, mensaje } = buildMensajeAlerta({
    tipo,
    estudianteNombre: `${estudiante.nombres} ${estudiante.apellidos}`,
    estudianteDoc: estudiante.numero_doc,
    gradoGrupo,
    fecha,
    hora,
    materia,
    docenteNombre
  });

  const notifId = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const notificacion: NotificacionPush = {
    id: notifId,
    estudiante_id: estudiante.id,
    estudiante_nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
    estudiante_documento: estudiante.numero_doc,
    grado_nombre: gradoNombre,
    grupo_nombre: grupoNombre,
    acudiente_id: acudiente?.id || estudiante.acudiente_id,
    acudiente_nombre: acudiente ? `${acudiente.nombres} ${acudiente.apellidos}` : 'Acudiente Principal',
    acudiente_telefono: acudiente?.telefono || '',
    tipo,
    titulo,
    mensaje,
    fecha,
    hora,
    materia,
    docente_nombre: docenteNombre,
    estado_envio: 'ENVIADO',
    leido: false,
    canal: 'MULTI',
    creado_el: new Date().toISOString()
  };

  // 1. Play synthesized audio alert
  playNotificationSound(tipo);

  // 2. Trigger mobile vibration
  triggerVibration(tipo === 'INASISTENCIA' ? [300, 150, 300] : [200, 100, 200]);

  // 3. Emit native Browser Push Notification
  if (config.pushHabilitado) {
    emitNativeBrowserNotification(titulo, mensaje, `softworker-${estudiante.id}`);
  }

  // 4. Emit In-App Real-time HUD toast
  emitInAppNotification(notificacion);

  // 5. Save to audit history
  guardarEnHistorialNotificaciones(notificacion);

  return notificacion;
}
