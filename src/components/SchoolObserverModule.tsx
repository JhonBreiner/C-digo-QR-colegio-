import React, { useState } from 'react';
import { 
  Award, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  FileText, 
  Printer, 
  Filter, 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  Layers, 
  ShieldAlert,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import type { 
  Estudiante, 
  AnotacionObservador, 
  TipoAnotacionConvivencia, 
  Grado, 
  Grupo, 
  Sede, 
  Docente, 
  UserRole, 
  Usuario 
} from '../types';

interface SchoolObserverModuleProps {
  estudiantes: Estudiante[];
  anotacionesObservador: AnotacionObservador[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  docentes: Docente[];
  currentRole: UserRole;
  currentUser?: Usuario;
  onAddAnotacion: (nuevaAnotacion: Omit<AnotacionObservador, 'id' | 'creado_el'>) => Promise<void> | void;
  onFirmarAnotacion: (anotacionId: string, firmadoPor: string) => void;
}

export const SchoolObserverModule: React.FC<SchoolObserverModuleProps> = ({
  estudiantes,
  anotacionesObservador,
  grados,
  grupos,
  sedes,
  docentes,
  currentRole,
  currentUser,
  onAddAnotacion,
  onFirmarAnotacion,
}) => {
  const [activeTab, setActiveTab] = useState<'LISTA' | 'NUEVA_ANOTACION'>('LISTA');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [filterGrado, setFilterGrado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Annotation Form States
  const [selectedStudentId, setSelectedStudentId] = useState<string>(estudiantes[0]?.id || '');
  const [tipoAnotacion, setTipoAnotacion] = useState<TipoAnotacionConvivencia>('TIPO_I');
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [descargosEstudiante, setDescargosEstudiante] = useState<string>('');
  const [compromisosEstudiante, setCompromisosEstudiante] = useState<string>('');
  const [compromisosAcudiente, setCompromisosAcudiente] = useState<string>('');
  const [docenteNombre, setDocenteNombre] = useState<string>(
    currentUser?.nombre_display || 'Prof. Jamer Andrade Vargas'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected annotation for modal details / print
  const [selectedActa, setSelectedActa] = useState<AnotacionObservador | null>(null);

  // Filtered Annotations
  const filteredAnotaciones = anotacionesObservador.filter(obs => {
    if (filterTipo !== 'TODOS' && obs.tipo !== filterTipo) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const studentMatch = obs.estudiante_nombre?.toLowerCase().includes(q);
      const titleMatch = obs.titulo.toLowerCase().includes(q);
      const docMatch = obs.estudiante_documento?.toLowerCase().includes(q);
      if (!studentMatch && !titleMatch && !docMatch) return false;
    }
    return true;
  });

  // Handle Create Annotation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !titulo || !descripcion) {
      alert("Por favor completa el título y la descripción de la anotación.");
      return;
    }

    setIsSubmitting(true);
    const student = estudiantes.find(st => st.id === selectedStudentId);
    const grado = grados.find(g => g.id === student?.grado_id);
    const grupo = grupos.find(g => g.id === student?.grupo_id);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    const newAnotacion: Omit<AnotacionObservador, 'id' | 'creado_el'> = {
      estudiante_id: selectedStudentId,
      estudiante_nombre: student ? `${student.nombres} ${student.apellidos}` : 'Estudiante',
      estudiante_documento: student?.numero_doc || '',
      grado_nombre: grado?.nombre_grado || '11° Grado',
      grupo_nombre: grupo?.nombre_grupo || '01',
      docente_id: currentUser?.referencia_id || 'DOC-01',
      docente_nombre: docenteNombre,
      fecha: now.toISOString().split('T')[0],
      hora: timeStr,
      tipo: tipoAnotacion,
      titulo: titulo,
      descripcion: descripcion,
      descargos_estudiante: descargosEstudiante,
      compromisos_estudiante: compromisosEstudiante || 'Compromiso de cumplir a cabalidad el manual de convivencia institucional.',
      compromisos_acudiente: compromisosAcudiente || 'Acompañamiento y seguimiento en casa.',
      estado_firma: 'PENDIENTE'
    };

    await onAddAnotacion(newAnotacion);
    setIsSubmitting(false);
    setTitulo('');
    setDescripcion('');
    setDescargosEstudiante('');
    setCompromisosEstudiante('');
    setCompromisosAcudiente('');
    setActiveTab('LISTA');
  };

  // Sign Annotation Action
  const handleSign = (obsId: string) => {
    const signerName = currentUser?.nombre_display || 'María Elena Tique (Acudiente)';
    onFirmarAnotacion(obsId, signerName);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header Banner */}
      <div className="glass-panel border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-purple-500/20 via-pink-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-slate-900 border border-purple-500/60 rounded-2xl text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg sm:text-2xl font-black text-white">
                OBSERVADOR DEL ESTUDIANTE Y CONVIVENCIA ESCOLAR
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                Seguimiento pedagógico conforme a la Ley 1620 y Manual de Convivencia
              </p>
            </div>
          </div>

          {/* Tab Actions */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('LISTA')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'LISTA'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Observador ({anotacionesObservador.length})</span>
            </button>

            {(currentRole === 'ADMIN' || currentRole === 'DOCENTE') && (
              <button
                onClick={() => setActiveTab('NUEVA_ANOTACION')}
                className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'NUEVA_ANOTACION'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nueva Anotación</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: LISTA DEL OBSERVADOR */}
      {activeTab === 'LISTA' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por estudiante o título..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-9 text-xs font-mono text-slate-100 focus:border-purple-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'TODOS', label: 'Todos' },
                { id: 'RECONOCIMIENTO', label: '🟢 Felicitación' },
                { id: 'TIPO_I', label: '🟡 Tipo I' },
                { id: 'TIPO_II', label: '🟠 Tipo II' },
                { id: 'TIPO_III', label: '🔴 Tipo III' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterTipo(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all ${
                    filterTipo === f.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Annotations Cards Grid */}
          <div className="space-y-3">
            {filteredAnotaciones.length === 0 ? (
              <div className="glass-panel border border-slate-800 rounded-3xl p-12 text-center text-slate-500 font-mono text-xs">
                No se encontraron anotaciones con los filtros seleccionados.
              </div>
            ) : (
              filteredAnotaciones.map(obs => (
                <div
                  key={obs.id}
                  className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all ${
                    obs.tipo === 'RECONOCIMIENTO'
                      ? 'border-emerald-500/50 bg-emerald-950/15'
                      : obs.tipo === 'TIPO_I'
                      ? 'border-yellow-500/50 bg-yellow-950/15'
                      : obs.tipo === 'TIPO_II'
                      ? 'border-orange-500/50 bg-orange-950/20'
                      : 'border-red-500/60 bg-red-950/25'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-2xl border ${
                        obs.tipo === 'RECONOCIMIENTO' ? 'bg-emerald-950 border-emerald-500 text-[#00FF66]' :
                        obs.tipo === 'TIPO_I' ? 'bg-yellow-950 border-yellow-500 text-yellow-400' :
                        obs.tipo === 'TIPO_II' ? 'bg-orange-950 border-orange-500 text-orange-400' :
                        'bg-red-950 border-red-500 text-red-400'
                      }`}>
                        {obs.tipo === 'RECONOCIMIENTO' ? <Award className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            obs.tipo === 'RECONOCIMIENTO' ? 'bg-emerald-950 text-[#00FF66] border border-emerald-500' :
                            obs.tipo === 'TIPO_I' ? 'bg-yellow-950 text-yellow-300 border border-yellow-500' :
                            obs.tipo === 'TIPO_II' ? 'bg-orange-950 text-orange-300 border border-orange-500' :
                            'bg-red-950 text-red-300 border border-red-500'
                          }`}>
                            {obs.tipo === 'RECONOCIMIENTO' ? 'MÉRITO / RECONOCIMIENTO' : `FALTA ${obs.tipo}`}
                          </span>

                          <span className="text-xs font-mono text-slate-400">
                            {obs.fecha} • {obs.hora}
                          </span>
                        </div>

                        <h3 className="font-orbitron text-base font-bold text-white mt-1">
                          {obs.titulo}
                        </h3>

                        <p className="text-xs font-mono text-slate-300">
                          Estudiante: <strong className="text-white">{obs.estudiante_nombre}</strong> ({obs.grado_nombre} • Grupo {obs.grupo_nombre})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                        obs.estado_firma === 'FIRMADO'
                          ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      }`}>
                        {obs.estado_firma === 'FIRMADO' ? 'FIRMADO DIGITALMENTE' : 'FIRMA PENDIENTE'}
                      </span>

                      <button
                        onClick={() => setSelectedActa(obs)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono flex items-center gap-1"
                        title="Ver Acta Oficial"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Ver Acta</span>
                      </button>
                    </div>
                  </div>

                  {/* Body description & commitments */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Descripción de los Hechos:</span>
                      <p className="text-slate-200">{obs.descripcion}</p>
                      
                      {obs.descargos_estudiante && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] text-purple-400 font-bold block">Versión / Descargos del Alumno:</span>
                          <p className="text-slate-300 italic">"{obs.descargos_estudiante}"</p>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                      <div>
                        <span className="text-[10px] text-[#00FF66] uppercase font-bold block">Compromisos Pedagógicos:</span>
                        <p className="text-slate-200">{obs.compromisos_estudiante}</p>
                      </div>

                      {obs.compromisos_acudiente && (
                        <div className="pt-1.5 border-t border-slate-800">
                          <span className="text-[10px] text-amber-400 uppercase font-bold block">Compromisos del Acudiente:</span>
                          <p className="text-slate-300">{obs.compromisos_acudiente}</p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Docente: <strong className="text-slate-200">{obs.docente_nombre}</strong></span>
                        {obs.estado_firma === 'PENDIENTE' && (
                          <button
                            onClick={() => handleSign(obs.id)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px]"
                          >
                            Firmar como Acudiente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 2: NUEVA ANOTACIÓN FORM */}
      {activeTab === 'NUEVA_ANOTACION' && (
        <div className="max-w-3xl mx-auto glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="font-orbitron text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-400" />
              REGISTRAR ANOTACIÓN EN OBSERVADOR DEL ALUMNO
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Registro disciplinario o mérito con trazabilidad institucional
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
            
            {/* Student & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 uppercase mb-1.5">
                  Estudiante:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-purple-400 focus:outline-none"
                  required
                >
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nombres} {e.apellidos} — Cód: {e.codigo_estudiantil}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1.5">
                  Clasificación de la Situación:
                </label>
                <select
                  value={tipoAnotacion}
                  onChange={(e) => setTipoAnotacion(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-purple-400 focus:outline-none"
                >
                  <option value="RECONOCIMIENTO">🟢 Reconocimiento Positivo / Mérito</option>
                  <option value="TIPO_I">🟡 Tipo I (Falta Leve / Conflictos)</option>
                  <option value="TIPO_II">🟠 Tipo II (Falta Grave / Acoso / Bullying)</option>
                  <option value="TIPO_III">🔴 Tipo III (Falta Gravísima / Presuntos Delitos)</option>
                </select>
              </div>
            </div>

            {/* Asunto / Titulo */}
            <div>
              <label className="block text-slate-300 uppercase mb-1.5">
                Título o Asunto de la Anotación:
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Felicitación por liderazgo en clase / Interrupción reiterada de clase"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-purple-400 focus:outline-none text-sm"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-slate-300 uppercase mb-1.5">
                Descripción Detallada de los Hechos (Objetiva y con Fecha/Lugar):
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describa claramente los hechos ocurridos..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-purple-400 focus:outline-none"
                required
              />
            </div>

            {/* Descargos Alumno */}
            <div>
              <label className="block text-slate-300 uppercase mb-1.5">
                Descargos y Versión del Estudiante:
              </label>
              <textarea
                value={descargosEstudiante}
                onChange={(e) => setDescargosEstudiante(e.target.value)}
                placeholder="Palabras o justificación expresada por el alumno..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Compromisos Estudiante & Acudiente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 uppercase mb-1.5">
                  Compromisos del Estudiante:
                </label>
                <textarea
                  value={compromisosEstudiante}
                  onChange={(e) => setCompromisosEstudiante(e.target.value)}
                  placeholder="Acciones de mejora o reparación pedagógica..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase mb-1.5">
                  Compromisos del Acudiente / Familia:
                </label>
                <textarea
                  value={compromisosAcudiente}
                  onChange={(e) => setCompromisosAcudiente(e.target.value)}
                  placeholder="Seguimiento y apoyo en el hogar..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Docente Registra */}
            <div>
              <label className="block text-slate-300 uppercase mb-1.5">
                Docente o Directivo que Registra:
              </label>
              <input
                type="text"
                value={docenteNombre}
                onChange={(e) => setDocenteNombre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:border-purple-400 focus:outline-none"
                required
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('LISTA')}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar en Observador'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Official Printable Acta Modal */}
      {selectedActa && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-950 border-2 border-purple-500 rounded-3xl p-6 sm:p-8 space-y-4 text-xs font-mono text-slate-300 max-h-[90vh] overflow-y-auto">
            
            <div className="text-center border-b border-slate-800 pb-4">
              <h2 className="font-orbitron text-base font-black text-white">
                INSTITUCIÓN EDUCATIVA TÉCNICA FRANCISCO JOSÉ DE CALDAS
              </h2>
              <p className="text-[10px] text-slate-400">
                ACTA OFICIAL DE SEGUIMIENTO EN OBSERVADOR DEL ALUMNO • 2026
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1">
              <div>Estudiante: <strong className="text-white">{selectedActa.estudiante_nombre}</strong> (Doc: {selectedActa.estudiante_documento})</div>
              <div>Grado: {selectedActa.grado_nombre} — Grupo: {selectedActa.grupo_nombre}</div>
              <div>Fecha y Hora: {selectedActa.fecha} a las {selectedActa.hora}</div>
              <div>Clasificación: <strong className="text-purple-400">{selectedActa.tipo}</strong></div>
              <div>Docente / Evaluador: {selectedActa.docente_nombre}</div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Asunto: {selectedActa.titulo}</h4>
              <p className="bg-slate-900/60 p-3 rounded-xl">{selectedActa.descripcion}</p>
            </div>

            {selectedActa.descargos_estudiante && (
              <div>
                <h5 className="font-bold text-purple-300">Descargos del Estudiante:</h5>
                <p className="italic bg-slate-900/60 p-2.5 rounded-xl">"{selectedActa.descargos_estudiante}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/60 rounded-xl">
                <h5 className="font-bold text-[#00FF66]">Compromiso Estudiante:</h5>
                <p>{selectedActa.compromisos_estudiante}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl">
                <h5 className="font-bold text-amber-300">Compromiso Acudiente:</h5>
                <p>{selectedActa.compromisos_acudiente || 'Acompañamiento institucional'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-500">
              <div className="border-t border-slate-700 pt-2">
                Firma del Docente / Directivo
              </div>
              <div className="border-t border-slate-700 pt-2">
                Firma del Estudiante / Acudiente
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedActa(null)}
                className="px-4 py-2 bg-slate-900 text-slate-400 rounded-xl"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Acta</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
