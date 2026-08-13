import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck2, 
  TrendingUp, 
  Filter, 
  Calendar,
  Sparkles,
  Search,
  Activity,
  Layers
} from 'lucide-react';
import type { Estudiante, Asistencia, Grado, Grupo } from '../types';

interface DashboardStatsProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  grados: Grado[];
  grupos: Grupo[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  estudiantes,
  asistencias,
  grados,
  grupos,
  selectedDate,
  setSelectedDate,
}) => {
  const [selectedGrado, setSelectedGrado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter students based on grade
  const filteredStudents = estudiantes.filter(e => {
    if (selectedGrado !== 'TODOS' && e.grado_id !== selectedGrado) return false;
    return true;
  });

  const totalEstudiantesCount = filteredStudents.length;

  // Filter asistencias by selected date and grade
  const filteredAsistencias = asistencias.filter(a => {
    if (a.fecha !== selectedDate) return false;
    const student = estudiantes.find(e => e.id === a.estudiante_id);
    if (!student) return false;
    if (selectedGrado !== 'TODOS' && student.grado_id !== selectedGrado) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = `${student.nombres} ${student.apellidos}`.toLowerCase().includes(query);
      const matchCode = student.codigo_estudiantil.toLowerCase().includes(query);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const presentes = filteredAsistencias.filter(a => a.estado === 'PRESENTE').length;
  const tardes = filteredAsistencias.filter(a => a.estado === 'TARDE').length;
  const excusados = filteredAsistencias.filter(a => a.estado === 'EXCUSADO').length;
  const registrados = presentes + tardes + excusados;
  const ausentes = Math.max(0, totalEstudiantesCount - registrados);

  const asistenciaPorcentaje = totalEstudiantesCount > 0 
    ? Math.round((registrados / totalEstudiantesCount) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter & Date Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-mono">
            <Calendar className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-slate-400">Fecha:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[#00F0FF] focus:outline-none font-bold"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-mono">
            <Filter className="w-4 h-4 text-[#7000FF]" />
            <span className="text-slate-400">Grado:</span>
            <select
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-bold cursor-pointer"
            >
              <option value="TODOS" className="bg-slate-900 text-slate-200">Todos los Grados</option>
              {grados.map(g => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-slate-200">{g.nombre_grado}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full font-mono text-xs"
          />
        </div>
      </div>

      {/* Cyber HUD Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Estudiantes */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#00F0FF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F0FF]/5 rounded-full blur-xl group-hover:bg-[#00F0FF]/15 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Matrícula Total</span>
            <div className="p-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-xl text-[#00F0FF]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-orbitron text-3xl font-extrabold text-white tracking-tight">{totalEstudiantesCount}</span>
            <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#00F0FF]" /> Activos I.E.T. Caldas
            </p>
          </div>
        </div>

        {/* Presentes */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#00FF66]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF66]/5 rounded-full blur-xl group-hover:bg-[#00FF66]/15 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Presentes</span>
            <div className="p-2 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-xl text-[#00FF66]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-orbitron text-3xl font-extrabold text-[#00FF66] tracking-tight">{presentes}</span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">A tiempo (Puntuales)</p>
          </div>
        </div>

        {/* Tardes */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/15 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Llegada Tarde</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-orbitron text-3xl font-extrabold text-amber-400 tracking-tight">{tardes}</span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">Con retardo justificado</p>
          </div>
        </div>

        {/* Excusados */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#7000FF]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7000FF]/5 rounded-full blur-xl group-hover:bg-[#7000FF]/15 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Excusados</span>
            <div className="p-2 bg-[#7000FF]/10 border border-[#7000FF]/30 rounded-xl text-[#c084fc]">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-orbitron text-3xl font-extrabold text-[#c084fc] tracking-tight">{excusados}</span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">Incapacidad médica</p>
          </div>
        </div>

        {/* Ausentes */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/15 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sin Registro</span>
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-orbitron text-3xl font-extrabold text-rose-400 tracking-tight">{ausentes}</span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">Ausentes no reportados</p>
          </div>
        </div>

      </div>

      {/* Cyber Progress HUD Meter */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#00F0FF] animate-pulse" />
            <h3 className="font-orbitron text-sm font-bold text-slate-200 tracking-wide uppercase">
              Tasa de Asistencia Global en Tiempo Real
            </h3>
          </div>
          <span className="font-orbitron text-2xl font-black text-[#00F0FF]">{asistenciaPorcentaje}%</span>
        </div>

        <div className="w-full bg-slate-900/90 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#7000FF] via-[#00F0FF] to-[#00FF66] transition-all duration-1000 shadow-[0_0_12px_#00F0FF]"
            style={{ width: `${asistenciaPorcentaje}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
          <span>0%</span>
          <span>50%</span>
          <span>Meta Institucional: 95%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Attendance Activity Log Feed Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/40">
          <div>
            <h3 className="font-orbitron text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              Registro de Asistencias - {selectedDate}
            </h3>
            <p className="text-xs text-slate-400 font-mono">Mostrando historial de escaneos y entradas para el día seleccionado</p>
          </div>
          <span className="px-3 py-1 bg-slate-900 text-xs font-mono text-[#00F0FF] border border-[#00F0FF]/30 rounded-full w-fit">
            {filteredAsistencias.length} Registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Grado / Grupo</th>
                <th className="py-3.5 px-4">Hora Ingreso</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAsistencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                    No hay registros de asistencia para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAsistencias.map((asi) => {
                  const student = estudiantes.find(e => e.id === asi.estudiante_id);
                  const gradoObj = grados.find(g => g.id === student?.grado_id);
                  const grupoObj = grupos.find(g => g.id === student?.grupo_id);

                  return (
                    <tr key={asi.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-slate-100 flex items-center gap-3">
                        <img 
                          src={student?.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
                          alt="Student" 
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold">{student ? `${student.nombres} ${student.apellidos}` : 'Desconocido'}</p>
                          <p className="text-[10px] text-slate-400">DOC: {student?.numero_doc}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#00F0FF] font-bold">{student?.codigo_estudiantil}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {gradoObj?.nombre_grado} • {grupoObj?.nombre_grupo}
                      </td>
                      <td className="py-3 px-4 text-slate-100 font-semibold">{asi.hora_ingreso}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          asi.estado === 'PRESENTE' 
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/40' 
                            : asi.estado === 'TARDE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40'
                            : 'bg-[#7000FF]/10 text-[#c084fc] border border-[#7000FF]/40'
                        }`}>
                          {asi.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">
                        {asi.observacion || 'Sin observaciones'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
