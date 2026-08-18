import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  AlertTriangle,
  Building,
  Sparkles,
  Users,
  BookOpen,
  QrCode,
  Eye,
  X,
  Award,
  GraduationCap,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { SchoolCrest, getSchoolCrestDataUri, getSchoolCrestPngDataUrl } from './SchoolCrest';
import type { Estudiante, Asistencia, Grado, Grupo, Asignatura, Docente, Sede, EPS } from '../types';

const formatGrupoName = (nombre?: string) => {
  if (!nombre) return '01';
  if (nombre.toLowerCase().startsWith('grupo')) {
    const num = nombre.replace(/grupo\s*/i, '').trim();
    return num ? num.padStart(2, '0') : '01';
  }
  return nombre.padStart(2, '0');
};

interface ReportsModuleProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  grados: Grado[];
  grupos: Grupo[];
  asignaturas: Asignatura[];
  docentes: Docente[];
  sedes: Sede[];
  epsList: EPS[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  estudiantes,
  asistencias,
  grados,
  grupos,
  asignaturas,
  docentes,
  sedes,
  epsList
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MATRIZ_CONSOLIDADA' | 'REPORTE_DETALLADO' | 'ESTADISTICAS_SEMANALES'>('MATRIZ_CONSOLIDADA');
  
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterSede, setFilterSede] = useState<string>('TODAS');
  const [filterGrado, setFilterGrado] = useState<string>('TODOS');
  const [filterGrupo, setFilterGrupo] = useState<string>('TODOS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected Student for Carnet Preview Modal
  const [modalCarnetStudent, setModalCarnetStudent] = useState<Estudiante | null>(null);
  const [modalQrUrl, setModalQrUrl] = useState<string>('');

  React.useEffect(() => {
    if (!modalCarnetStudent) {
      setModalQrUrl('');
      return;
    }
    const payload = JSON.stringify({
      institucion: 'I.E.T. Francisco Jose de Caldas - Natagaima',
      codigo_estudiantil: modalCarnetStudent.codigo_estudiantil,
      numero_doc: modalCarnetStudent.numero_doc,
      nombres: `${modalCarnetStudent.nombres} ${modalCarnetStudent.apellidos}`,
      id: modalCarnetStudent.id
    });
    QRCode.toDataURL(payload, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    })
    .then(url => setModalQrUrl(url))
    .catch(err => console.error(err));
  }, [modalCarnetStudent]);

  // Filtered Attendance Data for Detailed Report
  const filteredData = asistencias.filter(asi => {
    if (startDate && asi.fecha < startDate) return false;
    if (endDate && asi.fecha > endDate) return false;
    if (filterEstado !== 'TODOS' && asi.estado !== filterEstado) return false;

    const student = estudiantes.find(e => e.id === asi.estudiante_id);
    if (!student) return false;

    if (filterSede !== 'TODAS' && student.sede_id !== filterSede) return false;
    if (filterGrado !== 'TODOS' && student.grado_id !== filterGrado) return false;
    if (filterGrupo !== 'TODOS' && student.grupo_id !== filterGrupo) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${student.nombres} ${student.apellidos}`.toLowerCase().includes(q);
      const matchCode = student.codigo_estudiantil.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    return true;
  });

  // Export Consolidate Matrix to Excel
  const handleExportConsolidatedExcel = () => {
    const excelRows = docentes.map(doc => {
      const asig = asignaturas.find(a => a.id === doc.asignatura_id);
      const docAsistencias = asistencias.filter(a => a.docente_id === doc.id);
      
      return {
        'Apellidos Docente': doc.apellidos,
        'Nombres Docente': doc.nombres,
        'Documento Docente': doc.numero_doc,
        'Correo Institucional': doc.correo,
        'Teléfono': doc.telefono,
        'Código Asignatura': asig?.id || 'N/A',
        'Nombre Asignatura Correlacionada': asig?.nombre_asignatura || 'General',
        'Total Reportes Registrados': docAsistencias.length,
        'Asistencias Presentes': docAsistencias.filter(a => a.estado === 'PRESENTE').length,
        'Retardos': docAsistencias.filter(a => a.estado === 'TARDE').length,
        'Incapacidades / Excusas': docAsistencias.filter(a => a.estado === 'EXCUSADO').length
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matriz Docentes y Asignaturas');

    XLSX.writeFile(workbook, `Matriz_Consolidada_Docentes_Asignaturas_IET_Caldas.xlsx`);
  };

  // Export Full Student Report PDF with Shield Header
  const handleExportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Logo / Crest Data Uri
    const crestUri = await getSchoolCrestPngDataUrl();
    if (crestUri) {
      try {
        doc.addImage(crestUri, 'PNG', 12, 10, 22, 24);
      } catch (err) {
        console.warn("Could not add crest image to PDF:", err);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 200);
    doc.text('INSTITUCIÓN EDUCATIVA TÉCNICA FRANCISCO JOSÉ DE CALDAS', 150, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(80, 90, 100);
    doc.text('NATAGAIMA - TOLIMA • DANE: 173483000018 • NIT: 890.702.341-2', 150, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(20, 20, 30);
    doc.text(`REPORTE CONSOLIDADO SEMANAL POR ESTUDIANTES, DOCENTES Y CARNÉ QR`, 150, 26, { align: 'center' });

    const tableHead = [['Código', 'Estudiante', 'Grado/Grupo', 'Sede', 'Docente / Asignatura', 'RH', 'Estado Carné', 'Días Asistidos', 'Tardanzas', 'Excusas']];
    
    const tableBody = estudiantes.map(st => {
      const g = grados.find(gr => gr.id === st.grado_id);
      const grp = grupos.find(gr => gr.id === st.grupo_id);
      const s = sedes.find(sd => sd.id === st.sede_id);
      const stAsist = asistencias.filter(a => a.estudiante_id === st.id);
      const docObj = docentes[0]; // representative doc
      const asigObj = asignaturas.find(a => a.id === docObj?.asignatura_id);

      const presentes = stAsist.filter(a => a.estado === 'PRESENTE').length;
      const tardes = stAsist.filter(a => a.estado === 'TARDE').length;
      const excusados = stAsist.filter(a => a.estado === 'EXCUSADO').length;

      return [
        st.codigo_estudiantil,
        `${st.apellidos}, ${st.nombres}`,
        `${g?.nombre_grado || ''} (${grp?.nombre_grupo || ''})`,
        s?.nombre_sede?.split('-')[0] || 'Sede Principal',
        docObj ? `${docObj.apellidos} - ${asigObj?.nombre_asignatura || 'General'}` : 'General',
        st.rh || 'O+',
        'Carné Generado (QR Activo)',
        presentes.toString(),
        tardes.toString(),
        excusados.toString()
      ];
    });

    autoTable(doc, {
      startY: 32,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [0, 240, 255], fontStyle: 'bold' },
      styles: { fontSize: 7.5, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

    if (finalY < 180) {
      doc.setDrawColor(150, 150, 150);
      doc.line(40, finalY, 110, finalY);
      doc.line(180, finalY, 250, finalY);

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Firma Docente / Coordinación Académica', 75, finalY + 5, { align: 'center' });
      doc.text('Rectoría - I.E.T. Francisco José de Caldas', 215, finalY + 5, { align: 'center' });
    }

    doc.save(`Reporte_Consolidado_Caldas_Natagaima.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SchoolCrest size={48} showGlow={true} />
          <div>
            <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#00FF66]" />
              Matriz Consolidada de Docentes, Asignaturas, Estadísticas y Carnés
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Sedes Primaria (María Auxiliadora) y Secundaria (Sede Principal) • Natagaima, Tolima
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportConsolidatedExcel}
            className="neon-btn-green px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Matriz Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="neon-btn-cyan px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar Consolidado PDF
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('MATRIZ_CONSOLIDADA')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'MATRIZ_CONSOLIDADA'
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#00F0FF]" />
          1. Correlación Docentes & Asignaturas ({docentes.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ESTADISTICAS_SEMANALES')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'ESTADISTICAS_SEMANALES'
              ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4 text-[#00FF66]" />
          2. Reporte Semanal por Estudiante & Carné QR
        </button>

        <button
          onClick={() => setActiveSubTab('REPORTE_DETALLADO')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'REPORTE_DETALLADO'
              ? 'bg-[#7000FF]/20 text-[#c084fc] border border-[#7000FF] shadow-[0_0_15px_rgba(112,0,255,0.3)]'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Clock className="w-4 h-4 text-[#c084fc]" />
          3. Historial Registro de Asistencia
        </button>
      </div>

      {/* SUBTAB 1: CORRELACION DOCENTES & ASIGNATURAS */}
      {activeSubTab === 'MATRIZ_CONSOLIDADA' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-orbitron text-sm font-bold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#00F0FF]" />
                Nómina Oficial de Docentes e Intensidad Horaria Asignada
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Correlación ordenada alfabéticamente por primer apellido del docente
              </p>
            </div>
            <span className="text-xs font-mono text-[#00FF66] bg-[#00FF66]/10 px-3 py-1 rounded-full border border-[#00FF66]/30 font-bold">
              19 Docentes Titulares
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Apellidos y Nombres</th>
                  <th className="py-3.5 px-4">Documento</th>
                  <th className="py-3.5 px-4">Asignatura Correlacionada</th>
                  <th className="py-3.5 px-4">Sede / Nivel</th>
                  <th className="py-3.5 px-4">Correo Institucional</th>
                  <th className="py-3.5 px-4 text-center">Reportes Semanales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {docentes.map((doc, idx) => {
                  const asigObj = asignaturas.find(a => a.id === doc.asignatura_id);
                  const countReportes = asistencias.filter(a => a.docente_id === doc.id).length;
                  const isMediaT = asigObj?.nombre_asignatura.includes('10°') || asigObj?.nombre_asignatura.includes('Programación') || asigObj?.nombre_asignatura.includes('Hardware');

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-100">
                        {doc.apellidos} {doc.nombres}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{doc.numero_doc}</td>
                      <td className="py-3 px-4 font-bold text-[#00F0FF]">
                        {asigObj ? asigObj.nombre_asignatura : 'Educación Básica'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isMediaT ? 'bg-[#7000FF]/20 text-[#c084fc] border border-[#7000FF]/40' : 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                        }`}>
                          {isMediaT ? 'Sede Principal (10° y 11°)' : 'Primaria & Secundaria'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 underline underline-offset-2">{doc.correo}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#00FF66]">
                        {countReportes > 0 ? `${countReportes} Registros` : '0 Registros'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ESTADISTICAS SEMANALES POR ESTUDIANTE Y CARNE */}
      {activeSubTab === 'ESTADISTICAS_SEMANALES' && (() => {
        // Weekly Days Aggregation
        const weeklyDaysData = [
          { dia: 'Lunes', aTiempo: 0, retardos: 0, fallas: 0 },
          { dia: 'Martes', aTiempo: 0, retardos: 0, fallas: 0 },
          { dia: 'Miércoles', aTiempo: 0, retardos: 0, fallas: 0 },
          { dia: 'Jueves', aTiempo: 0, retardos: 0, fallas: 0 },
          { dia: 'Viernes', aTiempo: 0, retardos: 0, fallas: 0 },
        ];

        asistencias.forEach(asi => {
          const d = new Date(asi.fecha);
          const day = d.getDay();
          if (day >= 1 && day <= 5) {
            const idx = day - 1;
            if (asi.estado === 'PRESENTE') weeklyDaysData[idx].aTiempo++;
            else if (asi.estado === 'TARDE') weeklyDaysData[idx].retardos++;
            else weeklyDaysData[idx].fallas++;
          }
        });

        // Fallas por Área Aggregation
        const fallasPorAreaMap: Record<string, number> = {};
        asignaturas.forEach(asig => {
          fallasPorAreaMap[asig.nombre_asignatura] = 0;
        });

        asistencias.forEach(asi => {
          if (asi.estado === 'TARDE' || asi.estado === 'EXCUSADO') {
            const asigObj = asignaturas.find(a => a.id === asi.asignatura_id);
            const name = asigObj ? asigObj.nombre_asignatura : 'Educación Básica';
            fallasPorAreaMap[name] = (fallasPorAreaMap[name] || 0) + 1;
          }
        });

        const chartAreaFallas = Object.entries(fallasPorAreaMap).map(([area, count]) => ({
          areaShort: area.length > 18 ? area.slice(0, 16) + '...' : area,
          areaFull: area,
          fallas: count
        }));

        return (
          <div className="space-y-6">

            {/* Graphic Section 1: Weekly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Weekly Asistencia Bar Chart */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-orbitron text-sm font-bold text-[#00F0FF] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#00F0FF]" />
                      Gráfica Estadística Semanal de Asistencia
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Desglose de ingresos A Tiempo, Retardos y Fallas (Lunes a Viernes)
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyDaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#00F0FF', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="aTiempo" name="A Tiempo" fill="#00FF66" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="retardos" name="Retardos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fallas" name="Incapacidades/Excusas" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fallas por Área Bar Chart */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-orbitron text-sm font-bold text-[#c084fc] flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      Gráfica de Fallas y Retardos por Área Académica
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Total de inasistencias y tardanzas registradas por Asignatura
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartAreaFallas} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="areaShort" 
                        stroke="#94a3b8" 
                        tick={{ fontSize: 9, fontFamily: 'monospace' }} 
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                      <Tooltip 
                        formatter={(val: number) => [`${val} Novedades`, 'Fallas / Retardos']}
                        labelFormatter={(lbl: string, items) => items[0]?.payload?.areaFull || lbl}
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#7000FF', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Bar dataKey="fallas" name="Fallas/Retardos" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                        {chartAreaFallas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f43f5e' : '#fb923c'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Filters for Students Table */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Filtrar por Sede:</label>
                <select
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="TODAS">Todas las Sedes</option>
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Filtrar por Grado:</label>
                <select
                  value={filterGrado}
                  onChange={(e) => setFilterGrado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="TODOS">Todos los Grados (1° a 11°)</option>
                  {grados.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre_grado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Filtrar por Grupo:</label>
                <select
                  value={filterGrupo}
                  onChange={(e) => setFilterGrupo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="TODOS">Todos los Grupos</option>
                  {grupos.map(grp => (
                    <option key={grp.id} value={grp.id}>{formatGrupoName(grp.nombre_grupo)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Buscar Estudiante:</label>
                <input
                  type="text"
                  placeholder="Nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            {/* Student Table with Carnet Preview and Detailed Faults per Area */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-orbitron text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00F0FF]" />
                  Resumen de Asistencias y Fallas por Estudiante
                </h3>
                <span className="text-[11px] font-mono text-[#00FF66]">
                  {estudiantes.length} Estudiantes Registrados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Código</th>
                      <th className="py-3.5 px-4">Estudiante</th>
                      <th className="py-3.5 px-4">Grado / Sede</th>
                      <th className="py-3.5 px-4">Grupo</th>
                      <th className="py-3.5 px-4">RH</th>
                      <th className="py-3.5 px-4 text-center">Asistencias</th>
                      <th className="py-3.5 px-4 text-center">Fallas por Área</th>
                      <th className="py-3.5 px-4 text-center">Carné QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {estudiantes
                      .filter(st => {
                        if (filterSede !== 'TODAS' && st.sede_id !== filterSede) return false;
                        if (filterGrado !== 'TODOS' && st.grado_id !== filterGrado) return false;
                        if (filterGrupo !== 'TODOS' && st.grupo_id !== filterGrupo) return false;
                        if (searchTerm) {
                          const q = searchTerm.toLowerCase();
                          const name = `${st.nombres} ${st.apellidos}`.toLowerCase();
                          const code = st.codigo_estudiantil.toLowerCase();
                          if (!name.includes(q) && !code.includes(q)) return false;
                        }
                        return true;
                      })
                      .map(st => {
                        const g = grados.find(gr => gr.id === st.grado_id);
                        const grp = grupos.find(gr => gr.id === st.grupo_id);
                        const s = sedes.find(sd => sd.id === st.sede_id);
                        const stAsist = asistencias.filter(a => a.estudiante_id === st.id);

                        const countPresente = stAsist.filter(a => a.estado === 'PRESENTE').length;
                        const countTarde = stAsist.filter(a => a.estado === 'TARDE').length;
                        const countExcusa = stAsist.filter(a => a.estado === 'EXCUSADO').length;

                        // Detailed Faults by Subject for this student
                        const studentFaultsByArea: Record<string, { tarde: number; excusa: number }> = {};
                        stAsist.forEach(a => {
                          if (a.estado === 'TARDE' || a.estado === 'EXCUSADO') {
                            const asigObj = asignaturas.find(as => as.id === a.asignatura_id);
                            const name = asigObj ? asigObj.nombre_asignatura : 'General';
                            if (!studentFaultsByArea[name]) {
                              studentFaultsByArea[name] = { tarde: 0, excusa: 0 };
                            }
                            if (a.estado === 'TARDE') studentFaultsByArea[name].tarde++;
                            if (a.estado === 'EXCUSADO') studentFaultsByArea[name].excusa++;
                          }
                        });

                        const hasFaults = Object.keys(studentFaultsByArea).length > 0;

                        return (
                          <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-[#00F0FF]">{st.codigo_estudiantil}</td>
                            <td className="py-3 px-4 font-sans font-bold text-slate-100">
                              {st.nombres} {st.apellidos}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {g?.nombre_grado}
                              <span className="block text-[10px] text-slate-500">{s?.nombre_sede?.split('-')[0]}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-amber-400">
                              {formatGrupoName(grp?.nombre_grupo)}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#00FF66]">
                              {st.rh || 'O+'}
                            </td>
                            <td className="py-3 px-4 text-center space-x-1">
                              <span className="px-2 py-0.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-md font-bold">
                                {countPresente} A Tiempo
                              </span>
                              {countTarde > 0 && (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md font-bold">
                                  {countTarde} Tarde
                                </span>
                              )}
                              {countExcusa > 0 && (
                                <span className="px-2 py-0.5 bg-[#7000FF]/10 text-[#c084fc] border border-[#7000FF]/30 rounded-md font-bold">
                                  {countExcusa} Excusa
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {hasFaults ? (
                                <div className="space-y-1">
                                  {Object.entries(studentFaultsByArea).map(([areaName, counts]) => (
                                    <div key={areaName} className="flex items-center justify-between text-[10px] bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                                      <span className="text-slate-300 font-bold truncate max-w-[140px]">{areaName}</span>
                                      <div className="flex gap-1">
                                        {counts.tarde > 0 && (
                                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                                            {counts.tarde} Tarde
                                          </span>
                                        )}
                                        {counts.excusa > 0 && (
                                          <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-bold">
                                            {counts.excusa} Excusa
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic block text-center">Sin fallas por área</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setModalCarnetStudent(st)}
                                className="px-3 py-1 bg-slate-800 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 rounded-xl font-bold flex items-center gap-1 mx-auto transition-all text-[11px]"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                Ver Carné
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Faults Card breakdown per Student & Area */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-orbitron text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Reporte Individual de Fallas y Novedades por Estudiante y Área
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Muestra cada inasistencia, retardo y observación clasificada por asignatura
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estudiantes.map(st => {
                  const g = grados.find(gr => gr.id === st.grado_id);
                  const grp = grupos.find(gr => gr.id === st.grupo_id);
                  const stFaults = asistencias.filter(a => a.estudiante_id === st.id && a.estado !== 'PRESENTE');

                  if (stFaults.length === 0) return null;

                  return (
                    <div key={st.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
                      <div className="flex items-center gap-3">
                        <img 
                          src={st.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"} 
                          alt="Student" 
                          className="w-10 h-10 rounded-xl object-cover border border-[#00F0FF]/40"
                        />
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs font-sans">{st.nombres} {st.apellidos}</h4>
                          <p className="text-[10px] font-mono text-[#00F0FF]">{g?.nombre_grado} — {formatGrupoName(grp?.nombre_grupo)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-slate-800/80 pt-2 font-mono text-xs">
                        {stFaults.map(asi => {
                          const asig = asignaturas.find(a => a.id === asi.asignatura_id);
                          return (
                            <div key={asi.id} className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-[#00FF66]">{asig ? asig.nombre_asignatura : 'Área Básica'}</span>
                                <span className="text-slate-400">{asi.fecha}</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300">Estado:</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                  asi.estado === 'TARDE' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {asi.estado}
                                </span>
                              </div>
                              {asi.observacion && (
                                <p className="text-[10px] text-slate-400 italic">Obs: {asi.observacion}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        );
      })()}

      {/* SUBTAB 3: HISTORIAL DETALLADO DE REGISTRO */}
      {activeSubTab === 'REPORTE_DETALLADO' && (
        <div className="space-y-4">
          
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 uppercase text-[10px]">Fecha Inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase text-[10px]">Fecha Fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase text-[10px]">Estado:</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="PRESENTE">PRESENTE</option>
                <option value="TARDE">TARDE</option>
                <option value="EXCUSADO">EXCUSADO</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 uppercase text-[10px]">Buscar Alumno:</label>
              <input
                type="text"
                placeholder="Nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Hora Ingreso</th>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Estudiante</th>
                  <th className="py-3.5 px-4">Grado / Grupo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredData.map(asi => {
                  const st = estudiantes.find(e => e.id === asi.estudiante_id);
                  const g = grados.find(gr => gr.id === st?.grado_id);
                  const grp = grupos.find(gr => gr.id === st?.grupo_id);

                  return (
                    <tr key={asi.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-300">{asi.fecha}</td>
                      <td className="py-3 px-4 text-slate-100">{asi.hora_ingreso}</td>
                      <td className="py-3 px-4 text-[#00F0FF] font-bold">{st?.codigo_estudiantil}</td>
                      <td className="py-3 px-4 font-sans font-bold">{st ? `${st.nombres} ${st.apellidos}` : '-'}</td>
                      <td className="py-3 px-4">{g?.nombre_grado} ({grp?.nombre_grupo})</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asi.estado === 'PRESENTE' ? 'bg-[#00FF66]/10 text-[#00FF66]' :
                          asi.estado === 'TARDE' ? 'bg-amber-500/10 text-amber-400' : 'bg-[#7000FF]/10 text-[#c084fc]'
                        }`}>
                          {asi.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic">{asi.observacion || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Carnet Preview Popover */}
      {modalCarnetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-[#00F0FF]/50 max-w-sm w-full space-y-4 relative">
            <button
              onClick={() => setModalCarnetStudent(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="font-orbitron text-xs font-bold text-[#00F0FF]">
                CARNÉ ESTUDIANTIL OFICIAL
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                I.E.T. Francisco José de Caldas • Natagaima
              </p>
            </div>

            {/* Carnet CR80 Card */}
            <div className="w-full bg-slate-950 border-2 border-[#00F0FF] rounded-2xl p-4 shadow-[0_0_25px_rgba(0,240,255,0.3)] space-y-3 font-mono text-xs relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <SchoolCrest size={32} showGlow={false} />
                <div>
                  <h4 className="font-bold text-[10px] text-white">I.E.T. FRANCISCO JOSÉ DE CALDAS</h4>
                  <p className="text-[9px] text-[#00F0FF]">NATAGAIMA - TOLIMA</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <img
                  src={modalCarnetStudent.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                  alt="Estudiante"
                  className="w-16 h-20 rounded-xl object-cover border border-[#00F0FF]"
                />
                <div className="space-y-0.5 text-[10px]">
                  <h5 className="font-sans font-bold text-xs text-white leading-tight">
                    {modalCarnetStudent.nombres} <br /> {modalCarnetStudent.apellidos}
                  </h5>
                  <p className="text-[#00F0FF] font-bold">{modalCarnetStudent.codigo_estudiantil}</p>
                  <p className="text-slate-300">Doc: {modalCarnetStudent.numero_doc}</p>
                  <p className="text-emerald-400 font-bold">RH: {modalCarnetStudent.rh || 'O+'}</p>
                </div>
              </div>

              {/* High Contrast QR Code */}
              <div className="bg-white p-2 rounded-xl flex justify-center items-center shadow-inner">
                {modalQrUrl ? (
                  <img src={modalQrUrl} alt="QR Code Alto Contraste" className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-xs font-mono text-slate-500">
                    Cargando QR...
                  </div>
                )}
              </div>

              <p className="text-[8px] text-center text-slate-400 font-sans">
                Acredita al portador como estudiante matriculado regularmente.
              </p>
            </div>

            <button
              onClick={() => setModalCarnetStudent(null)}
              className="w-full neon-btn-cyan py-2.5 rounded-xl font-bold font-mono text-xs uppercase"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
