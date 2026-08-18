import React, { useState, useEffect, useRef } from 'react';
import { 
  DoorOpen, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  Camera, 
  ScanLine, 
  Printer, 
  Download, 
  Filter, 
  Sparkles, 
  Check, 
  X,
  Building2,
  AlertCircle
} from 'lucide-react';
import type { 
  Estudiante, 
  PaseSalida, 
  Grado, 
  Grupo, 
  Sede, 
  Acudiente, 
  UserRole, 
  Usuario 
} from '../types';

interface GatePassModuleProps {
  estudiantes: Estudiante[];
  pasesSalida: PaseSalida[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  acudientes: Acudiente[];
  currentRole: UserRole;
  currentUser?: Usuario;
  onAddPaseSalida: (nuevoPase: Omit<PaseSalida, 'id' | 'creado_el'>) => Promise<void> | void;
  onConfirmarSalidaEfectuada: (paseId: string) => void;
  onCancelarPaseSalida?: (paseId: string) => void;
}

export const GatePassModule: React.FC<GatePassModuleProps> = ({
  estudiantes,
  pasesSalida,
  grados,
  grupos,
  sedes,
  acudientes,
  currentRole,
  currentUser,
  onAddPaseSalida,
  onConfirmarSalidaEfectuada,
  onCancelarPaseSalida,
}) => {
  const [activeTab, setActiveTab] = useState<'PORTERIA' | 'NUEVO_PASE' | 'HISTORIAL'>('PORTERIA');
  
  // Portería Scanner / Verification States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<PaseSalida | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Estudiante | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'AUTHORIZED' | 'UNAUTHORIZED' | 'ALREADY_EXITED'>('IDLE');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // New Pass Form States
  const [selectedStudentId, setSelectedStudentId] = useState<string>(estudiantes[0]?.id || '');
  const [categoriaMotivo, setCategoriaMotivo] = useState<PaseSalida['categoria_motivo']>('CITA_MEDICA');
  const [motivoTexto, setMotivoTexto] = useState<string>('');
  const [horaAutorizada, setHoraAutorizada] = useState<string>('11:30 AM');
  const [personaRetira, setPersonaRetira] = useState<string>('');
  const [documentoRetira, setDocumentoRetira] = useState<string>('');
  const [telefonoContacto, setTelefonoContacto] = useState<string>('');
  const [parentescoRetira, setParentescoRetira] = useState<string>('Madre / Acudiente');
  const [autorizadoPor, setAutorizadoPor] = useState<string>(
    currentUser?.nombre_display || 'Lic. Héctor Fabio (Rector)'
  );
  const [observaciones, setObservaciones] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History Filters
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Auto-fill Guardian data when selected student changes in form
  useEffect(() => {
    const student = estudiantes.find(e => e.id === selectedStudentId);
    if (student) {
      const acudiente = acudientes.find(a => a.id === student.acudiente_id);
      setPersonaRetira(student.acudiente_nombre || acudiente?.nombres ? `${acudiente?.nombres} ${acudiente?.apellidos}` : 'María Elena Tique');
      setDocumentoRetira(acudiente?.numero_doc || '28549302');
      setTelefonoContacto(student.acudiente_telefono || acudiente?.telefono || '3124598021');
    }
  }, [selectedStudentId, estudiantes, acudientes]);

  // Handle Verify in Portería
  const handleVerifyStudent = (query: string) => {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return;

    // Find student
    const studentFound = estudiantes.find(e => 
      e.id.toLowerCase() === cleanQ ||
      e.codigo_estudiantil.toLowerCase() === cleanQ ||
      e.numero_doc.toLowerCase() === cleanQ ||
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(cleanQ)
    );

    if (!studentFound) {
      // Check if it's a pass security code or pass id
      const passDirect = pasesSalida.find(p => 
        p.id.toLowerCase() === cleanQ || 
        p.codigo_seguridad?.toLowerCase() === cleanQ
      );

      if (passDirect) {
        const student = estudiantes.find(e => e.id === passDirect.estudiante_id);
        setScannedStudent(student || null);
        setScannedResult(passDirect);
        if (passDirect.estado === 'AUTORIZADO') {
          setScanStatus('AUTHORIZED');
        } else if (passDirect.estado === 'SALIDA_EFECTUADA') {
          setScanStatus('ALREADY_EXITED');
        } else {
          setScanStatus('UNAUTHORIZED');
        }
        return;
      }

      setScanStatus('UNAUTHORIZED');
      setScannedStudent(null);
      setScannedResult(null);
      setFeedbackMessage(`No se encontró ningún estudiante ni código de pase correspondiente a: "${query}"`);
      return;
    }

    setScannedStudent(studentFound);

    // Check if student has an authorized gate pass for today
    const today = new Date().toISOString().split('T')[0];
    const activePass = pasesSalida.find(p => 
      p.estudiante_id === studentFound.id && 
      (p.fecha === today || p.fecha.includes(today))
    );

    if (activePass) {
      setScannedResult(activePass);
      if (activePass.estado === 'AUTORIZADO') {
        setScanStatus('AUTHORIZED');
        setFeedbackMessage('¡Pase de salida válido y autorizado por Rectoría/Coordinación!');
      } else if (activePass.estado === 'SALIDA_EFECTUADA') {
        setScanStatus('ALREADY_EXITED');
        setFeedbackMessage(`Este estudiante ya registró salida hoy a las ${activePass.hora_salida_efectiva || activePass.hora_autorizada}.`);
      } else {
        setScanStatus('UNAUTHORIZED');
        setFeedbackMessage(`El pase se encuentra en estado: ${activePass.estado}`);
      }
    } else {
      setScannedResult(null);
      setScanStatus('UNAUTHORIZED');
      setFeedbackMessage('⛔ ALERTA: El estudiante NO cuenta con pase de salida autorizado para el día de hoy.');
    }
  };

  // Confirm Departure in Gate
  const handleConfirmExit = (paseId: string) => {
    onConfirmarSalidaEfectuada(paseId);
    setScanStatus('ALREADY_EXITED');
    setFeedbackMessage('✅ Salida registrada exitosamente en portería principal.');
  };

  // Create Pass Form Submit
  const handleCreatePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !motivoTexto) {
      alert("Por favor completa el motivo de la salida anticipada.");
      return;
    }

