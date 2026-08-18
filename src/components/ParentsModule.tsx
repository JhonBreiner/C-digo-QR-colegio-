import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Calendar, 
  FileCheck2, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  FileText,
  HeartPulse,
  Phone,
  Paperclip,
  Sparkles,
  X,
  Check,
  UserCheck
} from 'lucide-react';
import type { Estudiante, Asistencia, Excusa, Grado, Grupo, EPS, Acudiente, UserRole } from '../types';

interface ParentsModuleProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  excusas: Excusa[];
  grados: Grado[];
  grupos: Grupo[];
  epsList: EPS[];
  acudientes: Acudiente[];
  currentRole: UserRole;
  onSubmitExcusa: (excusa: Omit<Excusa, 'id' | 'creado_el' | 'estado'>) => Promise<void>;
  onUpdateExcusaState?: (excusaId: string, nuevoEstado: 'APROBADA' | 'RECHAZADA') => void;
}

export const ParentsModule: React.FC<ParentsModuleProps> = ({
  estudiantes,
  asistencias,
  excusas,
  grados,
  grupos,
  epsList,
  acudientes,
  currentRole,
  onSubmitExcusa,
  onUpdateExcusaState,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('2026-CALDAS-003'); // default student
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(
    estudiantes.find(e => e.codigo_estudiantil === '2026-CALDAS-003') || estudiantes[0] || null
  );

  const [showExcusaModal, setShowExcusaModal] = useState<boolean>(false);
  const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState<string>('');
  const [archivoNombre, setArchivoNombre] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const query = searchTerm.toLowerCase();
    const student = estudiantes.find(st => 
      st.codigo_estudiantil.toLowerCase() === query ||
      st.numero_doc === query ||
      `${st.nombres} ${st.apellidos}`.toLowerCase().includes(query)
    );

    if (student) {
      setSelectedStudent(student);
    } else {
      alert("No se encontró ningún estudiante con esa información.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !motivo.trim()) return;

    await onSubmitExcusa({
      estudiante_id: selectedStudent.id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      motivo,
      archivo_nombre: archivoNombre || 'soporte_medico.pdf'
    });

    alert("¡Incapacidad / Excusa médica radicada exitosamente ante la Institución!");
    setShowExcusaModal(false);
    setMotivo('');
    setArchivoNombre('');
  };

  // Student specific data
  const studentAsistencias = selectedStudent 
    ? asistencias.filter(a => a.estudiante_id === selectedStudent.id)
    : [];

  const studentExcusas = selectedStudent
    ? excusas.filter(ex => ex.estudiante_id === selectedStudent.id)
    : [];

  const gradoObj = grados.find(g => g.id === selectedStudent?.grado_id);
  const grupoObj = grupos.find(g => g.id === selectedStudent?.grupo_id);
  const epsObj = epsList.find(e => e.id === selectedStudent?.eps_id);
  const acudienteObj = acudientes.find(a => a.id === selectedStudent?.acudiente_id);

  const canApproveExcusas = currentRole === 'ADMIN' || currentRole === 'DOCENTE';

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#7000FF]" />
            Portal de Acudientes & Excusas Médicas
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Consulta de historial de asistencia y radicación / aprobación de excusas e incapacidades médicas
          </p>
        </div>

        {selectedStudent && (
          <button
            onClick={() => setShowExcusaModal(true)}
            className="neon-btn-purple px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Radicar Excusa Médica
          </button>
        )}
      </div>

      {/* Student Lookup Input */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Ingresa Código Estudiantil (ej. 2026-CALDAS-003) o Cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 focus:border-[#00F0FF] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="neon-btn-cyan px-6 py-2.5 rounded-xl text-xs font-mono font-bold"
          >
            Buscar Estudiante
          </button>
        </form>
      </div>

      {/* Selected Student Details HUD */}
      {selectedStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Card Profile */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="text-center space-y-3 border-b border-slate-800 pb-4">
              <img 
                src={selectedStudent.foto_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                alt="Student" 
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              />
              <div>
                <h3 className="font-sans font-bold text-base text-slate-100">{selectedStudent.nombres} {selectedStudent.apellidos}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs font-mono text-[#00F0FF] font-bold">{selectedStudent.codigo_estudiantil}</span>
                  <span className="text-xs font-mono font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded-full border border-[#00FF66]/30">
                    RH: {selectedStudent.rh || 'O+'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Grado / Grupo:</span>
                <span className="font-bold text-slate-100">{gradoObj?.nombre_grado} ({grupoObj?.nombre_grupo})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Documento:</span>
                <span className="font-bold text-slate-100">{selectedStudent.numero_doc}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">EPS:</span>
                <span className="font-bold text-slate-100">{epsObj?.nombre_eps}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Acudiente:</span>
                <span className="font-bold text-slate-100">{acudienteObj ? `${acudienteObj.nombres} (${acudienteObj.telefono})` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Observación Médica:</span>
                <p className="text-[11px] text-slate-300 italic">{selectedStudent.observacion_medica || 'Sin novedad médica'}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Attendance History & Excusal History */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Attendance History */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-orbitron text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00FF66]" />
                Historial de Registro de Asistencias
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Hora Ingreso</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {studentAsistencias.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-500">
                          Sin asistencias registradas para este alumno.
                        </td>
                      </tr>
                    ) : (
                      studentAsistencias.map(a => (
                        <tr key={a.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-slate-300">{a.fecha}</td>
                          <td className="py-2.5 px-3 text-slate-100">{a.hora_ingreso}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.estado === 'PRESENTE' ? 'bg-[#00FF66]/10 text-[#00FF66]' :
                              a.estado === 'EXCUSADO' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {a.estado}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 italic">{a.observacion || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Excusal Track Records with Approval Buttons for Docentes / Admin */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#7000FF]" />
                  Excusas e Incapacidades Médicas Radicadas
                </h3>
                {canApproveExcusas && (
                  <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-1 rounded-lg font-mono">
                    Modo Gestión Docente / Coordinación
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {studentExcusas.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 italic text-center py-4">
                    No se han radicado excusas médicas previamente.
                  </p>
                ) : (
                  studentExcusas.map(ex => (
                    <div key={ex.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#00F0FF] font-bold">
                          Período: {ex.fecha_inicio} al {ex.fecha_fin}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ex.estado === 'APROBADA' 
                            ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40' :
                          ex.estado === 'RECHAZADA'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {ex.estado}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans">{ex.motivo}</p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        {ex.archivo_nombre ? (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Paperclip className="w-3 h-3 text-[#7000FF]" /> Soporte: {ex.archivo_nombre}
                          </span>
                        ) : <span />}

                        {canApproveExcusas && onUpdateExcusaState && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onUpdateExcusaState(ex.id, 'APROBADA')}
                              className="px-2.5 py-1 bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Aprobar
                            </button>

                            <button
                              onClick={() => onUpdateExcusaState(ex.id, 'RECHAZADA')}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Desaprobar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            Ingresa un código de alumno para consultar información académica y radicar excusas.
          </p>
        </div>
      )}

      {/* Modal Overlay for Excusa Submission */}
      {showExcusaModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-[#7000FF]/50 max-w-md w-full space-y-4 relative">
            <button
              onClick={() => setShowExcusaModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-orbitron text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#7000FF]" />
                Radicar Incapacidad Médica
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Para: {selectedStudent.nombres} {selectedStudent.apellidos} ({selectedStudent.codigo_estudiantil})
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Fecha Inicio:</label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Fecha Fin:</label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Motivo / Diagnóstico Médico:</label>
                <textarea
                  required
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe la razón médica de la inasistencia..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Adjuntar Incapacidad (PDF / JPG):</label>
                <input
                  type="file"
                  onChange={(e) => setArchivoNombre(e.target.files?.[0]?.name || '')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn-purple py-3 rounded-xl font-bold uppercase tracking-wider text-xs"
              >
                Enviar Excusa a Coordinación
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
