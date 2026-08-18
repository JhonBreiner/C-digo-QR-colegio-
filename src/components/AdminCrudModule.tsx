import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Database, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserCheck, 
  HeartPulse, 
  Shield, 
  MapPin, 
  FileText,
  X,
  Sparkles
} from 'lucide-react';
import type { 
  Estudiante, Docente, Grado, Grupo, Sede, Asignatura, 
  Acudiente, PadreFamilia, EPS, ARL, TipoDocumento,
  Departamento, Ciudad
} from '../types';

interface AdminCrudModuleProps {
  estudiantes: Estudiante[];
  docentes: Docente[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  asignaturas: Asignatura[];
  acudientes: Acudiente[];
  epsList: EPS[];
  arlList: ARL[];
  tiposDocumento: TipoDocumento[];
  onAddEstudiante: (estudiante: Omit<Estudiante, 'id'>) => Promise<void>;
  onDeleteEstudiante: (id: string) => Promise<void>;
  onAddDocente: (docente: Omit<Docente, 'id'>) => Promise<void>;
  onDeleteDocente: (id: string) => Promise<void>;
  onResetSeedData: () => void;
}

export const AdminCrudModule: React.FC<AdminCrudModuleProps> = ({
  estudiantes,
  docentes,
  grados,
  grupos,
  sedes,
  asignaturas,
  acudientes,
  epsList,
  arlList,
  tiposDocumento,
  onAddEstudiante,
  onDeleteEstudiante,
  onAddDocente,
  onDeleteDocente,
  onResetSeedData,
}) => {
  const [activeTab, setActiveTab] = useState<'ESTUDIANTES' | 'DOCENTES' | 'PARAMETRICOS'>('ESTUDIANTES');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [showAddTeacher, setShowAddTeacher] = useState<boolean>(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    codigo_estudiantil: `2026-CALDAS-${String(estudiantes.length + 1).padStart(3, '0')}`,
    tipo_doc_id: 'TD-01',
    numero_doc: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '2010-01-01',
    estrato: 1,
    genero: 'M',
    observacion_medica: 'Ninguna',
    grado_id: grados[0]?.id || '',
    grupo_id: grupos[0]?.id || '',
    sede_id: sedes[0]?.id || '',
    eps_id: epsList[0]?.id || '',
    arl_id: arlList[0]?.id || '',
    acudiente_id: acudientes[0]?.id || '',
    padre_id: 'PAD-01'
  });

  // New Teacher Form State
  const [newTeacher, setNewTeacher] = useState({
    tipo_doc_id: 'TD-02',
    numero_doc: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    asignatura_id: asignaturas[0]?.id || ''
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.nombres || !newStudent.apellidos || !newStudent.numero_doc) return;

    await onAddEstudiante(newStudent);
    setShowAddStudent(false);
    alert("¡Estudiante creado exitosamente en el sistema!");
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.nombres || !newTeacher.apellidos || !newTeacher.correo) return;

