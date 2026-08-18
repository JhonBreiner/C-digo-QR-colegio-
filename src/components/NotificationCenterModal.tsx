import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  ShieldCheck,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Settings,
  Trash2,
  Search,
  Filter,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getConfiguracionPush,
  guardarConfiguracionPush,
  getHistorialNotificaciones,
  marcarNotificacionLeida,
  despacharAlertaAsistencia,
  generarEnlaceWhatsApp,
  buildMensajeAlerta
} from '../services/notificationService';
import type { 
  NotificacionPush, 
  ConfiguracionPushAcudiente, 
  TipoAlertaNotificacion, 
  Estudiante, 
  Acudiente, 
  Grado, 
  Grupo 
} from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiantes: Estudiante[];
  acudientes: Acudiente[];
  grados: Grado[];
  grupos: Grupo[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  estudiantes,
  acudientes,
  grados,
  grupos
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [config, setConfig] = useState<ConfiguracionPushAcudiente>(getConfiguracionPush());
  const [notifications, setNotifications] = useState<NotificacionPush[]>([]);
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'HISTORIAL' | 'CONFIGURACION' | 'SIMULADOR'>('HISTORIAL');
  const [testStudentId, setTestStudentId] = useState<string>(estudiantes[0]?.id || '');
  const [testTipo, setTestTipo] = useState<TipoAlertaNotificacion>('TARDANZA');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPermissionStatus(getNotificationPermission());
      setConfig(getConfiguracionPush());
      setNotifications(getHistorialNotificaciones());
      if (!testStudentId && estudiantes.length > 0) {
        setTestStudentId(estudiantes[0].id);
      }
    }
  }, [isOpen, estudiantes]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      const updated = guardarConfiguracionPush({ pushHabilitado: true });
      setConfig(updated);
    }
  };

  const handleToggleConfig = (key: keyof ConfiguracionPushAcudiente) => {
    const updated = guardarConfiguracionPush({ [key]: !config[key] });
    setConfig(updated);
  };

  const handleClearHistory = () => {
    if (confirm('¿Deseas limpiar el historial de notificaciones locales?')) {
      localStorage.removeItem('softworker_notifications_history_v1');
      setNotifications([]);
    }
  };

  const handleRunSimulation = async () => {
    const student = estudiantes.find((e) => e.id === testStudentId) || estudiantes[0];
    if (!student) return;

    setIsSimulating(true);
    const parent = acudientes.find((a) => a.id === student.acudiente_id);
    const grade = grados.find((g) => g.id === student.grado_id)?.nombre_grado || '';
    const group = grupos.find((g) => g.id === student.grupo_id)?.nombre_grupo || '';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    await despacharAlertaAsistencia({
      estudiante: student,
      acudiente: parent,
      tipo: testTipo,
      fecha: dateStr,
      hora: timeStr,
      materia: testTipo === 'TARDANZA' ? 'Ciencias Sociales' : 'Matemáticas',
      docenteNombre: 'Docente Titular',
      gradoNombre: grade,
      grupoNombre: group
    });

    setNotifications(getHistorialNotificaciones());
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filterType === 'TODOS' || n.tipo === filterType;
    const matchesSearch =
      searchTerm.trim() === '' ||
      n.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.acudiente_nombre && n.acudiente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      n.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0c121e] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#10192d] to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-bold text-lg text-slate-100">
                  Centro de Notificaciones Push & Alertas Web
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Push API v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Alertas en tiempo real para acudientes por retardos, inasistencias y novedades escolares
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator Banner */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Estado de Notificaciones del Navegador:</span>
            {permissionStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                AUTORIZADO (Web Push Activo)
              </span>
            ) : permissionStatus === 'denied' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-bold text-[11px]">
                <BellOff className="w-3.5 h-3.5" />
                BLOQUEADO POR EL NAVEGADOR
              </span>
            ) : permissionStatus === 'unsupported' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                NO SOPORTADO (Modo In-App Activo)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-mono font-bold text-[11px]">
                <Bell className="w-3.5 h-3.5" />
                PENDIENTE DE ACTIVACIÓN
              </span>
            )}
          </div>

          {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              Activar Notificaciones Push Ahora
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('HISTORIAL')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'HISTORIAL'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de Alertas ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('CONFIGURACION')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'CONFIGURACION'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuración & Canales
          </button>

          <button
            onClick={() => setActiveTab('SIMULADOR')}
            className={`py-3 px-4 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'SIMULADOR'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Simulador de Alerta en Vivo
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: HISTORIAL */}
          {activeTab === 'HISTORIAL' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por estudiante, acudiente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TODOS">Todos los tipos</option>
                    <option value="TARDANZA">Solo Tardanzas (Retardos)</option>
                    <option value="INASISTENCIA">Solo Inasistencias</option>
                    <option value="SALIDA">Pases de Salida</option>
                    <option value="CONVIVENCIA">Convivencia</option>
                  </select>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs font-mono text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar Historial
                  </button>
                )}
              </div>

              {/* List */}
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                  <BellOff className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-orbitron font-bold text-slate-300 text-sm">
                    No hay alertas registradas
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
                    Las alertas de retardos e inasistencias generadas automáticamente mediante escaneo QR o registro docente aparecerán listadas aquí en tiempo real.
                  </p>
                  <button
                    onClick={() => setActiveTab('SIMULADOR')}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Probar con el Simulador
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => {
                    const isLate = notif.tipo === 'TARDANZA';
                    const isAbsent = notif.tipo === 'INASISTENCIA';

                    const { whatsappText } = buildMensajeAlerta({
                      tipo: notif.tipo,
                      estudianteNombre: notif.estudiante_nombre,
                      estudianteDoc: notif.estudiante_documento,
                      gradoGrupo: `${notif.grado_nombre || ''} ${notif.grupo_nombre || ''}`.trim(),
                      fecha: notif.fecha,
                      hora: notif.hora,
                      materia: notif.materia,
                      docenteNombre: notif.docente_nombre
                    });

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isAbsent
                            ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/70'
                            : isLate
                            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70'
                            : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-xl mt-0.5 ${
                                isAbsent
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isLate
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              }`}
                            >
                              {isAbsent ? (
                                <AlertCircle className="w-5 h-5" />
                              ) : isLate ? (
                                <Clock className="w-5 h-5" />
                              ) : (
                                <Bell className="w-5 h-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    isAbsent
                                      ? 'bg-red-500/30 text-red-300'
                                      : isLate
                                      ? 'bg-amber-500/30 text-amber-300'
                                      : 'bg-cyan-500/30 text-cyan-300'
                                  }`}
                                >
                                  {isAbsent ? 'INASISTENCIA' : isLate ? 'RETARDO' : notif.tipo}
                                </span>
                                <h4 className="font-semibold text-sm text-slate-100">
                                  {notif.estudiante_nombre}
                                </h4>
                                {notif.grado_nombre && (
                                  <span className="text-[11px] font-mono text-slate-400">
                                    ({notif.grado_nombre} {notif.grupo_nombre})
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 mt-1">{notif.mensaje}</p>

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                                <span>📅 {notif.fecha} a las {notif.hora}</span>
                                {notif.materia && <span>📚 {notif.materia}</span>}
                                {notif.acudiente_nombre && (
                                  <span>👤 Acudiente: {notif.acudiente_nombre}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {notif.acudiente_telefono && (
                              <a
                                href={generarEnlaceWhatsApp(notif.acudiente_telefono, whatsappText)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                WhatsApp ({notif.acudiente_telefono})
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONFIGURACION */}
          {activeTab === 'CONFIGURACION' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <h5 className="font-bold text-cyan-200 font-mono">
                    Canales de Notificación Push Institucional (Push API)
                  </h5>
                  <p>
                    El sistema combina <strong>Web Notifications de escritorio y móvil</strong>, <strong>sintetizador de sonido</strong>, <strong>vibración háptica</strong> y <strong>enlaces rápidos a WhatsApp</strong> para asegurar que los padres de familia y acudientes reciban avisos inmediatos en caso de tardanza o inasistencia escolar.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-orbitron font-bold text-sm text-slate-200">
                  Preferencias de Alertas y Notificaciones
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Push API Browser Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-xs text-slate-200">
                          Notificaciones Web Push (Navegador)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Muestra ventanas flotantes emergentes en tu dispositivo
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.pushHabilitado}
                      onChange={() => handleToggleConfig('pushHabilitado')}
                      className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Audio Synthesizer Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-xs text-slate-200">
                          Alertas Sonoras y Chimes Web Audio
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Reproduce un tono audible diferenciado ante tardanzas
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.sonidoHabilitado}
                      onChange={() => handleToggleConfig('sonidoHabilitado')}
                      className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Tardanzas Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="font-medium text-xs text-slate-200">
                          Alertar Tardanzas y Retardos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Notifica automáticamente cuando el ingreso sea después de 7:15 AM
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.alertaTardanzas}
                      onChange={() => handleToggleConfig('alertaTardanzas')}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Inasistencias Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="font-medium text-xs text-slate-200">
                          Alertar Inasistencias Críticas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Alerta cuando un docente marque ausencia en su materia
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.alertaInasistencias}
                      onChange={() => handleToggleConfig('alertaInasistencias')}
                      className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                    />
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULADOR */}
          {activeTab === 'SIMULADOR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                <h4 className="font-orbitron font-bold text-sm text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Prueba en Vivo del Servicio de Notificaciones Push
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Usa este panel para disparar una alerta instantánea y verificar la respuesta de tu navegador (Push API), sonido de alerta y la vista previa del mensaje que recibe el acudiente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Seleccionar Estudiante para la Prueba:
                  </label>
                  <select
                    value={testStudentId}
                    onChange={(e) => setTestStudentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {estudiantes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombres} {e.apellidos} ({e.codigo_estudiantil})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">
                    Tipo de Novedad a Notificar:
                  </label>
                  <select
                    value={testTipo}
                    onChange={(e) => setTestTipo(e.target.value as TipoAlertaNotificacion)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TARDANZA">⚠️ Retardo / Ingreso Tarde</option>
                    <option value="INASISTENCIA">🚨 Inasistencia a Clase</option>
                    <option value="SALIDA">🚪 Pase de Salida Efectuado</option>
                    <option value="CONVIVENCIA">📋 Observador de Convivencia</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h5 className="font-mono text-xs font-bold text-slate-300">
                  Vista previa de la Notificación a emitir:
                </h5>
                {(() => {
                  const student = estudiantes.find((e) => e.id === testStudentId) || estudiantes[0];
                  const parent = acudientes.find((a) => a.id === student?.acudiente_id);
                  const { titulo, mensaje } = buildMensajeAlerta({
                    tipo: testTipo,
                    estudianteNombre: student ? `${student.nombres} ${student.apellidos}` : 'Estudiante',
                    estudianteDoc: student?.numero_doc,
                    fecha: new Date().toISOString().split('T')[0],
                    hora: '07:22 AM',
                    materia: testTipo === 'TARDANZA' ? 'Ciencias Sociales' : 'Matemáticas'
                  });

                  return (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-100">{titulo}</div>
                      <div className="text-slate-300">{mensaje}</div>
                      <div className="text-[11px] font-mono text-emerald-400 pt-1">
                        Destinatario Acudiente: {parent ? `${parent.nombres} ${parent.apellidos} (${parent.telefono})` : 'Acudiente Principal'}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-mono font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSimulating ? 'Disparando Notificación...' : 'Disparar Notificación Push en Tiempo Real'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Softworker Push Service • I.E.T. Francisco José de Caldas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
