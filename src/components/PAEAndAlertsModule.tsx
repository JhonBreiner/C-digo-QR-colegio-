import React, { useState } from 'react';
import { 
  Utensils, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  QrCode, 
  ScanLine, 
  Clock, 
  Send, 
  FileText, 
  Users, 
  Monitor, 
  BookOpen, 
  Sparkles, 
  Bell, 
  Phone, 
  MessageSquare, 
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { 
  Estudiante, 
  Asistencia, 
  RegistroPAE, 
  TipoServicioPAE, 
  Grado, 
  Grupo, 
  Sede, 
  Asignatura, 
  Acudiente, 
  UserRole,
  Usuario
} from '../types';

interface PAEAndAlertsModuleProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  registrosPAE: RegistroPAE[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  asignaturas: Asignatura[];
  acudientes: Acudiente[];
  currentRole: UserRole;
  currentUser?: Usuario;
  onRegisterPAE: (nuevoRegistro: Omit<RegistroPAE, 'id'>) => Promise<void> | void;
}

export const PAEAndAlertsModule: React.FC<PAEAndAlertsModuleProps> = ({
  estudiantes,
  asistencias,
  registrosPAE,
  grados,
  grupos,
  sedes,
  asignaturas,
  acudientes,
  currentRole,
  currentUser,
  onRegisterPAE,
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTAS' | 'PAE_SCANNER' | 'PAE_HISTORIAL'>('ALERTAS');
  
  // PAE Scanner States
  const [servicioSeleccionado, setServicioSeleccionado] = useState<TipoServicioPAE>('ALMUERZO');
  const [studentInput, setStudentInput] = useState<string>('');
  const [paeScanStatus, setPaeScanStatus] = useState<'IDLE' | 'SUCCESS' | 'DUPLICATE' | 'NOT_FOUND'>('IDLE');
  const [lastDeliveredStudent, setLastDeliveredStudent] = useState<Estudiante | null>(null);
  const [lastDeliveredRecord, setLastDeliveredRecord] = useState<RegistroPAE | null>(null);
  const [duplicateDetails, setDuplicateDetails] = useState<string>('');
  const [equipoNumero, setEquipoNumero] = useState<string>('PC-05');

  // WhatsApp Alert Modal States
  const [selectedAlertStudent, setSelectedAlertStudent] = useState<any | null>(null);
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);

  // 1. CALCULATE INTELLIGENT ATTENDANCE ALERTS
  const attendanceAlerts = estudiantes.map(student => {
    const studentRecords = asistencias.filter(a => a.estudiante_id === student.id);
    const retardosCount = studentRecords.filter(a => a.estado === 'TARDE').length;
    const ausenciasCount = studentRecords.filter(a => a.estado === 'AUSENTE').length;
    
    // Check if close to failing any subject (> 20% absences)
    let criticalSubjects: string[] = [];
    asignaturas.forEach(asig => {
      const subjectRecords = studentRecords.filter(a => a.asignatura_id === asig.id);
      const subjectAusencias = subjectRecords.filter(a => a.estado === 'AUSENTE').length;
      if (subjectRecords.length > 0 && (subjectAusencias / subjectRecords.length >= 0.2 || subjectAusencias >= 3)) {
        criticalSubjects.push(asig.nombre_asignatura);
      }
    });

    const isRetardosAlert = retardosCount >= 3;
    const isAusenciasAlert = ausenciasCount >= 2;
    const isCriticalLoss = criticalSubjects.length > 0;

    let alertSeverity: 'NONE' | 'RETARDOS' | 'AUSENCIAS' | 'CRITICA' = 'NONE';
    if (isCriticalLoss) alertSeverity = 'CRITICA';
    else if (isAusenciasAlert) alertSeverity = 'AUSENCIAS';
    else if (isRetardosAlert) alertSeverity = 'RETARDOS';

    const grado = grados.find(g => g.id === student.grado_id);
    const grupo = grupos.find(g => g.id === student.grupo_id);
    const acudiente = acudientes.find(a => a.id === student.acudiente_id);

    return {
      student,
      grado,
      grupo,
      acudiente,
      retardosCount,
      ausenciasCount,
      criticalSubjects,
      alertSeverity,
      hasAlert: alertSeverity !== 'NONE'
    };
  }).filter(item => item.hasAlert);

  // Stats
  const totalAlertsCount = attendanceAlerts.length;
  const criticalLossCount = attendanceAlerts.filter(a => a.alertSeverity === 'CRITICA').length;
  const ausenciasAlertsCount = attendanceAlerts.filter(a => a.alertSeverity === 'AUSENCIAS').length;
  const retardosAlertsCount = attendanceAlerts.filter(a => a.alertSeverity === 'RETARDOS').length;

  // PAE Today Stats
  const todayDate = new Date().toISOString().split('T')[0];
  const todayPAERecords = registrosPAE.filter(r => r.fecha === todayDate);
  const todayDesayunos = todayPAERecords.filter(r => r.tipo_servicio === 'DESAYUNO').length;
  const todayAlmuerzos = todayPAERecords.filter(r => r.tipo_servicio === 'ALMUERZO').length;
  const todaySalas = todayPAERecords.filter(r => r.tipo_servicio === 'SALA_SISTEMAS').length;

  // Handle Deliver PAE Meal via Scan or Input
  const handleDeliverPAE = async (query: string) => {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return;

    const studentFound = estudiantes.find(e => 
      e.id.toLowerCase() === cleanQ ||
      e.codigo_estudiantil.toLowerCase() === cleanQ ||
      e.numero_doc.toLowerCase() === cleanQ ||
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(cleanQ)
    );

    if (!studentFound) {
      setPaeScanStatus('NOT_FOUND');
      setLastDeliveredStudent(null);
      setLastDeliveredRecord(null);
      return;
    }

    setLastDeliveredStudent(studentFound);

    // Duplicate Check: Has student already claimed this specific service today?
    const alreadyClaimed = registrosPAE.find(r => 
      r.estudiante_id === studentFound.id &&
      r.fecha === todayDate &&
      r.tipo_servicio === servicioSeleccionado
    );

    if (alreadyClaimed) {
      setPaeScanStatus('DUPLICATE');
      setLastDeliveredRecord(alreadyClaimed);
      setDuplicateDetails(`El estudiante ya recibió su ración de ${servicioSeleccionado} a las ${alreadyClaimed.hora} con el operador.`);
      return;
    }

    // Success: Register Meal Delivery
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const grado = grados.find(g => g.id === studentFound.grado_id);
    const grupo = grupos.find(g => g.id === studentFound.grupo_id);

    const newRecord: Omit<RegistroPAE, 'id'> = {
      estudiante_id: studentFound.id,
      estudiante_nombre: `${studentFound.nombres} ${studentFound.apellidos}`,
      estudiante_documento: studentFound.numero_doc,
      grado_nombre: grado?.nombre_grado || '11° Grado',
      grupo_nombre: grupo?.nombre_grupo || '01',
      fecha: todayDate,
      hora: timeStr,
      tipo_servicio: servicioSeleccionado,
      operador_entrega: currentUser?.nombre_display || 'Operador PAE Sede Principal',
      observacion: servicioSeleccionado === 'SALA_SISTEMAS' ? `Asignado Equipo: ${equipoNumero}` : 'Ración verificada entregada con éxito',
      equipo_numero: servicioSeleccionado === 'SALA_SISTEMAS' ? equipoNumero : undefined
    };

    await onRegisterPAE(newRecord);
    setPaeScanStatus('SUCCESS');
    setLastDeliveredRecord({ id: `PAE-${Date.now().toString().slice(-4)}`, ...newRecord });
    setStudentInput('');
  };

  const handleSendWhatsApp = (alertItem: any) => {
    const student = alertItem.student;
    const phone = student.acudiente_telefono || alertItem.acudiente?.telefono || '3124598021';
    const message = encodeURIComponent(
      `*I.E.T. FRANCISCO JOSÉ DE CALDAS - NATAGAIMA*\n` +
      `Estimado(a) Acudiente ${alertItem.acudiente?.nombres || student.acudiente_nombre || 'de Familia'}:\n\n` +
      `Le informamos que el estudiante *${student.nombres} ${student.apellidos}* (${student.codigo_estudiantil}) presenta la siguiente alerta de seguimiento escolar:\n` +
      `• Retardos Acumulados: ${alertItem.retardosCount}\n` +
      `• Inasistencias Sin Justificar: ${alertItem.ausenciasCount}\n` +
      `${alertItem.criticalSubjects.length > 0 ? `• Materias en Riesgo por Fallas: ${alertItem.criticalSubjects.join(', ')}\n` : ''}` +
      `\nPor favor presentarse o justificar formalmente en Coordinación Académica.`
    );
    window.open(`https://wa.me/57${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header Banner */}
      <div className="glass-panel border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-[#00FF66]/20 via-emerald-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-slate-900 border border-[#00FF66]/60 rounded-2xl text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.25)]">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg sm:text-2xl font-black text-white">
                ALERTAS INTELIGENTES Y MÓDULO PAE
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                Notificación temprana de inasistencias y entrega de raciones escolares
              </p>
            </div>
          </div>

          {/* Sub-tabs switch */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('ALERTAS')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ALERTAS'
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alertas ({totalAlertsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('PAE_SCANNER')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'PAE_SCANNER'
                  ? 'bg-gradient-to-r from-[#00FF66] to-[#00F0FF] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Escáner PAE / Salas</span>
            </button>

            <button
              onClick={() => setActiveTab('PAE_HISTORIAL')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'PAE_HISTORIAL'
                  ? 'bg-gradient-to-r from-[#00FF66] to-[#00F0FF] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Raciones Hoy ({todayPAERecords.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SMART ATTENDANCE ALERTS */}
      {activeTab === 'ALERTAS' && (
        <div className="space-y-6">
          
          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total Alertas Activas</span>
              <p className="font-orbitron text-2xl font-black text-amber-400 mt-1">
                {totalAlertsCount}
              </p>
              <span className="text-[10px] font-mono text-slate-500">Estudiantes Monitoreados</span>
            </div>

            <div className="glass-panel border border-red-500/30 p-4 rounded-2xl bg-red-950/20">
              <span className="text-[10px] font-mono text-red-300 uppercase">Riesgo Reprobación (&gt;20%)</span>
              <p className="font-orbitron text-2xl font-black text-red-400 mt-1">
                {criticalLossCount}
              </p>
              <span className="text-[10px] font-mono text-red-200/60">En Peligro por Inasistencias</span>
            </div>

            <div className="glass-panel border border-amber-500/30 p-4 rounded-2xl bg-amber-950/20">
              <span className="text-[10px] font-mono text-amber-300 uppercase">2+ Inasistencias Injustificadas</span>
              <p className="font-orbitron text-2xl font-black text-amber-300 mt-1">
                {ausenciasAlertsCount}
              </p>
              <span className="text-[10px] font-mono text-amber-200/60">Notificación a Acudiente</span>
            </div>

            <div className="glass-panel border border-yellow-500/30 p-4 rounded-2xl bg-yellow-950/20">
              <span className="text-[10px] font-mono text-yellow-300 uppercase">3+ Retardos Acumulados</span>
              <p className="font-orbitron text-2xl font-black text-yellow-400 mt-1">
                {retardosAlertsCount}
              </p>
              <span className="text-[10px] font-mono text-yellow-200/60">Llamado de Atención</span>
            </div>
          </div>

          {/* Alerts List */}
          <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-orbitron text-sm sm:text-base font-bold text-white uppercase">
                  ESTUDIANTES CON ALERTAS AUTOMÁTICAS DE ASISTENCIA
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Notificación automática por 3 retardos o 2 inasistencias
              </span>
            </div>

            {attendanceAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                ✅ No hay estudiantes con alertas críticas de retardos o inasistencias en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceAlerts.map((alert, idx) => (
                  <div
                    key={alert.student.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.alertSeverity === 'CRITICA'
                        ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                        : alert.alertSeverity === 'AUSENCIAS'
                        ? 'bg-amber-950/40 border-amber-500/80'
                        : 'bg-yellow-950/30 border-yellow-500/60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      <div className="flex items-start space-x-3.5">
                        <img
                          src={alert.student.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                          alt="Foto"
                          className="w-12 h-12 rounded-xl object-cover border border-white/20"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-orbitron text-sm font-bold text-white">
                              {alert.student.nombres} {alert.student.apellidos}
                            </h4>
                            <span className="text-xs font-mono text-slate-300">
                              ({alert.grado?.nombre_grado} • Grupo {alert.grupo?.nombre_grupo})
                            </span>
                          </div>

                          <p className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                            <span className="text-yellow-400 font-bold">
                              ⏰ {alert.retardosCount} Retardos
                            </span>
                            <span className="text-red-400 font-bold">
                              ⛔ {alert.ausenciasCount} Inasistencias
                            </span>
                            <span className="text-slate-400">
                              Acudiente: {alert.acudiente?.nombres || alert.student.acudiente_nombre} ({alert.student.acudiente_telefono || '3124598021'})
                            </span>
                          </p>

                          {alert.criticalSubjects.length > 0 && (
                            <p className="text-xs font-mono text-red-300 mt-1 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-500/40">
                              ⚠️ En riesgo de pérdida por inasistencias en: <strong className="text-white">{alert.criticalSubjects.join(', ')}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons: WhatsApp Notification & Citation */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleSendWhatsApp(alert)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                          title="Enviar notificación instantánea a WhatsApp del acudiente"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Notificar WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAlertStudent(alert);
                            setShowCitationModal(true);
                          }}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Citación Formal</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PAE & SPECIAL ROOMS SCANNER */}
      {activeTab === 'PAE_SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Service Selector & Scanner */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-[#00FF66]" />
                  <h3 className="font-orbitron text-sm font-bold text-white uppercase">
                    CONTROL DE ENTREGA PAE Y ACCESO A SALAS
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#00FF66] font-bold">
                  {todayDate}
                </span>
              </div>

              {/* Service Type Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-2">
                  Selecciona el Servicio Activo a Entregar / Validar:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DESAYUNO', label: 'Desayuno PAE', icon: Utensils },
                    { id: 'ALMUERZO', label: 'Almuerzo PAE', icon: Utensils },
                    { id: 'REFRIGERIO', label: 'Refrigerio', icon: Utensils },
                    { id: 'SALA_SISTEMAS', label: 'Sala Sistemas', icon: Monitor },
                    { id: 'BIBLIOTECA', label: 'Biblioteca', icon: BookOpen },
                  ].map(serv => (
                    <button
                      key={serv.id}
                      type="button"
                      onClick={() => {
                        setServicioSeleccionado(serv.id as any);
                        setPaeScanStatus('IDLE');
                      }}
                      className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        servicioSeleccionado === serv.id
                          ? 'bg-gradient-to-r from-[#00FF66] to-[#00F0FF] text-slate-950 shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <serv.icon className="w-3.5 h-3.5" />
                      <span>{serv.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Computer Number if Sala Sistemas */}
              {servicioSeleccionado === 'SALA_SISTEMAS' && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono">
                  <label className="block text-slate-300 mb-1 uppercase">
                    Equipo de Cómputo Asignado:
                  </label>
                  <input
                    type="text"
                    value={equipoNumero}
                    onChange={(e) => setEquipoNumero(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-1.5 focus:border-[#00F0FF] focus:outline-none"
                    placeholder="Ej: PC-05 / Portátil 12"
                  />
                </div>
              )}

              {/* Scan / Search Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeliverPAE(studentInput);
                }}
                className="space-y-3 pt-2"
              >
                <label className="block text-xs font-mono text-slate-300 uppercase">
                  Escanear Carné QR del Alumno o Ingresar Documento:
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder="Ej: 2026-CALDAS-001 o 1098234561"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-[#00FF66] focus:outline-none pl-10"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 neon-btn-green rounded-xl font-mono text-xs font-bold transition-all shadow-md"
                  >
                    Registrar
                  </button>
                </div>
              </form>

              {/* Preset Sample Students for Instant Test */}
              <div className="pt-3 border-t border-slate-800">
                <span className="block text-[10px] font-mono text-slate-500 uppercase mb-2">
                  Simulación de fila del restaurante (Alumnos de prueba):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {estudiantes.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStudentInput(st.codigo_estudiantil);
                        handleDeliverPAE(st.codigo_estudiantil);
                      }}
                      className="text-left p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 transition-all truncate"
                    >
                      <span className="font-bold text-white block truncate">{st.nombres}</span>
                      <span className="text-[10px] text-[#00FF66]">{st.codigo_estudiantil}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Scan Result Card & Verification */}
          <div className="lg:col-span-6 space-y-4">
            {paeScanStatus === 'IDLE' ? (
              <div className="h-full glass-panel border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-orbitron text-base font-bold text-slate-300">
                  MOSTRADOR PAE LISTO PARA ENTREGA
                </h3>
                <p className="text-xs font-mono max-w-sm">
                  Acerca el carné digital o celular del estudiante. El sistema validará automáticamente la entrega y evitará reclamos duplicados.
                </p>
              </div>
            ) : paeScanStatus === 'SUCCESS' && lastDeliveredStudent ? (
              /* Success Green Delivery Card */
              <div className="glass-panel border-2 border-[#00FF66] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.25)] space-y-4 animate-fadeIn bg-slate-950/95">
                <div className="flex items-center space-x-2 border-b border-emerald-900/60 pb-3">
                  <CheckCircle2 className="w-6 h-6 text-[#00FF66]" />
                  <h3 className="font-orbitron text-base font-black text-[#00FF66]">
                    ✅ RACIÓN ENTREGADA EXITOSAMENTE
                  </h3>
                </div>

                <div className="flex items-center space-x-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <img
                    src={lastDeliveredStudent.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt="Alumno"
                    className="w-16 h-16 rounded-xl object-cover border border-[#00FF66]"
                  />
                  <div>
                    <h4 className="font-orbitron text-base font-bold text-white">
                      {lastDeliveredStudent.nombres} {lastDeliveredStudent.apellidos}
                    </h4>
                    <p className="text-xs font-mono text-slate-300">
                      Cód: {lastDeliveredStudent.codigo_estudiantil} • Doc: {lastDeliveredStudent.numero_doc}
                    </p>
                    <p className="text-xs font-mono text-[#00FF66] mt-0.5 font-bold">
                      Servicio: {servicioSeleccionado} • Hora: {lastDeliveredRecord?.hora}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Operador: <strong>{lastDeliveredRecord?.operador_entrega}</strong></span>
                  <span>Fecha: {todayDate}</span>
                </div>
              </div>
            ) : paeScanStatus === 'DUPLICATE' ? (
              /* Duplicate Red Warning Card */
              <div className="glass-panel border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4 animate-fadeIn bg-red-950/40">
                <div className="flex items-center space-x-3 border-b border-red-900 pb-3">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0 animate-bounce" />
                  <div>
                    <h3 className="font-orbitron text-base font-black text-red-200">
                      ⚠️ RACIÓN YA RECLAMADA HOY (DUPLICADO)
                    </h3>
                    <p className="text-xs font-mono text-red-300">
                      NO ENTREGAR RACIÓN ADICIONAL
                    </p>
                  </div>
                </div>

                <p className="text-xs font-mono text-white bg-slate-950 p-4 rounded-2xl border border-red-900">
                  {duplicateDetails}
                </p>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Estudiante: <strong className="text-white">{lastDeliveredStudent?.nombres}</strong></span>
                  <span className="text-red-400 font-bold">Intento Bloqueado</span>
                </div>
              </div>
            ) : (
              /* Not Found Card */
              <div className="glass-panel border-2 border-amber-500 rounded-3xl p-6 shadow-xl space-y-3 bg-slate-950">
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-orbitron text-sm font-bold">ESTUDIANTE NO ENCONTRADO</h3>
                </div>
                <p className="text-xs font-mono text-slate-300">
                  Verifica que el código o documento ingresado pertenezca a un estudiante activo de la institución.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: PAE TODAY LOGS */}
      {activeTab === 'PAE_HISTORIAL' && (
        <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-orbitron text-sm sm:text-base font-bold text-white">
                REGISTRO DIARIO DE RACIONES PAE Y SALAS
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Trazabilidad oficial de raciones alimentarias entregadas
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-xl text-[#00FF66] border border-slate-800">
              {todayPAERecords.length} Raciones Hoy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID Registro</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Grado</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Hora Entrega</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {registrosPAE.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-[#00FF66]">{reg.id}</td>
                    <td className="p-3 font-bold text-white">{reg.estudiante_nombre}</td>
                    <td className="p-3 text-slate-300">{reg.grado_nombre}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40">
                        {reg.tipo_servicio}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{reg.hora}</td>
                    <td className="p-3 text-slate-400">{reg.operador_entrega}</td>
                    <td className="p-3 text-slate-400">{reg.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Citation Modal */}
      {showCitationModal && selectedAlertStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-950 border-2 border-amber-500 rounded-3xl p-6 space-y-4">
            <h3 className="font-orbitron text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              CITACIÓN FORMAL A ACUDIENTE
            </h3>
            
            <p className="text-xs font-mono text-slate-300">
              Se expedirá citación formal para el acudiente de <strong className="text-white">{selectedAlertStudent.student.nombres} {selectedAlertStudent.student.apellidos}</strong> con motivo de:
            </p>

            <div className="p-3.5 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 space-y-1">
              <div>• Retardos acumulados: <strong className="text-yellow-400">{selectedAlertStudent.retardosCount}</strong></div>
              <div>• Inasistencias sin justificar: <strong className="text-red-400">{selectedAlertStudent.ausenciasCount}</strong></div>
              <div>• Fecha citación: <strong>Inmediata en Rectoría/Coordinación</strong></div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowCitationModal(false)}
                className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl text-xs font-mono"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert("¡Citación formal generada y registrada en el expediente del estudiante!");
                  setShowCitationModal(false);
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-mono font-bold"
              >
                Imprimir Citación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