    setIsSubmitting(true);
    const student = estudiantes.find(e => e.id === selectedStudentId);
    const grado = grados.find(g => g.id === student?.grado_id);
    const grupo = grupos.find(g => g.id === student?.grupo_id);
    const randomSec = Math.floor(1000 + Math.random() * 9000);

    const newPase: Omit<PaseSalida, 'id' | 'creado_el'> = {
      estudiante_id: selectedStudentId,
      estudiante_nombre: student ? `${student.nombres} ${student.apellidos}` : 'Estudiante',
      estudiante_documento: student?.numero_doc || '',
      grado_nombre: grado?.nombre_grado || '11° Grado',
      grupo_nombre: grupo?.nombre_grupo || '01',
      fecha: new Date().toISOString().split('T')[0],
      hora_autorizada: horaAutorizada,
      motivo: motivoTexto,
      categoria_motivo: categoriaMotivo,
      autorizado_por: autorizadoPor,
      persona_retira: personaRetira || 'Acudiente Autorizado',
      documento_retira: documentoRetira || '28549302',
      telefono_contacto: telefonoContacto || '3124598021',
      parentesco_retira: parentescoRetira,
      estado: 'AUTORIZADO',
      observaciones: observaciones,
      codigo_seguridad: `SEC-${randomSec}`
    };