    await onAddDocente(newTeacher);
    setShowAddTeacher(false);
    alert("¡Docente registrado exitosamente!");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00FF66]" />
            Panel de Administración & Gestión de Colecciones (CRUD)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Administración completa de Estudiantes, Docentes, Grados, Grupos y Tablas de Parametrización
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetSeedData}
            className="neon-btn-purple px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            Reset Base de Datos (Semilla Natagaima)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('ESTUDIANTES')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'ESTUDIANTES'
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Estudiantes ({estudiantes.length})
        </button>

        <button
          onClick={() => setActiveTab('DOCENTES')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'DOCENTES'
              ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Docentes ({docentes.length})
        </button>

        <button
          onClick={() => setActiveTab('PARAMETRICOS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'PARAMETRICOS'
              ? 'bg-[#7000FF]/20 text-[#c084fc] border border-[#7000FF]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sedes & Tablas Paramétricas
        </button>
      </div>

      {/* TAB 1: ESTUDIANTES */}
      {activeTab === 'ESTUDIANTES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddStudent(true)}
              className="neon-btn-cyan px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nuevo Estudiante
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Estudiante</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Grado</th>
                  <th className="p-3">Sede</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {estudiantes
                  .filter(st => 
                    `${st.nombres} ${st.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    st.codigo_estudiantil.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(st => {
                    const g = grados.find(gr => gr.id === st.grado_id);
                    const s = sedes.find(sd => sd.id === st.sede_id);
                    return (
                      <tr key={st.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-[#00F0FF] font-bold">{st.codigo_estudiantil}</td>
                        <td className="p-3 font-sans font-bold">{st.nombres} {st.apellidos}</td>
                        <td className="p-3 text-slate-400">{st.numero_doc}</td>
                        <td className="p-3">{g?.nombre_grado || ''}</td>
                        <td className="p-3 truncate max-w-xs">{s?.nombre_sede || ''}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onDeleteEstudiante(st.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCENTES */}
      {activeTab === 'DOCENTES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-orbitron text-sm font-bold text-slate-200">Planta Docente Oficial — I.E.T. Francisco José de Caldas</h3>
              <p className="text-[11px] text-slate-400 font-mono">Docentes vinculados con sus respectivas áreas curriculares e Intensidad Horaria Semanal (I.H.S)</p>
            </div>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="neon-btn-green px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nuevo Docente
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Docente</th>
                  <th className="p-3">Áreas & Asignaturas a Cargo</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Correo Institucional</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {docentes.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans font-bold text-slate-100">{d.nombres} {d.apellidos}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {d.asignaturas_nombres && d.asignaturas_nombres.length > 0 ? (
                          d.asignaturas_nombres.map((asig, i) => (
                            <span key={i} className="inline-block bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              {asig}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">Sin asignación</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">{d.numero_doc}</td>
                    <td className="p-3 text-[#00F0FF]">{d.correo}</td>
                    <td className="p-3">{d.telefono}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteDocente(d.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PARAMETRICOS */}
      {activeTab === 'PARAMETRICOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-[#00F0FF] uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Sedes Educativas ({sedes.length})
            </h4>
            <ul className="space-y-1 text-slate-300">
              {sedes.map(s => (
                <li key={s.id} className="p-2 bg-slate-900 rounded-lg">{s.nombre_sede}</li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-[#00FF66] uppercase flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Grados Académicos ({grados.length})
            </h4>
            <ul className="space-y-1 text-slate-300">
              {grados.map(g => (
                <li key={g.id} className="p-2 bg-slate-900 rounded-lg">{g.nombre_grado}</li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-bold text-[#c084fc] uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Asignaturas del Boletín ({asignaturas.length})
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {asignaturas.map(a => (
                <div key={a.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{a.nombre_asignatura}</span>
                    {a.ihs && (
                      <span className="text-[10px] bg-[#00FF66]/10 text-[#00FF66] px-1.5 py-0.5 rounded font-bold">
                        I.H.S: {a.ihs}h
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5 flex justify-between">
                    <span>Área: {a.area || 'General'}</span>
                    <span className="text-[#00F0FF]">{a.docente_titular}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-[#00F0FF]/50 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-orbitron text-sm font-bold text-white">Nuevo Estudiante</h3>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block">Nombres:</label>
                  <input
                    type="text"
                    required
                    value={newStudent.nombres}
                    onChange={(e) => setNewStudent({...newStudent, nombres: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={newStudent.apellidos}
                    onChange={(e) => setNewStudent({...newStudent, apellidos: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block">Documento Identidad:</label>
                  <input
                    type="text"
                    required
                    value={newStudent.numero_doc}
                    onChange={(e) => setNewStudent({...newStudent, numero_doc: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block">Código Estudiantil:</label>
                  <input
                    type="text"
                    required
                    value={newStudent.codigo_estudiantil}
                    onChange={(e) => setNewStudent({...newStudent, codigo_estudiantil: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[#00F0FF] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block">Grado:</label>
                  <select
                    value={newStudent.grado_id}
                    onChange={(e) => setNewStudent({...newStudent, grado_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {grados.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre_grado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block">Grupo:</label>
                  <select
                    value={newStudent.grupo_id}
                    onChange={(e) => setNewStudent({...newStudent, grupo_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {grupos.map(grp => (
                      <option key={grp.id} value={grp.id}>{grp.nombre_grupo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block">Sede:</label>
                  <select
                    value={newStudent.sede_id}
                    onChange={(e) => setNewStudent({...newStudent, sede_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {sedes.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full neon-btn-cyan py-3 rounded-xl font-bold uppercase tracking-wider"
              >
                Guardar Estudiante
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Teacher */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-[#00FF66]/50 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-orbitron text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00FF66]" />
                Registrar Nuevo Docente
              </h3>
              <button onClick={() => setShowAddTeacher(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block">Nombres:</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.nombres}
                    onChange={(e) => setNewTeacher({...newTeacher, nombres: e.target.value})}
                    placeholder="Ej. María Camila"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block">Apellidos:</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.apellidos}
                    onChange={(e) => setNewTeacher({...newTeacher, apellidos: e.target.value})}
                    placeholder="Ej. Bernal"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block">Documento Identidad:</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.numero_doc}
                    onChange={(e) => setNewTeacher({...newTeacher, numero_doc: e.target.value})}
                    placeholder="Ej. 1110543220"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block">Teléfono / Celular:</label>
                  <input
                    type="text"
                    value={newTeacher.telefono}
                    onChange={(e) => setNewTeacher({...newTeacher, telefono: e.target.value})}
                    placeholder="Ej. 3118901220"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block">Correo Institucional:</label>
                <input
                  type="email"
                  required
                  value={newTeacher.correo}
                  onChange={(e) => setNewTeacher({...newTeacher, correo: e.target.value})}
                  placeholder="Ej. camila.bernal@ietcaldas.edu.co"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-slate-400 block">Área / Asignatura Principal:</label>
                <select
                  value={newTeacher.asignatura_id}
                  onChange={(e) => setNewTeacher({...newTeacher, asignatura_id: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {asignaturas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre_asignatura} {a.area ? `(${a.area})` : ''} {a.ihs ? `— IHS: ${a.ihs}h` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full neon-btn-green py-3 rounded-xl font-bold uppercase tracking-wider mt-4"
              >
                Guardar Docente
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
