import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Phone, 
  HeartPulse,
  User,
  CreditCard,
  Layers,
  FileText
} from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { SchoolCrest, getSchoolCrestDataUri, getSchoolCrestPngDataUrl } from './SchoolCrest';
import type { Estudiante, Grado, Grupo, Sede, EPS, ARL, Acudiente } from '../types';

interface QRCardGeneratorProps {
  estudiantes: Estudiante[];
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  epsList: EPS[];
  arlList: ARL[];
  acudientes: Acudiente[];
}

export const QRCardGenerator: React.FC<QRCardGeneratorProps> = ({
  estudiantes,
  grados,
  grupos,
  sedes,
  epsList,
  arlList,
  acudientes,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(estudiantes[0]?.id || '');
  const [filterGrado, setFilterGrado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardSide, setCardSide] = useState<'FRONT' | 'BACK'>('FRONT');

  // Filter students
  const filteredStudents = estudiantes.filter(e => {
    if (filterGrado !== 'TODOS' && e.grado_id !== filterGrado) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const nameMatch = `${e.nombres} ${e.apellidos}`.toLowerCase().includes(q);
      const codeMatch = e.codigo_estudiantil.toLowerCase().includes(q);
      const docMatch = e.numero_doc.includes(q);
      if (!nameMatch && !codeMatch && !docMatch) return false;
    }
    return true;
  });

  const selectedStudent = estudiantes.find(e => e.id === selectedStudentId) || filteredStudents[0] || estudiantes[0];

  const gradoObj = grados.find(g => g.id === selectedStudent?.grado_id);
  const grupoObj = grupos.find(g => g.id === selectedStudent?.grupo_id);
  const sedeObj = sedes.find(s => s.id === selectedStudent?.sede_id);
  const epsObj = epsList.find(e => e.id === selectedStudent?.eps_id);
  const acudienteObj = acudientes.find(a => a.id === selectedStudent?.acudiente_id);

  // Generate High-Contrast QR Code Data URL (Pure Black on Pure White) whenever selected student changes
  useEffect(() => {
    if (!selectedStudent) return;
    const qrPayload = JSON.stringify({
      institucion: 'I.E.T. Francisco Jose de Caldas - Natagaima',
      codigo_estudiantil: selectedStudent.codigo_estudiantil,
      numero_doc: selectedStudent.numero_doc,
      nombres: `${selectedStudent.nombres} ${selectedStudent.apellidos}`,
      id: selectedStudent.id
    });

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',  // High contrast pure black modules
        light: '#FFFFFF' // High contrast pure white background
      }
    })
    .then(url => setQrDataUrl(url))
    .catch(err => console.error("Error generating QR:", err));
  }, [selectedStudent]);

  // Download High-Contrast QR Code PNG
  const handleDownloadQRPng = () => {
    if (!qrDataUrl || !selectedStudent) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${selectedStudent.codigo_estudiantil}.png`;
    link.click();
  };

  // Export Individual PDF Card with School Crest, Student Data, RH, and QR
  const handleExportIndividualPDF = async () => {
    if (!selectedStudent) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85.6, 53.9] // Standard CR80 ID Card dimensions in mm
    });

    // Dark Background for CR80 card
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, 85.6, 53.9, 'F');

    // Cyber Border
    doc.setDrawColor(0, 240, 255);
    doc.setLineWidth(0.5);
    doc.rect(1.5, 1.5, 82.6, 50.9);

    // Official Triangular School Crest Emblem
    const crestUri = await getSchoolCrestPngDataUrl();
    if (crestUri) {
      try {
        doc.addImage(crestUri, 'PNG', 3, 3, 9, 9);
      } catch (err) {
        console.warn("Could not add crest image to PDF:", err);
      }
    }

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(0, 240, 255);
    doc.text('I.E.T. FRANCISCO JOSÉ DE CALDAS', 46, 5.5, { align: 'center' });
    
    doc.setFontSize(4);
    doc.setTextColor(0, 255, 102);
    doc.text('NATAGAIMA - TOLIMA • CARNÉ ESTUDIANTIL OFICIAL', 46, 8, { align: 'center' });

    // Header divider
    doc.setDrawColor(112, 0, 255);
    doc.line(3, 11, 82.6, 11);

    // Student Info Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`${selectedStudent.nombres.toUpperCase()} ${selectedStudent.apellidos.toUpperCase()}`, 3, 16);

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 240, 255);
    doc.text(`CÓDIGO: ${selectedStudent.codigo_estudiantil}`, 3, 20.5);

    doc.setTextColor(220, 225, 240);
    doc.text(`DOC: ${selectedStudent.numero_doc}`, 3, 24);
    doc.text(`GRADO: ${gradoObj?.nombre_grado || ''} (${grupoObj?.nombre_grupo || ''})`, 3, 27.5);
    doc.text(`SEDE: ${sedeObj?.nombre_sede || ''}`, 3, 31);
    
    // RH & EPS
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 255, 102);
    doc.text(`RH: ${selectedStudent.rh || 'O+'}`, 3, 35);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 225);
    doc.text(`EPS: ${epsObj?.nombre_eps || 'Asmet Salud'}`, 3, 38.5);
    
    doc.text(`ACUDIENTE: ${acudienteObj ? `${acudienteObj.nombres} (${acudienteObj.telefono})` : 'N/A'}`, 3, 42);

    // High Contrast QR Image on right side (white background, black modules)
    if (qrDataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.rect(53.5, 13.5, 27, 27, 'F'); // White container behind QR
      try {
        doc.addImage(qrDataUrl, 'PNG', 54, 14, 26, 26);
      } catch (err) {
        console.warn("Could not add QR image to PDF:", err);
      }
    }

    // Footer Software Brand
    doc.setFontSize(4);
    doc.setTextColor(0, 240, 255);
    doc.text('SOFTWORKER CYBER-SAAS 2026 • I.E.T. FRANCISCO JOSÉ DE CALDAS', 42.8, 51, { align: 'center' });

    doc.save(`CARNE_${selectedStudent.codigo_estudiantil}.pdf`);
  };

  // Export Batch Sheet PDF with 4 ID Cards per A4 page
  const handleExportBatchPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const crestUri = await getSchoolCrestPngDataUrl();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 240, 255);
    doc.text('I.E.T. FRANCISCO JOSÉ DE CALDAS - NATAGAIMA', 105, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(140, 150, 170);
    doc.text('IMPRESIÓN MASIVA DE CARNÉS ESTUDIANTILES (CON CÓDIGO QR Y RH)', 105, 20, { align: 'center' });

    let xPos = 15;
    let yPos = 28;
    let cardCount = 0;

    filteredStudents.forEach((st, idx) => {
      const gObj = grados.find(g => g.id === st.grado_id);
      const grObj = grupos.find(g => g.id === st.grupo_id);
      const epObj = epsList.find(e => e.id === st.eps_id);

      // Card Background
      doc.setFillColor(11, 15, 25);
      doc.rect(xPos, yPos, 85.6, 53.9, 'F');
      doc.setDrawColor(0, 240, 255);
      doc.setLineWidth(0.4);
      doc.rect(xPos + 1, yPos + 1, 83.6, 51.9);

      // Add Crest
      if (crestUri) {
        try {
          doc.addImage(crestUri, 'PNG', xPos + 2, yPos + 2, 8, 8);
        } catch (err) {
          console.warn("Could not add crest image:", err);
        }
      }

      // Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(0, 240, 255);
      doc.text('I.E.T. FRANCISCO JOSÉ DE CALDAS', xPos + 44, yPos + 4.5, { align: 'center' });
      doc.setFontSize(4);
      doc.setTextColor(0, 255, 102);
      doc.text('NATAGAIMA TOLIMA', xPos + 44, yPos + 7.5, { align: 'center' });

      // Student info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text(`${st.nombres} ${st.apellidos}`, xPos + 3, yPos + 13);
      
      doc.setFontSize(5);
      doc.setTextColor(0, 240, 255);
      doc.text(`CÓD: ${st.codigo_estudiantil}`, xPos + 3, yPos + 17.5);
      
      doc.setTextColor(200, 210, 225);
      doc.text(`DOC: ${st.numero_doc}`, xPos + 3, yPos + 21);
      const grupoText = grObj?.nombre_grupo ? ` - ${grObj.nombre_grupo}` : '';
      doc.text(`GRADO: ${gObj?.nombre_grado || ''}${grupoText}`, xPos + 3, yPos + 24.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 255, 102);
      doc.text(`RH: ${st.rh || 'O+'}`, xPos + 3, yPos + 28);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 190, 210);
      doc.text(`EPS: ${epObj?.nombre_eps || 'Asmet Salud'}`, xPos + 3, yPos + 31.5);

      // Add QR Code placeholder in pure white background box
      if (qrDataUrl) {
        doc.setFillColor(255, 255, 255);
        doc.rect(xPos + 54.5, yPos + 11.5, 26, 26, 'F');
        try {
          doc.addImage(qrDataUrl, 'PNG', xPos + 55, yPos + 12, 25, 25);
        } catch (err) {
          console.warn("Could not add QR image:", err);
        }
      }

      cardCount++;
      if (cardCount % 2 === 1) {
        xPos = 110;
      } else {
        xPos = 15;
        yPos += 60;
      }

      if (yPos > 240 && idx < filteredStudents.length - 1) {
        doc.addPage();
        xPos = 15;
        yPos = 28;
      }
    });

    doc.save(`CARNES_MASIVOS_NATAGAIMA.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00FF66]" />
            Módulo de Carnetización QR Estudiantil (Alto Contraste)
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Carnés oficiales con Escudo Institucional, RH, EPS y Código QR en blanco/negro de alto contraste
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportBatchPDF}
            className="neon-btn-purple px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Hoja Masiva PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Student List Selector + Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Selector Table */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o doc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono">
              <Filter className="w-4 h-4 text-[#7000FF]" />
              <select
                value={filterGrado}
                onChange={(e) => setFilterGrado(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full"
              >
                <option value="TODOS" className="bg-slate-900">Todos los Grados</option>
                {grados.map(g => (
                  <option key={g.id} value={g.id} className="bg-slate-900">{g.nombre_grado}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
            {filteredStudents.map(st => {
              const isSelected = selectedStudent?.id === st.id;
              const stGrado = grados.find(g => g.id === st.grado_id);

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between font-mono text-xs ${
                    isSelected 
                      ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={st.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"} 
                      alt="Student" 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-slate-100">{st.nombres} {st.apellidos}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#00F0FF]">CÓD: {st.codigo_estudiantil}</span>
                        <span className="text-[10px] font-bold text-[#00FF66] bg-[#00FF66]/10 px-1.5 rounded">
                          RH: {st.rh || 'O+'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                    {stGrado?.nombre_grado.split('-')[0] || ''}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: High-Tech CR80 ID Card Display */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-orbitron text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00F0FF]" />
              Carné Estudiantil Oficial (CR80)
            </h3>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={() => setCardSide('FRONT')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  cardSide === 'FRONT' 
                    ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                FRENTE
              </button>
              <button
                onClick={() => setCardSide('BACK')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  cardSide === 'BACK' 
                    ? 'bg-[#7000FF]/20 border-[#7000FF] text-[#c084fc] font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                REVERSO
              </button>
            </div>
          </div>

          {/* Interactive Card Canvas Preview Container */}
          <div className="w-full flex justify-center py-4">
            
            {cardSide === 'FRONT' ? (
              /* FRONT CARD VIEW */
              <div className="w-full max-w-md aspect-[1.586/1] bg-[#0b0f19] border-2 border-[#00F0FF]/60 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,240,255,0.25)] relative overflow-hidden flex flex-col justify-between font-mono">
                
                {/* Holographic background overlay */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00F0FF]/15 via-[#7000FF]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header with Official School Crest */}
                <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="shrink-0 p-1 bg-white/10 border border-[#00F0FF]/40 rounded-lg">
                      <SchoolCrest size={32} showGlow={false} />
                    </div>
                    <div>
                      <h4 className="font-orbitron text-[10px] font-black tracking-wider text-slate-100 uppercase">
                        I.E.T. FRANCISCO JOSÉ DE CALDAS
                      </h4>
                      <p className="text-[9px] text-[#00FF66] tracking-widest uppercase font-bold">
                        NATAGAIMA TOLIMA • CARNÉ ESTUDIANTIL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body: Photo, Details & High Contrast QR */}
                <div className="grid grid-cols-12 gap-3 items-center py-2">
                  <div className="col-span-8 space-y-1.5">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Estudiante:</span>
                      <h3 className="font-sans font-extrabold text-sm text-slate-100 uppercase leading-tight">
                        {selectedStudent?.nombres} {selectedStudent?.apellidos}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Código:</span>
                        <span className="text-[#00F0FF] font-bold">{selectedStudent?.codigo_estudiantil}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Documento:</span>
                        <span className="text-slate-200 font-bold">{selectedStudent?.numero_doc}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Grado:</span>
                        <span className="text-slate-200 font-bold">{gradoObj?.nombre_grado}{grupoObj?.nombre_grupo ? ` - ${grupoObj.nombre_grupo}` : ''}</span>
                      </div>
                      <div>
                        <span className="text-[#00FF66] block font-bold">Sangre (RH):</span>
                        <span className="text-[#00FF66] font-bold text-xs">{selectedStudent?.rh || 'O+'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic High-Contrast Pure White QR Box */}
                  <div className="col-span-4 flex flex-col items-center justify-center space-y-1">
                    {qrDataUrl ? (
                      <div className="p-1 bg-white border border-[#00F0FF] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                        <img src={qrDataUrl} alt="QR Code Alto Contraste" className="w-24 h-24 object-contain" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white border border-slate-800 rounded-xl flex items-center justify-center text-slate-800 text-[9px] font-bold">
                        Generando QR...
                      </div>
                    )}
                    <span className="text-[8px] text-[#00F0FF] font-bold uppercase tracking-widest">
                      QR ALTO CONTRASTE
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400">
                  <span>SOFTWORKER CYBER-SAAS 2026</span>
                  <span className="text-[#00FF66] font-bold">VÁLIDO AÑO LECTIVO 2026</span>
                </div>

              </div>
            ) : (
              /* BACK CARD VIEW */
              <div className="w-full max-w-md aspect-[1.586/1] bg-[#0b0f19] border-2 border-[#7000FF]/60 rounded-2xl p-5 shadow-[0_0_40px_rgba(112,0,255,0.25)] relative overflow-hidden flex flex-col justify-between font-mono text-xs">
                
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-orbitron text-xs font-bold text-[#c084fc]">
                    INFORMACIÓN INSTITUCIONAL Y EMERGENCIA
                  </h4>
                  <p className="text-[9px] text-slate-400">I.E.T. Francisco José de Caldas - Natagaima, Tolima</p>
                </div>

                <div className="space-y-2 text-[10px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>EPS Afiliada: <strong className="text-white">{epsObj?.nombre_eps || 'Asmet Salud'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Acudiente: <strong className="text-white">{acudienteObj ? `${acudienteObj.nombres} ${acudienteObj.apellidos} (${acudienteObj.telefono})` : 'N/A'}</strong></span>
                  </div>
                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-[9px] text-slate-400">
                    <strong className="text-amber-400">Observación Médica / Salud:</strong> {selectedStudent?.observacion_medica || 'Sin novedad médica reportada'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[8px] text-slate-500 text-center">
                  Este carné es intransferible. En caso de pérdida informar inmediatamente a la Coordinación Académica.
                </div>

              </div>
            )}

          </div>

          {/* Action Buttons for Current Card */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleExportIndividualPDF}
              className="neon-btn-cyan px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Carné PDF (Individual)
            </button>

            <button
              onClick={handleDownloadQRPng}
              className="neon-btn-green px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Descargar Solo QR PNG (#FFFFFF)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
