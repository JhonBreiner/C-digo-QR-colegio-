import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  MessageSquare,
  Volume2
} from 'lucide-react';
import { 
  subscribeToInAppNotifications, 
  generarEnlaceWhatsApp, 
  buildMensajeAlerta,
  marcarNotificacionLeida 
} from '../services/notificationService';
import type { NotificacionPush } from '../types';

export const NotificationToastContainer: React.FC<{
  onOpenNotificationCenter?: () => void;
}> = ({ onOpenNotificationCenter }) => {
  const [toasts, setToasts] = useState<NotificacionPush[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((newNotif) => {
      setToasts((prev) => [newNotif, ...prev.slice(0, 4)]); // Keep max 5 visible toasts
    });
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    marcarNotificacionLeida(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenWhatsApp = (toast: NotificacionPush) => {
    const { whatsappText } = buildMensajeAlerta({
      tipo: toast.tipo,
      estudianteNombre: toast.estudiante_nombre,
      estudianteDoc: toast.estudiante_documento,
      gradoGrupo: `${toast.grado_nombre || ''} ${toast.grupo_nombre || ''}`.trim(),
      fecha: toast.fecha,
      hora: toast.hora,
      materia: toast.materia,
      docenteNombre: toast.docente_nombre
    });

    const url = generarEnlaceWhatsApp(toast.acudiente_telefono, whatsappText);
    window.open(url, '_blank');
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isLate = toast.tipo === 'TARDANZA';
        const isAbsent = toast.tipo === 'INASISTENCIA';
        
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-xl animate-in slide-in-from-right-5 ${
              isAbsent
                ? 'bg-red-950/90 border-red-500/60 shadow-red-950/50 text-red-100'
                : isLate
                ? 'bg-amber-950/90 border-amber-500/60 shadow-amber-950/50 text-amber-100'
                : 'bg-slate-900/95 border-cyan-500/60 shadow-cyan-950/50 text-cyan-100'
            }`}
          >
            {/* Ambient Cyber Top Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                isAbsent ? 'bg-red-500' : isLate ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
            />

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                  isAbsent
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : isLate
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isAbsent ? (
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                ) : isLate ? (
                  <Clock className="w-5 h-5 animate-spin-slow" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isAbsent
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : isLate
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {isAbsent ? '🚨 INASISTENCIA' : isLate ? '⚠️ RETARDO ENTRADA' : '🔔 NOVEDAD'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {toast.hora}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-100 mt-1 truncate">
                  {toast.estudiante_nombre}
                </h4>

                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.mensaje}
                </p>

                {toast.acudiente_nombre && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="text-slate-500">Acudiente:</span>
                    <span className="text-slate-200 font-medium">{toast.acudiente_nombre}</span>
                    {toast.acudiente_telefono && (
                      <span className="text-emerald-400 font-mono">({toast.acudiente_telefono})</span>
                    )}
                  </div>
                )}

                {/* Quick Action buttons */}
                <div className="mt-3 flex items-center gap-2">
                  {toast.acudiente_telefono && (
                    <button
                      onClick={() => handleOpenWhatsApp(toast)}
                      className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      WhatsApp Acudiente
                    </button>
                  )}

                  {onOpenNotificationCenter && (
                    <button
                      onClick={onOpenNotificationCenter}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Historial
                    </button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleDismiss(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
