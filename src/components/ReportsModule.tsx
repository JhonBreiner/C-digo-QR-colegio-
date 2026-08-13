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
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Estudiante, Asistencia, Grado, Grupo, Asignatura } from '../types';

interface ReportsModuleProps {
  estudiantes: Estudiante[];
  asistencias: Asistencia[];
  grados: Grado[];
  grupos: Grupo[];
  asignaturas: Asignatura[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  estudiantes,
  asistencias,
  grados,
  grupos,
  asignaturas,
}) => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterGrado, setFilterGrado] = useState<string>('TODOS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtered Attendance Data
  const filteredData = asistencias.filter(asi => {
    if (startDate && asi.fecha < startDate) return false;
    if (endDate && asi.fecha > endDate) return false;
    if (filterEstado !== 'TODOS' && asi.estado !== filterEstado) return false;

    const student = estudiantes.find(e => e.id === asi.estudiante_id);
    if (!student) return false;

    if (filterGrado !== 'TODOS' && student.grado_id !== filterGrado) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${student.nombres} ${student.apellidos}`.toLowerCase().includes(q);
      const matchCode = student.codigo_estudiantil.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    return true;
  });

  // Summary counts
  const countPresente = filteredData.filter(d => d.estado === 'PRESENTE').length;
  const countTarde = filteredData.filter(d => d.estado === 'TARDE').length;
  const countExcusado = filteredData.filter(d => d.estado === 'EXCUSADO').length;
  const totalRegistros = filteredData.length;

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const excelRows = filteredData.map(asi => {
      const student = estudiantes.find(e => e.id === asi.estudiante_id);
      const gradoObj = grados.find(g => g.id === student?.grado_id);
      const grupoObj = grupos.find(g => g.id === student?.grupo_id);
      const asigObj = asignaturas.find(a => a.id === asi.asignatura_id);

      return {
        'Fecha': asi.fecha,
        'Hora Ingreso': asi.hora_ingreso,
        'Código Estudiantil': student?.codigo_estudiantil || '',
        'Documento': student?.numero_doc || '',
        'Estudiante': student ? `${student.nombres} ${student.apellidos}` : '',
        'Grado': gradoObj?.nombre_grado || '',
        'Grupo': grupoObj?.nombre_grupo || '',
        'Asignatura': asigObj?.nombre_asignatura || 'General',
        'Estado': asi.estado,
        'Observación': asi.observacion || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Asistencias');

    XLSX.writeFile(workbook, `Reporte_Asistencia_IET_Caldas_${startDate}_al_${endDate}.xlsx`);
  };

  // Export to PDF Report with Table & Signature Line
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 200);
    doc.text('INSTITUCIÓN EDUCATIVA TÉCNICA FRANCISCO JOSÉ DE CALDAS', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(80, 90, 100);
    doc.text('Natagaima - Tolima • Sistema de Control de Asistencia QR (Softworker)', 105, 21, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 30);
    doc.text(`REPORTE OFICIAL DE ASISTENCIA: ${startDate} al ${endDate}`, 105, 29, { align: 'center' });

    // Table Data Matrix
    const tableHead = [['Fecha', 'Hora', 'Código', 'Estudiante', 'Grado', 'Estado', 'Observaciones']];
    const tableBody = filteredData.map(asi => {
      const student = estudiantes.find(e => e.id === asi.estudiante_id);
      const gradoObj = grados.find(g => g.id === student?.grado_id);
      const grupoObj = grupos.find(g => g.id === student?.grupo_id);

      return [
        asi.fecha,
        asi.hora_ingreso,
        student?.codigo_estudiantil || '',
        student ? `${student.nombres} ${student.apellidos}` : '',
        `${gradoObj?.nombre_grado || ''} ${grupoObj?.nombre_grupo || ''}`,
        asi.estado,
        asi.observacion || '-'
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [0, 240, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    // Signature Area at bottom
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 25;
    
    if (finalY < 260) {
      doc.setDrawColor(150, 150, 150);
      doc.line(30, finalY, 90, finalY);
      doc.line(120, finalY, 180, finalY);

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Firma Docente / Coordinador', 60, finalY + 5, { align: 'center' });
      doc.text('Firma Rectoría / Secretaría', 150, finalY + 5, { align: 'center' });
    }

    doc.save(`Reporte_Asistencia_IET_Caldas_${startDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00FF66]" />
            Módulo de Reportes & Exportación de Asistencias
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Generación de planillas oficiales en Excel y PDF para la I.E.T. Francisco José de Caldas Natagaima
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="neon-btn-green px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel (.XLSX)
          </button>

          <button
            onClick={handleExportPDF}
            className="neon-btn-cyan px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar Reporte PDF
          </button>
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Fecha Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Fecha Fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Grado:</label>
            <select
              value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
            >
              <option value="TODOS">Todos los Grados</option>
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre_grado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Estado Asistencia:</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="PRESENTE">PRESENTE</option>
              <option value="TARDE">TARDE</option>
              <option value="EXCUSADO">EXCUSADO</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Buscar Alumno:</label>
            <input
              type="text"
              placeholder="Nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
            />
          </div>

        </div>

        {/* Quick Summary Chips */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
          <span className="px-3 py-1 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl">
            Total Registros: <strong className="text-white">{totalRegistros}</strong>
          </span>
          <span className="px-3 py-1 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-xl">
            Presentes: <strong>{countPresente}</strong>
          </span>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
            Tardes: <strong>{countTarde}</strong>
          </span>
          <span className="px-3 py-1 bg-[#7000FF]/10 text-[#c084fc] border border-[#7000FF]/30 rounded-xl">
            Excusados: <strong>{countExcusado}</strong>
          </span>
        </div>
      </div>

      {/* Report Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Hora</th>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Grado / Grupo</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No se encontraron registros de asistencia para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredData.map(asi => {
                  const student = estudiantes.find(e => e.id === asi.estudiante_id);
                  const gradoObj = grados.find(g => g.id === student?.grado_id);
                  const grupoObj = grupos.find(g => g.id === student?.grupo_id);

                  return (
                    <tr key={asi.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-300">{asi.fecha}</td>
                      <td className="py-3 px-4 text-slate-100">{asi.hora_ingreso}</td>
                      <td className="py-3 px-4 text-[#00F0FF] font-bold">{student?.codigo_estudiantil}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-100">
                        {student ? `${student.nombres} ${student.apellidos}` : 'Estudiante'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {gradoObj?.nombre_grado} ({grupoObj?.nombre_grupo})
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asi.estado === 'PRESENTE'
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                            : asi.estado === 'TARDE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-[#7000FF]/10 text-[#c084fc] border border-[#7000FF]/30'
                        }`}>
                          {asi.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">
                        {asi.observacion || '-'}
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