    await onAddPaseSalida(newPase);
    setIsSubmitting(false);
    setMotivoTexto('');
    setObservaciones('');
    setActiveTab('HISTORIAL');
  };

  // Filtered History
  const filteredHistory = pasesSalida.filter(p => {
    if (filterStatus !== 'TODOS' && p.estado !== filterStatus) return false;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      const nameMatch = p.estudiante_nombre?.toLowerCase().includes(q);
      const codeMatch = p.id.toLowerCase().includes(q) || p.codigo_seguridad?.toLowerCase().includes(q);
      const retiraMatch = p.persona_retira?.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch && !retiraMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header Card */}
      <div className="glass-panel border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-slate-900 border border-amber-500/60 rounded-2xl text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg sm:text-2xl font-black text-white">
                CONTROL DE SEGURIDAD Y PASES DE SALIDA
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                Punto de control en portería y autorización de retiros anticipados
              </p>
            </div>
          </div>

          {/* Module Sub-Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('PORTERIA')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'PORTERIA'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Portería / Escáner</span>
            </button>

            {(currentRole === 'ADMIN' || currentRole === 'DOCENTE') && (
              <button
                onClick={() => setActiveTab('NUEVO_PASE')}
                className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'NUEVO_PASE'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Expedir Pase</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('HISTORIAL')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'HISTORIAL'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Historial ({pasesSalida.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PORTERÍA / LIVE VALIDATION */}
      {activeTab === 'PORTERIA' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Scan Control Box */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ScanLine className="w-5 h-5 text-amber-400" />
                  <h3 className="font-orbitron text-sm font-bold text-white uppercase">
                    PUNTO DE VALIDACIÓN EN PORTERÍA
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
                  EN LÍNEA
                </span>
              </div>

              {/* Fast Manual / Barcode Search Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyStudent(searchQuery);
                }}
                className="space-y-3"
              >
                <label className="block text-xs font-mono text-slate-300 uppercase">
                  Escanear Carné QR o Ingresar Código / Documento:
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: 2026-CALDAS-001 o 1098234561 o SEC-9921"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none pl-10"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>Verificar</span>
                  </button>
                </div>
              </form>

              {/* Quick Preset Buttons for Simulation */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <span className="block text-[10px] font-mono text-slate-500 uppercase mb-2">
                  Prueba rápida en portería con alumnos muestra:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {estudiantes.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery(st.codigo_estudiantil);
                        handleVerifyStudent(st.codigo_estudiantil);
                      }}
                      className="text-left p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 transition-all truncate"
                    >
                      <span className="font-bold text-white block truncate">{st.nombres}</span>
                      <span className="text-[10px] text-amber-400">{st.codigo_estudiantil}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Scanner Simulation */}
              <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <div className="w-full h-40 bg-black rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 border-2 border-amber-500/30 rounded-xl pointer-events-none animate-pulse"></div>
                  <Camera className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-xs font-mono text-slate-400">
                    Visor Óptico de Portería Listo
                  </p>
                  <span className="text-[10px] font-mono text-amber-400 mt-1">
                    Acerca el carné digital o celular del estudiante
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Verification Result Display Card */}
          <div className="lg:col-span-6 space-y-4">
            {scanStatus === 'IDLE' ? (
              <div className="h-full glass-panel border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-orbitron text-base font-bold text-slate-300">
                  ESPERANDO LECTURA EN PORTERÍA
                </h3>
                <p className="text-xs font-mono max-w-sm">
                  Ingresa o escanea el documento/código del estudiante para comprobar de inmediato si tiene salida autorizada por coordinación.
                </p>
              </div>
            ) : scanStatus === 'AUTHORIZED' && scannedResult ? (
              /* Green Authorized State */
              <div className="glass-panel border-2 border-[#00FF66] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.25)] space-y-4 animate-fadeIn bg-slate-950/90">
                
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-[#00FF66]" />
                    <h3 className="font-orbitron text-base font-black text-[#00FF66]">
                      SALIDA AUTORIZADA POR COORDINACIÓN
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40">
                    {scannedResult.codigo_seguridad}
                  </span>
                </div>

                {/* Student Info Card */}
                <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <img
                    src={scannedStudent?.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt="Alumno"
                    className="w-16 h-16 rounded-xl object-cover border border-[#00FF66]"
                  />
                  <div>
                    <h4 className="font-orbitron text-base font-bold text-white">
                      {scannedResult.estudiante_nombre}
                    </h4>
                    <p className="text-xs font-mono text-slate-300">
                      Doc: {scannedResult.estudiante_documento} • Grado: {scannedResult.grado_nombre}
                    </p>
                    <p className="text-xs font-mono text-amber-400 mt-0.5">
                      Hora Autorizada: <strong>{scannedResult.hora_autorizada}</strong> (Hoy)
                    </p>
                  </div>
                </div>

                {/* Departure Details */}
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Motivo de Salida:</span>
                    <span className="font-bold text-white">{scannedResult.motivo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Persona que Retira:</span>
                    <span className="font-bold text-[#00FF66]">{scannedResult.persona_retira} ({scannedResult.parentesco_retira})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Documento / Teléfono:</span>
                    <span className="text-slate-200">{scannedResult.documento_retira} • Tel: {scannedResult.telefono_contacto}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-slate-400">Autorizado Oficialmente Por:</span>
                    <span className="font-bold text-amber-300">{scannedResult.autorizado_por}</span>
                  </div>
                </div>

                {/* Confirm Departure Button */}
                <button
                  onClick={() => handleConfirmExit(scannedResult.id)}
                  className="w-full neon-btn-green py-3 rounded-2xl font-mono text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>REGISTRAR SALIDA EFECTUADA EN PORTERÍA</span>
                </button>

              </div>
            ) : scanStatus === 'ALREADY_EXITED' && scannedResult ? (
              /* Already Exited */
              <div className="glass-panel border-2 border-[#00F0FF] rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.2)] space-y-4 animate-fadeIn bg-slate-950/90">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <CheckCircle2 className="w-6 h-6 text-[#00F0FF]" />
                  <h3 className="font-orbitron text-base font-bold text-[#00F0FF]">
                    SALIDA YA REGISTRADA PREVIAMENTE
                  </h3>
                </div>

                <p className="text-xs font-mono text-slate-300">
                  El estudiante <strong className="text-white">{scannedResult.estudiante_nombre}</strong> ya cruzó la portería y su salida fue efectuada a las: <span className="text-[#00F0FF] font-bold">{scannedResult.hora_salida_efectiva || scannedResult.hora_autorizada}</span>.
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                  <div>Retirado por: <strong className="text-slate-200">{scannedResult.persona_retira}</strong></div>
                  <div>Motivo: {scannedResult.motivo}</div>
                </div>
              </div>
            ) : (
              /* Red Unauthorized Alert */
              <div className="glass-panel border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4 animate-fadeIn bg-red-950/40">
                <div className="flex items-center space-x-3 border-b border-red-900 pb-3">
                  <XCircle className="w-8 h-8 text-red-400 shrink-0 animate-bounce" />
                  <div>
                    <h3 className="font-orbitron text-base font-black text-red-200">
                      ⛔ ALERTA: SALIDA NO AUTORIZADA
                    </h3>
                    <p className="text-xs font-mono text-red-300">
                      EL ALUMNO NO PUEDE ABANDONAR EL PLANTEL EDUCATIVO
                    </p>
                  </div>
                </div>

                {scannedStudent ? (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-red-900 text-xs space-y-1">
                    <p className="font-bold text-white text-sm">{scannedStudent.nombres} {scannedStudent.apellidos}</p>
                    <p className="font-mono text-slate-400">Código: {scannedStudent.codigo_estudiantil} • Documento: {scannedStudent.numero_doc}</p>
                    <p className="font-mono text-red-400 pt-2 border-t border-slate-800">
                      No existe ningún pase emitido por Rectoría o Coordinación para la fecha de hoy.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-red-200 bg-slate-950 p-4 rounded-2xl border border-red-900">
                    {feedbackMessage}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Celaduría I.E.T. Francisco José de Caldas</span>
                  <span className="text-red-400 font-bold">Retener en Portería</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: NUEVO PASE DE SALIDA FORM */}
      {activeTab === 'NUEVO_PASE' && (
        <div className="max-w-3xl mx-auto glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="font-orbitron text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              EXPEDICIÓN OFICIAL DE PASE DE SALIDA ANTICIPADA
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Diligenciado por Coordinación / Rectoría / Secretaría Académica
            </p>
          </div>

          <form onSubmit={handleCreatePassSubmit} className="space-y-4">
            
            {/* Student Selector */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                Seleccionar Estudiante a Retirar:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                required
              >
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombres} {e.apellidos} — Cód: {e.codigo_estudiantil} ({e.numero_doc})
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo & Causa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Causa / Categoría:
                </label>
                <select
                  value={categoriaMotivo}
                  onChange={(e) => setCategoriaMotivo(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                >
                  <option value="CITA_MEDICA">Cita Médica / Odontológica</option>
                  <option value="RETIRO_ACUDIENTE">Retiro Solicitado por Acudiente</option>
                  <option value="CALAMIDAD">Calamidad Doméstica</option>
                  <option value="ENFERMERIA">Malestar de Salud en Enfermería</option>
                  <option value="ACTIVIDAD_PEDAGOGICA">Actividad Pedagógica / Torneo Externo</option>
                  <option value="OTRO">Otro Motivo Justificado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Hora de Salida Autorizada:
                </label>
                <input
                  type="text"
                  value={horaAutorizada}
                  onChange={(e) => setHoraAutorizada(e.target.value)}
                  placeholder="Ej: 11:30 AM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Motivo description */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                Descripción Detallada del Motivo:
              </label>
              <textarea
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                placeholder="Describa la justificación médica o familiar de la salida..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            {/* Person authorized to pick up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Nombre Quien Retira:
                </label>
                <input
                  type="text"
                  value={personaRetira}
                  onChange={(e) => setPersonaRetira(e.target.value)}
                  placeholder="Nombre y Apellidos"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  N° Cédula / Documento:
                </label>
                <input
                  type="text"
                  value={documentoRetira}
                  onChange={(e) => setDocumentoRetira(e.target.value)}
                  placeholder="Ej: 28549302"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Parentesco / Relación:
                </label>
                <input
                  type="text"
                  value={parentescoRetira}
                  onChange={(e) => setParentescoRetira(e.target.value)}
                  placeholder="Madre, Padre, etc."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Authorized by & Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Directivo que Autoriza:
                </label>
                <input
                  type="text"
                  value={autorizadoPor}
                  onChange={(e) => setAutorizadoPor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase mb-1.5">
                  Teléfono de Contacto:
                </label>
                <input
                  type="text"
                  value={telefonoContacto}
                  onChange={(e) => setTelefonoContacto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('HISTORIAL')}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-mono transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="neon-btn-green px-6 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Guardando...' : 'Expedir y Autorizar Pase'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 3: HISTORIAL DE PASES */}
      {activeTab === 'HISTORIAL' && (
        <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-orbitron text-sm sm:text-base font-bold text-white">
                HISTORIAL DE PASES DE SALIDA REGISTRADOS
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Control y trazabilidad de retiros anticipados del colegio
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Buscar estudiante o código..."
                  className="bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono rounded-xl px-3 py-1.5 pl-8 focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono rounded-xl px-2.5 py-1.5 focus:border-amber-400 focus:outline-none"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="AUTORIZADO">Autorizados</option>
                <option value="SALIDA_EFECTUADA">Salida Efectuada</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Passes List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Código / ID</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Grado</th>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Persona que Retira</th>
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Autorizado Por</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 font-mono">
                      No se encontraron pases de salida con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(pase => (
                    <tr key={pase.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-amber-400 whitespace-nowrap">
                        {pase.id}
                        <span className="block text-[10px] text-slate-500">{pase.codigo_seguridad}</span>
                      </td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">
                        {pase.estudiante_nombre}
                        <span className="block text-[10px] text-slate-400">CC: {pase.estudiante_documento}</span>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        {pase.grado_nombre} ({pase.grupo_nombre})
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        {pase.fecha}
                        <span className="block text-[10px] text-[#00FF66]">{pase.hora_autorizada}</span>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        <strong>{pase.persona_retira}</strong>
                        <span className="block text-[10px] text-slate-400">{pase.parentesco_retira} • {pase.telefono_contacto}</span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-[180px] truncate" title={pase.motivo}>
                        {pase.motivo}
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {pase.autorizado_por}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          pase.estado === 'SALIDA_EFECTUADA' ? 'bg-emerald-950 text-[#00FF66] border border-[#00FF66]/40' :
                          pase.estado === 'AUTORIZADO' ? 'bg-amber-950 text-amber-300 border border-amber-400/40' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {pase.estado}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {pase.estado === 'AUTORIZADO' && (
                          <button
                            onClick={() => handleConfirmExit(pase.id)}
                            className="px-2.5 py-1 bg-[#00FF66]/20 hover:bg-[#00FF66]/30 text-[#00FF66] border border-[#00FF66]/50 rounded-lg text-[10px] font-bold transition-all"
                          >
                            Registrar Salida
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
