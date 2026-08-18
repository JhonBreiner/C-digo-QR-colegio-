import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  Send, 
  FileText, 
  Users, 
  Sparkles, 
  Bell, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import type { 
  Estudiante, 
  Asistencia, 
  Grado, 
  Grupo, 
  Sede, 
  Asignatura, 
  Acudiente, 
  UserRole,
  Usuario
} from '../types';

interface EarlyAlertsModuleProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  asignaturas: Asignatura[];
  acudientes: Acudiente[];
  currentRole: UserRole;
  currentUser?: Usuario;
}

export const EarlyAlertsModule: React.FC<EarlyAlertsModuleProps> = ({
  estudiantes,
  asistencias,
  grados,
  grupos,
  sedes,
  asignaturas,
  acudientes,
  currentRole,
  currentUser,
}) => {
  const [filterGrado, setFilterGrado] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICO' | 'AUSENCIAS' | 'RETARDOS'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Calculate Early Alerts for Inattendance in Classrooms
  const studentAlerts = estudiantes.map(student => {
    const studentAttendance = asistencias.filter(a => a.estudiante_id === student.id);
    
    // Count specific absences and lates
    const ausenciasCount = studentAttendance.filter(a => a.estado === 'AUSENTE').length;
    const retardosCount = studentAttendance.filter(a => a.estado === 'TARDE').length;
    const excusasCount = studentAttendance.filter(a => a.estado === 'EXCUSA').length;
    const totalSessions = studentAttendance.length;

    // Check critical failure risk per subject (>20% threshold)
    const subjectLossRisk: { asignatura: Asignatura; percent: number; ausencias: number }[] = [];
    
    asignaturas.forEach(asig => {
      const asigSessions = studentAttendance.filter(a => a.asignatura_id === asig.id);
      const asigAusencias = asigSessions.filter(a => a.estado === 'AUSENTE').length;
      
      const totalHoursTermEstimate = asig.ihs * 10;
      const lossPercentage = totalHoursTermEstimate > 0 ? (asigAusencias / totalHoursTermEstimate) * 100 : 0;

      if (lossPercentage >= 20 || asigAusencias >= 4) {
        subjectLossRisk.push({
          asignatura: asig,
          percent: Math.min(100, Math.round(lossPercentage)),
          ausencias: asigAusencias
        });
      }
    });

    const isCriticalRisk = subjectLossRisk.length > 0;
    const isAusenciasAlert = ausenciasCount >= 2;
    const isRetardosAlert = retardosCount >= 3;

    const hasAnyAlert = isCriticalRisk || isAusenciasAlert || isRetardosAlert;

    const grado = grados.find(g => g.id === student.grado_id);
    const grupo = grupos.find(g => g.id === student.grupo_id);
    const acudiente = acudientes.find(a => a.id === student.acudiente_id);

    return {
      student,
      grado,
      grupo,
      acudiente,
      ausenciasCount,
      retardosCount,
      excusasCount,
      totalSessions,
      subjectLossRisk,
      isCriticalRisk,
      isAusenciasAlert,
      isRetardosAlert,
      hasAnyAlert,
      criticalSubjects: subjectLossRisk.map(s => s.asignatura.nombre_asignatura)
    };
  }).filter(item => item.hasAnyAlert);

  // Filter list
  const filteredAlerts = studentAlerts.filter(alert => {
    if (filterGrado !== 'ALL' && alert.student.grado_id !== filterGrado) return false;
    if (filterType === 'CRITICO' && !alert.isCriticalRisk) return false;
    if (filterType === 'AUSENCIAS' && !alert.isAusenciasAlert) return false;
    if (filterType === 'RETARDOS' && !alert.isRetardosAlert) return false;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const name = `${alert.student.nombres} ${alert.student.apellidos}`.toLowerCase();
      const doc = alert.student.numero_doc.toLowerCase();
      const code = alert.student.codigo_estudiantil.toLowerCase();
      return name.includes(term) || doc.includes(term) || code.includes(term);
    }
    return true;
  });

  const totalAlertsCount = studentAlerts.length;
  const criticalLossCount = studentAlerts.filter(a => a.isCriticalRisk).length;
  const ausenciasAlertsCount = studentAlerts.filter(a => a.isAusenciasAlert).length;
  const retardosAlertsCount = studentAlerts.filter(a => a.isRetardosAlert).length;

  const handleSendWhatsApp = (alertItem: any) => {
    const student = alertItem.student;
    const phone = student.acudiente_telefono || alertItem.acudiente?.telefono || '3124598021';
    const message = encodeURIComponent(
      `*I.E.T. FRANCISCO JOSÉ DE CALDAS - NATAGAIMA*\n` +
      `Estimado(a) Acudiente ${alertItem.acudiente?.nombres || student.acudiente_nombre || 'de Familia'}:\n\n` +
      `Le informamos que el estudiante *${student.nombres} ${student.apellidos}* (${student.codigo_estudiantil}) presenta la siguiente alerta de seguimiento escolar en el aula:\n` +
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
      <div className="glass-panel border-2 border-red-500/40 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.15)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-red-600/20 via-amber-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-slate-900 border border-red-500/60 rounded-2xl text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg sm:text-2xl font-black text-white">
                ALERTAS TEMPRANAS DE ASISTENCIA EN AULA
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                Seguimiento de inasistencias en clase, retardos y riesgo de reprobación por fallas (&gt;20%)
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-300 font-mono text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>{totalAlertsCount} Estudiantes con Alertas Activas</span>
          </div>
        </div>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="glass-panel border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por estudiante, código o TI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pl-9 text-xs text-slate-100 font-mono focus:border-red-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grado Filter */}
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:border-red-500"
          >
            <option value="ALL">Todos los Grados</option>
            {grados.map(g => (
              <option key={g.id} value={g.id}>{g.nombre_grado}</option>
            ))}
          </select>

          {/* Alert Type Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterType === 'ALL' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Todos ({totalAlertsCount})
            </button>
            <button
              onClick={() => setFilterType('CRITICO')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterType === 'CRITICO' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Críticos ({criticalLossCount})
            </button>
            <button
              onClick={() => setFilterType('AUSENCIAS')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterType === 'AUSENCIAS' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Fallas ({ausenciasAlertsCount})
            </button>
            <button
              onClick={() => setFilterType('RETARDOS')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${filterType === 'RETARDOS' ? 'bg-yellow-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Retardos ({retardosAlertsCount})
            </button>
          </div>
        </div>

      </div>

      {/* Alerts Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div 
              key={alert.student.id}
              className={`glass-panel p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                alert.isCriticalRisk 
                  ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_25px_rgba(239,68,68,0.15)]' 
                  : alert.isAusenciasAlert 
                  ? 'border-amber-500/50 bg-amber-950/15'
                  : 'border-yellow-500/40 bg-yellow-950/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-orbitron text-sm border ${
                    alert.isCriticalRisk ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  }`}>
                    {alert.student.nombres[0]}{alert.student.apellidos[0]}
                  </div>
                  <div>
                    <h4 className="font-orbitron text-sm font-bold text-white">
                      {alert.student.nombres} {alert.student.apellidos}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-[#00F0FF]">
                        {alert.student.codigo_estudiantil}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[11px] font-mono text-slate-300">
                        {alert.grado?.nombre_grado} - Grupo {alert.grupo?.nombre_grupo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {alert.isCriticalRisk && (
                    <span className="inline-block px-2.5 py-1 bg-red-600/90 text-white rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-red-400">
                      Riesgo &gt;20% Fallas
                    </span>
                  )}
                  {!alert.isCriticalRisk && alert.isAusenciasAlert && (
                    <span className="inline-block px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono font-bold border border-amber-500/40">
                      Fallas Reiteradas
                    </span>
                  )}
                  {!alert.isCriticalRisk && !alert.isAusenciasAlert && alert.isRetardosAlert && (
                    <span className="inline-block px-2.5 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-[10px] font-mono font-bold border border-yellow-500/40">
                      Retardos en Aula
                    </span>
                  )}
                </div>
              </div>

              {/* Alert Indicators Matrix */}
              <div className="grid grid-cols-3 gap-2 my-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-red-300 uppercase block">Inasistencias</span>
                  <span className="font-orbitron text-base font-bold text-red-400">
                    {alert.ausenciasCount}
                  </span>
                </div>
                <div className="text-center border-x border-slate-800">
                  <span className="text-[10px] font-mono text-yellow-300 uppercase block">Retardos</span>
                  <span className="font-orbitron text-base font-bold text-yellow-400">
                    {alert.retardosCount}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-[#00FF66] uppercase block">Excusas</span>
                  <span className="font-orbitron text-base font-bold text-[#00FF66]">
                    {alert.excusasCount}
                  </span>
                </div>
              </div>

              {/* Critical Subject breakdown */}
              {alert.subjectLossRisk.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  <span className="text-[10px] font-mono text-red-300 uppercase font-bold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    Asignaturas en riesgo por límite de inasistencias:
                  </span>
                  <div className="space-y-1">
                    {alert.subjectLossRisk.map((loss, i) => (
                      <div key={i} className="flex justify-between items-center bg-red-950/40 px-2.5 py-1 rounded-lg text-xs font-mono border border-red-500/30">
                        <span className="text-slate-200">{loss.asignatura.nombre_asignatura}</span>
                        <span className="text-red-400 font-bold">{loss.ausencias} fallas ({loss.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer: Parent Info & Action */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">Acudiente Responsable:</span>
                  <span className="text-xs text-slate-200 font-semibold">
                    {alert.acudiente?.nombres || alert.student.acudiente_nombre || 'Acudiente Principal'}
                  </span>
                </div>

                <button
                  onClick={() => handleSendWhatsApp(alert)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Notificar WhatsApp</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-2 glass-panel border border-slate-800 p-8 rounded-2xl text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#00FF66] mx-auto" />
            <p className="font-mono text-sm text-slate-300 font-bold">
              No hay alertas críticas de asistencia para los filtros seleccionados
            </p>
            <p className="text-xs text-slate-500">
              Todos los estudiantes cumplen con la regularidad de asistencia en el aula de clases.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
