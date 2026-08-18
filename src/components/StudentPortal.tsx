import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  QrCode, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Maximize2, 
  Minimize2, 
  Download, 
  HeartPulse, 
  Building2, 
  Phone, 
  User, 
  Award, 
  DoorOpen, 
  Sparkles, 
  Activity,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import QRCode from 'qrcode';
import { SchoolCrest } from './SchoolCrest';
import type { 
  Estudiante, 
  Asistencia, 
  Excusa, 
  PaseSalida, 
  AnotacionObservador, 
  Grado, 
  Grupo, 
  Sede, 
  Asignatura, 
  EPS, 
  Acudiente, 
  Usuario 
} from '../types';

interface StudentPortalProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  excusas: Excusa[];
  pasesSalida: PaseSalida[];
  anotacionesObservador: AnotacionObservador[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  asignaturas: Asignatura[];
  epsList: EPS[];
  acudientes: Acudiente[];
  currentUser?: Usuario;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  estudiantes,
  asistencias,
  excusas,
  pasesSalida,
  anotacionesObservador,
  grados,
  grupos,
  sedes,
  asignaturas,
  epsList,
  acudientes,
  currentUser,
}) => {
  // Find logged-in student if any, or default to first student
  const defaultStudent = () => {
    if (currentUser?.rol === 'ESTUDIANTE' && currentUser.referencia_id) {
      const match = estudiantes.find(e => e.id === currentUser.referencia_id || e.codigo_estudiantil === currentUser.referencia_id);
      if (match) return match;
    }
    return estudiantes[0] || null;
  };

  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(defaultStudent());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isHighContrastMode, setIsHighContrastMode] = useState<boolean>(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'ASISTENCIAS' | 'PASES' | 'EXCUSAS' | 'OBSERVADOR'>('ASISTENCIAS');
  const [isFullscreenCard, setIsFullscreenCard] = useState<boolean>(false);

  // Sync when student changes
  useEffect(() => {
    if (!selectedStudent && estudiantes.length > 0) {
      setSelectedStudent(estudiantes[0]);
    }
  }, [estudiantes, selectedStudent]);

  // Generate High-Contrast QR Code for Student Card
  useEffect(() => {
    if (!selectedStudent) return;

    const qrPayload = JSON.stringify({
      id: selectedStudent.id,
      cod: selectedStudent.codigo_estudiantil,
      doc: selectedStudent.numero_doc,
      nom: `${selectedStudent.nombres} ${selectedStudent.apellidos}`,
      gra: selectedStudent.grado_id,
      gru: selectedStudent.grupo_id,
      rh: selectedStudent.rh,
      ins: 'I.E.T. Francisco José de Caldas - Natagaima'
    });

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 1,
      color: {
        dark: isHighContrastMode ? '#000000' : '#00F0FF',
        light: isHighContrastMode ? '#FFFFFF' : '#070b12',
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error("Error generating student QR:", err));
  }, [selectedStudent, isHighContrastMode]);

  if (!selectedStudent) {
    return (
      <div className="p-8 text-center glass-panel border border-slate-800 rounded-3xl">
        <p className="text-slate-400 font-mono">No hay estudiantes registrados en la base de datos.</p>
      </div>
    );
  }

  // Relations
  const grado = grados.find(g => g.id === selectedStudent.grado_id);
  const grupo = grupos.find(g => g.id === selectedStudent.grupo_id);
  const sede = sedes.find(s => s.id === selectedStudent.sede_id);
  const eps = epsList.find(e => e.id === selectedStudent.eps_id);
  const acudiente = acudientes.find(a => a.id === selectedStudent.acudiente_id);

  // Student specific records
  const studentAsistencias = asistencias.filter(a => a.estudiante_id === selectedStudent.id);
  const studentPases = pasesSalida.filter(p => p.estudiante_id === selectedStudent.id);
  const studentExcusas = excusas.filter(e => e.estudiante_id === selectedStudent.id);
  const studentObservaciones = anotacionesObservador.filter(o => o.estudiante_id === selectedStudent.id);

  // Global attendance stats
  const totalClases = studentAsistencias.length;
  const presentesCount = studentAsistencias.filter(a => a.estado === 'PRESENTE').length;
  const tardiasCount = studentAsistencias.filter(a => a.estado === 'TARDE').length;
  const excusadasCount = studentAsistencias.filter(a => a.estado === 'EXCUSADO').length;
  const ausentesCount = studentAsistencias.filter(a => a.estado === 'AUSENTE').length;

  const globalAttendanceRate = totalClases > 0 
    ? Math.round(((presentesCount + excusadasCount + tardiasCount * 0.7) / Math.max(totalClases, 1)) * 100)
    : 100;

  // Subject-specific attendance calculation & failure risk analysis
  const subjectStats = asignaturas.map(asig => {
    const subjectRecords = studentAsistencias.filter(a => a.asignatura_id === asig.id);
    const countTotal = subjectRecords.length;
    const countPresent = subjectRecords.filter(a => a.estado === 'PRESENTE').length;
    const countTardes = subjectRecords.filter(a => a.estado === 'TARDE').length;
    const countExcusadas = subjectRecords.filter(a => a.estado === 'EXCUSADO').length;
    const countAusentes = subjectRecords.filter(a => a.estado === 'AUSENTE').length;

    // Attendance percentage
    const rate = countTotal > 0 
      ? Math.round(((countPresent + countExcusadas + countTardes * 0.7) / countTotal) * 100)
      : 100;

    // Absences rate (Ausencias sin justificar)
    const absencePercent = countTotal > 0 
      ? Math.round((countAusentes / countTotal) * 100)
      : 0;

    // Critical failure risk threshold: > 20% unexcused absences
    const isCriticalRisk = absencePercent >= 20 || countAusentes >= 3;
    const isWarningRisk = absencePercent >= 10 || countAusentes >= 2;

    return {
      asignatura: asig,
      countTotal,
      countPresent,
      countTardes,
      countExcusadas,
      countAusentes,
      rate,
      absencePercent,
      isCriticalRisk,
      isWarningRisk
    };
  }).filter(s => s.countTotal > 0 || asignaturas.slice(0, 6).some(a => a.id === s.asignatura.id));

  // Count critical subjects
  const criticalSubjectsCount = subjectStats.filter(s => s.isCriticalRisk).length;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `CARNE-QR-${selectedStudent.codigo_estudiantil}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Welcome & Student Switcher Bar */}
      <div className="glass-panel border-2 border-[#00F0FF]/40 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-[#00F0FF]/20 via-[#7000FF]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={selectedStudent.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt={selectedStudent.nombres}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#00F0FF] shadow-lg shadow-[#00F0FF]/20"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-slate-950 border border-[#00FF66] rounded-full text-[#00FF66]">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 uppercase">
                  Portal del Estudiante
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  RH: {selectedStudent.rh || 'O+'}
                </span>
              </div>
              
              <h1 className="font-orbitron text-xl sm:text-2xl font-black text-white mt-1">
                {selectedStudent.nombres} {selectedStudent.apellidos}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-[#00FF66] font-bold">Cód: {selectedStudent.codigo_estudiantil}</span>
                <span>•</span>
                <span>{grado?.nombre_grado || '11° Grado'} ({grupo?.nombre_grupo || '01'})</span>
                <span>•</span>
                <span className="text-slate-400">{sede?.nombre_sede || 'Sede Principal'}</span>
              </p>
            </div>
          </div>

          {/* Student Selector Switcher (Quick Demo Switch) */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-xs font-mono text-slate-400">
              <span className="block text-[10px] text-slate-500 uppercase">Cambiar Vista de Alumno:</span>
              <select
                value={selectedStudent.id}
                onChange={(e) => {
                  const target = estudiantes.find(st => st.id === e.target.value);
                  if (target) setSelectedStudent(target);
                }}
                className="mt-1 bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs rounded-xl px-3 py-1.5 focus:border-[#00F0FF] focus:outline-none"
              >
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombres} {e.apellidos} — ({e.codigo_estudiantil})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsFullscreenCard(true)}
              className="w-full sm:w-auto neon-btn-cyan px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Modo Celular QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Absence Alert Banner if any */}
      {criticalSubjectsCount > 0 && (
        <div className="bg-red-950/70 border-2 border-red-500/80 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-pulse">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-red-900/60 border border-red-500 rounded-xl text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron text-sm sm:text-base font-bold text-red-100">
                ¡ALERTA CRÍTICA: RIESGO DE REPROBACIÓN POR INASISTENCIA!
              </h3>
              <p className="text-xs sm:text-sm text-red-200 mt-0.5">
                Presentas más del 20% de fallas en <strong className="text-white underline">{criticalSubjectsCount} asignatura(s)</strong>. Según el Decreto 1290 y el Manual de Convivencia, debes justificar tus ausencias de inmediato con tu acudiente en Coordinación.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveHistoryTab('EXCUSAS')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all shadow-md"
          >
            Ver Excusas
          </button>
        </div>
      )}

      {/* Main Grid: Digital QR Card (Left) & Attendance Analytics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: High-Contrast Digital QR Card for Smartphone */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`rounded-3xl p-6 transition-all duration-300 border-2 ${
            isHighContrastMode
              ? 'bg-white text-slate-950 border-slate-400 shadow-2xl'
              : 'bg-[#070b14] text-slate-100 border-[#00F0FF]/50 shadow-[0_0_40px_rgba(0,240,255,0.2)]'
          } relative overflow-hidden`}>
            
            {/* Card Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-700/40">
              <div className="flex items-center space-x-3">
                <SchoolCrest size={42} showGlow={!isHighContrastMode} />
                <div>
                  <h3 className={`font-orbitron text-xs sm:text-sm font-black tracking-wide ${isHighContrastMode ? 'text-slate-950' : 'text-white'}`}>
                    I.E.T. FRANCISCO JOSÉ DE CALDAS
                  </h3>
                  <p className={`text-[10px] font-mono font-semibold ${isHighContrastMode ? 'text-slate-700' : 'text-[#00F0FF]'}`}>
                    CARNÉ DIGITAL ESTUDIANTIL QR • 2026
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                isHighContrastMode ? 'bg-slate-900 text-white' : 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
              }`}>
                ACTIVO
              </span>
            </div>

            {/* Photo & QR Display Area */}
            <div className="my-5 flex flex-col items-center justify-center text-center">
              
              {/* High Contrast QR Frame */}
              <div className={`p-4 rounded-2xl border-2 transition-all ${
                isHighContrastMode
                  ? 'bg-white border-black shadow-lg'
                  : 'bg-slate-950 border-[#00F0FF]/60 shadow-[0_0_25px_rgba(0,240,255,0.3)]'
              }`}>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Estudiantil"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center font-mono text-xs text-slate-500">
                    Generando QR...
                  </div>
                )}
              </div>

              <div className="mt-3 text-center">
                <span className={`font-mono text-sm font-black tracking-widest px-3 py-1 rounded-xl ${
                  isHighContrastMode ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-[#00F0FF] border border-[#00F0FF]/40'
                }`}>
                  {selectedStudent.codigo_estudiantil}
                </span>
                <p className={`text-[11px] font-mono mt-1 ${isHighContrastMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Documento: {selectedStudent.numero_doc} • RH: <strong className="text-red-500">{selectedStudent.rh || 'O+'}</strong>
                </p>
              </div>

            </div>

            {/* Student Info Details */}
            <div className={`p-3.5 rounded-2xl text-xs space-y-2 border ${
              isHighContrastMode ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-950/70 border-slate-800 text-slate-300'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-slate-400">Grado y Grupo:</span>
                <span className="font-bold">{grado?.nombre_grado} — Grupo {grupo?.nombre_grupo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-slate-400">Sede Educativa:</span>
                <span className="font-semibold">{sede?.nombre_sede}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] text-slate-400">EPS / Aseguradora:</span>
                <span>{eps?.nombre_eps || 'Asmet Salud EPS'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700/40 pt-1.5">
                <span className="font-mono text-[11px] text-slate-400">Acudiente de Contacto:</span>
                <span className="font-bold text-[#00FF66] flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {selectedStudent.acudiente_nombre || acudiente?.nombres || 'María Elena Tique'} ({selectedStudent.acudiente_telefono || '3124598021'})
                </span>
              </div>
            </div>

            {/* Card Controls & Presentation Actions */}
            <div className="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsHighContrastMode(!isHighContrastMode)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  isHighContrastMode
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-[#00F0FF] border border-[#00F0FF]/40'
                }`}
                title="Alternar entre modo cibernético y modo blanco OLED de alto contraste para escanear en sol"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHighContrastMode ? 'Modo Cyber' : 'Alto Brillo'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadQr}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all"
                  title="Descargar código QR"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>

                <button
                  onClick={() => setIsFullscreenCard(true)}
                  className="neon-btn-cyan px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Asistencia Global</span>
              <p className={`font-orbitron text-2xl font-black mt-1 ${
                globalAttendanceRate >= 85 ? 'text-[#00FF66]' : globalAttendanceRate >= 75 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {globalAttendanceRate}%
              </p>
              <span className="text-[10px] font-mono text-slate-500">Promedio General</span>
            </div>

            <div className="glass-panel border border-slate-800 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Pases & Excusas</span>
              <p className="font-orbitron text-2xl font-black text-[#00F0FF] mt-1">
                {studentPases.length + studentExcusas.length}
              </p>
              <span className="text-[10px] font-mono text-slate-500">Radicados en Sistema</span>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance by Subject & Detailed Histories */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Asignaturas & Failure Risk Monitor */}
          <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-slate-900 border border-[#00F0FF]/40 rounded-xl text-[#00F0FF]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron text-sm sm:text-base font-bold text-white">
                    ASISTENCIA POR ASIGNATURA Y RIESGO DE PÉRDIDA
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Monitoreo en tiempo real de fallas acumuladas vs. límite del 20%
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                {subjectStats.length} Asignaturas
              </span>
            </div>

            {/* Subject Cards Grid */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {subjectStats.map((stat, idx) => (
                <div
                  key={stat.asignatura.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stat.isCriticalRisk
                      ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : stat.isWarningRisk
                      ? 'bg-amber-950/30 border-amber-500/60'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF]"></span>
                      <span className="font-bold text-sm text-slate-100">
                        {stat.asignatura.nombre_asignatura}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {stat.isCriticalRisk ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-red-900 text-red-200 border border-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Riesgo de Pérdida
                        </span>
                      ) : stat.isWarningRisk ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-900/80 text-amber-200 border border-amber-500/80">
                          Advertencia
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Al Día
                        </span>
                      )}

                      <span className="font-orbitron text-sm font-bold text-white">
                        {stat.rate}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.isCriticalRisk
                            ? 'bg-gradient-to-r from-red-600 to-red-400'
                            : stat.isWarningRisk
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-[#00FF66] to-[#00F0FF]'
                        }`}
                        style={{ width: `${Math.min(stat.rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      Total Clases: <strong className="text-slate-200">{stat.countTotal}</strong>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-[#00FF66]">Presente: {stat.countPresent}</span>
                      <span className="text-amber-400">Retardos: {stat.countTardes}</span>
                      <span className={stat.countAusentes > 0 ? "text-red-400 font-bold" : "text-slate-500"}>
                        Fallas: {stat.countAusentes}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History Sub-tabs (Asistencias, Pases de Salida, Excusas, Observador) */}
          <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            
            {/* Tab navigation headers */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 overflow-x-auto">
              <div className="flex items-center space-x-1.5">
                
                <button
                  onClick={() => setActiveHistoryTab('ASISTENCIAS')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeHistoryTab === 'ASISTENCIAS'
                      ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Asistencias ({studentAsistencias.length})</span>
                </button>

                <button
                  onClick={() => setActiveHistoryTab('PASES')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeHistoryTab === 'PASES'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>Pases de Salida ({studentPases.length})</span>
                </button>

                <button
                  onClick={() => setActiveHistoryTab('EXCUSAS')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeHistoryTab === 'EXCUSAS'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Excusas Médicas ({studentExcusas.length})</span>
                </button>

                <button
                  onClick={() => setActiveHistoryTab('OBSERVADOR')}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeHistoryTab === 'OBSERVADOR'
                      ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Observador ({studentObservaciones.length})</span>
                </button>

              </div>
            </div>

            {/* Tab 1 Content: Daily Attendance */}
            {activeHistoryTab === 'ASISTENCIAS' && (
              <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {studentAsistencias.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 text-center py-6">No hay registros de asistencia aún.</p>
                ) : (
                  studentAsistencias.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl border ${
                          item.estado === 'PRESENTE' ? 'bg-emerald-950/60 border-[#00FF66]/40 text-[#00FF66]' :
                          item.estado === 'TARDE' ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' :
                          item.estado === 'EXCUSADO' ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' :
                          'bg-red-950/60 border-red-500/40 text-red-400'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">
                            {item.fecha} — {item.hora_ingreso}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.observacion || 'Registro de entrada escaneado'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                        item.estado === 'PRESENTE' ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40' :
                        item.estado === 'TARDE' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                        item.estado === 'EXCUSADO' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {item.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2 Content: Gate Passes */}
            {activeHistoryTab === 'PASES' && (
              <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {studentPases.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 text-center py-6">No hay pases de salida registrados para este estudiante.</p>
                ) : (
                  studentPases.map(pase => (
                    <div
                      key={pase.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <DoorOpen className="w-4 h-4 text-amber-400" />
                          Pase: {pase.id} ({pase.fecha} • {pase.hora_autorizada})
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                          pase.estado === 'SALIDA_EFECTUADA' ? 'bg-emerald-950 text-[#00FF66] border border-[#00FF66]/40' :
                          pase.estado === 'AUTORIZADO' ? 'bg-amber-950 text-amber-300 border border-amber-400/40' :
                          'bg-slate-900 text-slate-400'
                        }`}>
                          {pase.estado}
                        </span>
                      </div>

                      <p className="text-slate-300">{pase.motivo}</p>

                      <div className="pt-1 text-[10px] font-mono text-slate-400 flex flex-wrap justify-between gap-1 border-t border-slate-800">
                        <span>Retira: <strong>{pase.persona_retira}</strong> ({pase.parentesco_retira})</span>
                        <span>Autorizado por: {pase.autorizado_por}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3 Content: Medical Excusas */}
            {activeHistoryTab === 'EXCUSAS' && (
              <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {studentExcusas.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 text-center py-6">No hay excusas médicas registradas.</p>
                ) : (
                  studentExcusas.map(exc => (
                    <div
                      key={exc.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <HeartPulse className="w-4 h-4 text-purple-400" />
                          Radicado: {exc.id} ({exc.fecha_inicio} al {exc.fecha_fin})
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                          exc.estado === 'APROBADA' ? 'bg-emerald-950 text-[#00FF66] border border-[#00FF66]/40' :
                          exc.estado === 'PENDIENTE' ? 'bg-amber-950 text-amber-300 border border-amber-400/40' :
                          'bg-red-950 text-red-400 border border-red-500/40'
                        }`}>
                          {exc.estado}
                        </span>
                      </div>

                      <p className="text-slate-300">{exc.motivo}</p>
                      {exc.archivo_nombre && (
                        <p className="text-[11px] font-mono text-purple-400">
                          Adjunto: {exc.archivo_nombre}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4 Content: Digital Observer */}
            {activeHistoryTab === 'OBSERVADOR' && (
              <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {studentObservaciones.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 text-center py-6">El estudiante no registra anotaciones disciplinarias.</p>
                ) : (
                  studentObservaciones.map(obs => (
                    <div
                      key={obs.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        obs.tipo === 'RECONOCIMIENTO'
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : obs.tipo === 'TIPO_I'
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-red-950/30 border-red-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {obs.tipo === 'RECONOCIMIENTO' ? (
                            <Award className="w-4 h-4 text-[#00FF66]" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                          )}
                          {obs.titulo}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {obs.fecha}
                        </span>
                      </div>

                      <p className="text-slate-300">{obs.descripcion}</p>

                      <div className="pt-1.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
                        <span>Docente: <strong>{obs.docente_nombre}</strong></span>
                        <span className={obs.estado_firma === 'FIRMADO' ? 'text-[#00FF66]' : 'text-amber-400'}>
                          Firma: {obs.estado_firma}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Fullscreen High-Contrast QR Card Modal (For Smartphone presentation) */}
      {isFullscreenCard && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white text-slate-950 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <SchoolCrest size={36} />
                <div className="text-left">
                  <h4 className="font-orbitron text-xs font-black text-slate-900">I.E.T. FRANCISCO JOSÉ DE CALDAS</h4>
                  <p className="text-[9px] font-mono text-slate-600 font-bold">CARNÉ QR ESTUDIANTIL</p>
                </div>
              </div>

              <button
                onClick={() => setIsFullscreenCard(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-white border-4 border-black rounded-2xl shadow-md">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Completo"
                  className="w-64 h-64 object-contain"
                />
              )}
            </div>

            <h3 className="font-orbitron text-lg font-black text-slate-900">
              {selectedStudent.nombres} {selectedStudent.apellidos}
            </h3>
            <p className="font-mono text-xs font-bold text-slate-700 mt-0.5">
              CÓD: {selectedStudent.codigo_estudiantil} • DOC: {selectedStudent.numero_doc}
            </p>
            <p className="font-mono text-xs text-slate-600 mt-0.5">
              {grado?.nombre_grado} — {grupo?.nombre_grupo} • RH: <span className="font-bold text-red-600">{selectedStudent.rh || 'O+'}</span>
            </p>

            <button
              onClick={() => setIsFullscreenCard(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl font-mono text-xs font-bold"
            >
              Cerrar Vista Celular
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
