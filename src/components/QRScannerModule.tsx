import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  Camera, 
  CameraOff,
  ArrowRight,
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Clock, 
  Search,
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  X,
  Upload,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  FileText,
  Image
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Estudiante, Asistencia, Grado, Grupo, Asignatura, Docente, EstadoAsistencia } from '../types';

interface QRScannerModuleProps {
  estudiantes: Estudiante[];
  grados: Grado[];
  grupos: Grupo[];
  asignaturas: Asignatura[];
  docentes: Docente[];
  onRegisterAttendance: (data: Omit<Asistencia, 'id'>) => Promise<void>;
  currentDocenteId: string;
}

export const QRScannerModule: React.FC<QRScannerModuleProps> = ({
  estudiantes,
  grados,
  grupos,
  asignaturas,
  docentes,
  onRegisterAttendance,
  currentDocenteId,
}) => {
  const [selectedGrado, setSelectedGrado] = useState<string>(grados[0]?.id || '');
  const [selectedGrupo, setSelectedGrupo] = useState<string>(grupos[0]?.id || '');
  const [selectedAsignatura, setSelectedAsignatura] = useState<string>(asignaturas[0]?.id || '');
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  
  // Last scanned student result modal state
  const [lastScanResult, setLastScanResult] = useState<{
    estudiante: Estudiante;
    asistencia: Omit<Asistencia, 'id'>;
    timestamp: string;
  } | null>(null);

  // Manual input state
  const [manualSearch, setManualSearch] = useState<string>('');
  const [selectedManualStudent, setSelectedManualStudent] = useState<Estudiante | null>(null);
  const [manualObservation, setManualObservation] = useState<string>('Registro manual de asistencia en aula');
  const [manualState, setManualState] = useState<EstadoAsistencia>('PRESENTE');

  // File upload scanner state
  const [isFileScanning, setIsFileScanning] = useState<boolean>(false);
  const [fileScanError, setFileScanError] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);

  // Auto-start rear camera upon mounting
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        startCamera();
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Sound generator using Web Audio API for futuristic beep
  const playBeep = (freq = 880, type: OscillatorType = 'sine', duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  };

  // Stop camera helper with safe state guard
  const stopCamera = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      const instance = scannerRef.current;
      if (instance) {
        try {
          if (instance.isScanning) {
            await instance.stop();
          }
        } catch {
          // Ignore intermediate transition errors on stop
        }
        
        try {
          // Clear only if DOM element still exists
          const container = document.getElementById("reader");
          if (container) {
            await instance.clear();
          }
        } catch {
          // Ignore clear errors
        }
        scannerRef.current = null;
      }
    } finally {
      setIsScanning(false);
      isStoppingRef.current = false;
    }
  };

  // Start Camera QR Reader directly using Html5Qrcode with container ID 'reader' and rear camera
  const startCamera = async () => {
    if (isStartingRef.current || isStoppingRef.current) return;
    isStartingRef.current = true;

    setScannerError('');
    setPermissionDenied(false);

    try {
      // Stop previous instance if active
      if (scannerRef.current) {
        await stopCamera();
      }

      // Check if container element exists in DOM
      const readerElem = document.getElementById("reader");
      if (!readerElem) {
        isStartingRef.current = false;
        return;
      }

      // Initialize exclusively with the container ID 'reader'
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const qrCodeSuccessCallback = async (decodedText: string) => {
        playBeep(1046, 'triangle', 0.2);
        await handleScannedCode(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      };

      // Transparently start rear camera ({ facingMode: "environment" })
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      } catch {
        // Fallback to user facing camera
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      }

      setIsScanning(true);

    } catch (err: unknown) {
      setIsScanning(false);

      const errorMsg = err instanceof Error ? err.message : String(err);
      const isPermissionErr = 
        errorMsg.includes("NotAllowedError") || 
        errorMsg.includes("Permission denied") ||
        errorMsg.includes("PermissionDeniedError") ||
        errorMsg.includes("NotAllowed");

      if (isPermissionErr) {
        setPermissionDenied(true);
        setScannerError("Permiso de cámara denegado. Puedes otorgar permiso en la barra del navegador, abrir la app en pestaña independiente o escanear una imagen QR.");
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("DevicesNotFoundError")) {
        setScannerError("No se encontró ninguna cámara conectada en este dispositivo.");
      } else {
        setScannerError(`No se pudo iniciar la cámara: ${errorMsg}`);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  // File Upload QR Code Scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanError('');
    setIsFileScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      playBeep(1046, 'triangle', 0.2);
      await handleScannedCode(decodedText);
      setIsFileScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("QR File Scan Error:", err);
      setFileScanError("No se pudo detectar un código QR claro en la imagen subida. Intenta con una imagen con mayor contraste.");
      setIsFileScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process scanned QR code content (student code, document, id, json or url)
  const handleScannedCode = async (code: string) => {
    let studentCode = code.trim();
    let studentDoc = '';
    let studentId = '';
    
    // 1. Try parsing if JSON payload
    try {
      const parsed = JSON.parse(code);
      if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.codigo_estudiantil) studentCode = String(parsed.codigo_estudiantil).trim();
        else if (parsed.cod) studentCode = String(parsed.cod).trim();
        else if (parsed.codigo) studentCode = String(parsed.codigo).trim();

        if (parsed.numero_doc) studentDoc = String(parsed.numero_doc).trim();
        else if (parsed.doc) studentDoc = String(parsed.doc).trim();

        if (parsed.id) studentId = String(parsed.id).trim();
      }
    } catch {
      // Plain text, URL or separator-based string
      // Check if it is a URL with query param or path like ?cod=... or /estudiantes/...
      if (code.includes('?')) {
        try {
          const urlObj = new URL(code.startsWith('http') ? code : `https://dummy.co/${code}`);
          const codParam = urlObj.searchParams.get('cod') || urlObj.searchParams.get('codigo') || urlObj.searchParams.get('codigo_estudiantil');
          const docParam = urlObj.searchParams.get('doc') || urlObj.searchParams.get('numero_doc');
          const idParam = urlObj.searchParams.get('id');
          if (codParam) studentCode = codParam.trim();
          if (docParam) studentDoc = docParam.trim();
          if (idParam) studentId = idParam.trim();
        } catch {
          // ignore url parse failure
        }
      }
    }

    // Clean comparisons
    const cleanRaw = studentCode.toLowerCase();
    const cleanDoc = studentDoc.toLowerCase();
    const cleanId = studentId.toLowerCase();

    // 2. Comprehensive multi-key student lookup
    const student = estudiantes.find(e => {
      const eCod = e.codigo_estudiantil.toLowerCase();
      const eDoc = e.numero_doc.toLowerCase();
      const eId = e.id.toLowerCase();
      const eFullName = `${e.nombres} ${e.apellidos}`.toLowerCase();

      return (
        (cleanRaw && (eCod === cleanRaw || eDoc === cleanRaw || eId === cleanRaw || eFullName === cleanRaw)) ||
        (cleanDoc && eDoc === cleanDoc) ||
        (cleanId && eId === cleanId) ||
        // Check if raw text contains exact student code or document
        (cleanRaw.length >= 6 && (cleanRaw.includes(eCod) || cleanRaw.includes(eDoc)))
      );
    });

    if (!student) {
      playBeep(220, 'sawtooth', 0.3);
      alert(`⚠️ Código QR no reconocido en el sistema: ${studentCode || code}`);
      return;
    }

    // Determine status based on time (e.g. after 07:15 AM is TARDE)
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 7 || (hours === 7 && minutes > 15);
    const estado: EstadoAsistencia = isLate ? 'TARDE' : 'PRESENTE';

    const nowFormattedTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = now.toISOString().split('T')[0];

    const targetAsignatura = selectedAsignatura || asignaturas[0]?.id || 'ASI-01';
    const asigObj = asignaturas.find(a => a.id === targetAsignatura);
    const docObj = docentes.find(d => d.id === currentDocenteId) || docentes[0];

    const asistenciaData: Omit<Asistencia, 'id'> = {
      estudiante_id: student.id,
      docente_id: currentDocenteId || docObj?.id || 'DOC-01',
      docente_nombre: docObj ? `${docObj.nombres} ${docObj.apellidos}` : 'Docente Titular',
      estudiante_nombre: `${student.nombres} ${student.apellidos}`,
      estudiante_documento: student.numero_doc,
      grado_id: student.grado_id,
      grado_nombre: grados.find(g => g.id === student.grado_id)?.nombre_grado || '11°',
      grupo_id: student.grupo_id,
      fecha: todayStr,
      hora_ingreso: nowFormattedTime,
      hora_salida: '',
      estado,
      observacion: isLate ? 'Escaneo QR Aula - Retardo automático registrado' : 'Escaneo QR Aula - Asistencia puntual',
      asignatura_id: targetAsignatura,
      asignatura_nombre: asigObj?.nombre_asignatura || 'Asignatura'
    };

    await onRegisterAttendance(asistenciaData);

    setLastScanResult({
      estudiante: student,
      asistencia: asistenciaData,
      timestamp: nowFormattedTime
    });
  };

  // Simulated Quick Scan for testing preview without physical QR card
  const handleSimulateScan = (student: Estudiante) => {
    playBeep(1200, 'sine', 0.18);
    handleScannedCode(student.codigo_estudiantil);
  };

  // Handle manual registration submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManualStudent) return;

    const now = new Date();
    const nowFormattedTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = now.toISOString().split('T')[0];

    const asistenciaData: Omit<Asistencia, 'id'> = {
      estudiante_id: selectedManualStudent.id,
      docente_id: currentDocenteId || docentes[0]?.id || 'DOC-01',
      fecha: todayStr,
      hora_ingreso: nowFormattedTime,
      hora_salida: '',
      estado: manualState,
      observacion: manualObservation || 'Registro manual',
      asignatura_id: selectedAsignatura
    };

    playBeep(880, 'triangle', 0.2);
    await onRegisterAttendance(asistenciaData);

    setLastScanResult({
      estudiante: selectedManualStudent,
      asistencia: asistenciaData,
      timestamp: nowFormattedTime
    });

    setSelectedManualStudent(null);
    setManualSearch('');
  };

  return (
    <div className="space-y-6">
      
      {/* Session Config Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-orbitron text-base font-bold text-[#00F0FF] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00FF66] animate-pulse" />
              Control de Asistencia en Aulas de Clase (Escáner QR)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              I.E.T. Francisco José de Caldas — Registro en tiempo real por asignatura y grado en aula
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              Escáner de Aula Activo
            </span>
          </div>
        </div>

        {/* Selectors for Session Context */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Grado Objetivo:</label>
            <select
              value={selectedGrado}
              onChange={(e) => setSelectedGrado(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-[#00F0FF] focus:outline-none"
            >
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre_grado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Grupo:</label>
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-[#00F0FF] focus:outline-none"
            >
              {grupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre_grupo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Asignatura:</label>
            <select
              value={selectedAsignatura}
              onChange={(e) => setSelectedAsignatura(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:border-[#00F0FF] focus:outline-none"
            >
              {asignaturas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre_asignatura}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Camera View + Quick Simulator / Manual Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Scanner Container with Cyber Laser */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-bold text-slate-200 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-[#00F0FF]" />
              Visor de Cámara
            </h3>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-[#00FF66]" /> Sonido Bip Activo
            </span>
          </div>

          {/* Scanner Box viewport with Laser Line overlay */}
          <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-950 rounded-2xl border-2 border-[#00F0FF]/40 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            
            {/* HTML5 QR Code Container initialized strictly with ID 'reader' */}
            <div id="reader" className="w-full h-full"></div>

            {/* Cyberpunk Laser Line Effect */}
            {isScanning && (
              <div className="laser-line"></div>
            )}

            {/* Corner HUD Markers */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00F0FF] pointer-events-none"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00F0FF] pointer-events-none"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00F0FF] pointer-events-none"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00F0FF] pointer-events-none"></div>

            {/* Botón de Control de Cámara Sobre el Visor ("Encender / Apagar Cámara") */}
            <button
              type="button"
              onClick={isScanning ? stopCamera : startCamera}
              className={`btn-toggle-camera-overlay ${isScanning ? 'btn-camera-on' : 'btn-camera-off'}`}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-4 h-4" />
                  <span>Apagar Cámara</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Encender Cámara</span>
                </>
              )}
            </button>
          </div>

          {scannerError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-200">Error de Acceso a la Cámara</h4>
                  <p className="text-slate-300 mt-1">{scannerError}</p>
                </div>
              </div>

              {permissionDenied && (
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-slate-300">
                  <p className="font-bold text-[#00F0FF] text-[11px] uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#00F0FF]" />
                    Opciones para Continuar Escaneando:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>Haz clic en el icono de candado o cámara en la barra de dirección del navegador para **Permitir** la cámara.</li>
                    <li>O abre la app en una **pestaña independiente** fuera del iFrame del editor.</li>
                    <li>O utiliza la función **"Escanear Imagen QR"** para subir una foto del carné.</li>
                    <li>O utiliza el **Simulador Rápido de 1-Clic** o el **Registro Manual**.</li>
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#00FF66]/30"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reintentar Permiso
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#7000FF]/20 border border-[#7000FF] text-[#c084fc] rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#7000FF]/30"
                    >
                      <Upload className="w-3.5 h-3.5" /> Subir Imagen QR
                    </button>

                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1.5 bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-[#00F0FF]/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir en Nueva Pestaña
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {fileScanError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{fileScanError}</span>
            </div>
          )}

          {/* Simulated Fast Scan Grid for quick test */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              Simulador Rápido de Escaneo (Prueba con 1 Clic):
            </span>
            <div className="flex flex-wrap gap-2">
              {estudiantes.slice(0, 4).map(st => (
                <button
                  key={st.id}
                  onClick={() => handleSimulateScan(st)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-[#00F0FF]/15 border border-slate-700 hover:border-[#00F0FF] rounded-lg text-xs font-mono text-slate-200 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-[#00F0FF]" />
                  <span>{st.nombres.split(' ')[0]} ({st.codigo_estudiantil})</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Manual Attendance Registration */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-orbitron text-sm font-bold text-slate-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#7000FF]" />
              Registro Manual (Sin Carné)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Para alumnos que hayan olvidado el carnet físico
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            
            {/* Student Search Select */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Buscar Estudiante:</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Nombre o código estudiantil..."
                  value={manualSearch}
                  onChange={(e) => {
                    setManualSearch(e.target.value);
                    setSelectedManualStudent(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-slate-100 focus:border-[#7000FF] focus:outline-none"
                />
              </div>

              {/* Search Suggestions List */}
              {manualSearch.trim() !== '' && !selectedManualStudent && (
                <div className="mt-1 bg-slate-900 border border-slate-700 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-800 z-20">
                  {estudiantes
                    .filter(e => 
                      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(manualSearch.toLowerCase()) ||
                      e.codigo_estudiantil.toLowerCase().includes(manualSearch.toLowerCase())
                    )
                    .map(est => (
                      <button
                        type="button"
                        key={est.id}
                        onClick={() => {
                          setSelectedManualStudent(est);
                          setManualSearch(`${est.nombres} ${est.apellidos}`);
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-800 text-xs font-mono flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-200">{est.nombres} {est.apellidos}</span>
                        <span className="text-[#00F0FF] text-[10px]">{est.codigo_estudiantil}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {selectedManualStudent && (
              <div className="p-3 bg-slate-900/80 border border-[#00F0FF]/40 rounded-xl flex items-center gap-3">
                <img 
                  src={selectedManualStudent.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"} 
                  alt="Student" 
                  className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                />
                <div className="text-xs font-mono">
                  <p className="font-bold text-slate-100">{selectedManualStudent.nombres} {selectedManualStudent.apellidos}</p>
                  <p className="text-[10px] text-[#00F0FF]">CÓD: {selectedManualStudent.codigo_estudiantil}</p>
                </div>
              </div>
            )}

            {/* Attendance Status Radio Options */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">Estado de Asistencia:</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setManualState('PRESENTE')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                    manualState === 'PRESENTE' 
                      ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  PRESENTE
                </button>
                <button
                  type="button"
                  onClick={() => setManualState('TARDE')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                    manualState === 'TARDE' 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  TARDE
                </button>
                <button
                  type="button"
                  onClick={() => setManualState('EXCUSADO')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                    manualState === 'EXCUSADO' 
                      ? 'bg-[#7000FF]/20 border-[#7000FF] text-[#c084fc]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  EXCUSADO
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Observación:</label>
              <input
                type="text"
                value={manualObservation}
                onChange={(e) => setManualObservation(e.target.value)}
                placeholder="Observación técnica..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedManualStudent}
              className="w-full neon-btn-purple py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Registrar Asistencia Manual
            </button>
          </form>
        </div>

      </div>

      {/* Floating HUD Modal / Carnet Estudiantil on Scan Confirmation */}
      {lastScanResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="carnet-card-container border-2 border-[#00F0FF]/50 relative shadow-[0_0_50px_rgba(0,240,255,0.25)]">
            
            <button
              onClick={() => setLastScanResult(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-900/90 rounded-full border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado Institucional con Escudo */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-[#00F0FF]/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <img 
                    src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80" 
                    alt="Escudo Institución" 
                    class="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="text-xs font-orbitron font-bold text-[#00F0FF] tracking-wider leading-tight">
                    I.E.T. FRANCISCO JOSÉ DE CALDAS
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400">Natagaima • Tolima | Carnet Digital</p>
                </div>
              </div>

              {/* Insignia / Badge de Estado */}
              <div className={`badge-estado ${lastScanResult.asistencia.estado === 'TARDE' ? 'badge-retardo' : 'badge-a-tiempo'}`}>
                <span className={`w-2 h-2 rounded-full ${
                  lastScanResult.asistencia.estado === 'TARDE' ? 'bg-amber-400 animate-ping' : 'bg-[#00FF66] animate-pulse'
                }`}></span>
                <span>{lastScanResult.asistencia.estado === 'TARDE' ? 'LLEGÓ TARDE' : 'A TIEMPO'}</span>
              </div>
            </div>

            {/* Foto y Datos del Estudiante */}
            <div className="flex gap-4 items-center mb-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-[#00F0FF]/60 flex-shrink-0 shadow-md">
                <img 
                  src={lastScanResult.estudiante.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} 
                  alt="Foto Estudiante" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-mono font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  {lastScanResult.estudiante.codigo_estudiantil}
                </span>
                <h3 className="text-sm font-bold text-slate-100 truncate mt-1">
                  {lastScanResult.estudiante.nombres} {lastScanResult.estudiante.apellidos}
                </h3>
                <p className="text-xs font-mono text-[#00F0FF]">
                  {grados.find(g => g.id === lastScanResult.estudiante.grado_id)?.nombre_grado || '11°'} • Grupo {grupos.find(gp => gp.id === lastScanResult.estudiante.grupo_id)?.nombre_grupo || '11-1'}
                </p>
                <p className="text-[11px] text-slate-400 font-sans">
                  EPS: Asmet Salud | RH: {lastScanResult.estudiante.rh || 'O+'}
                </p>
              </div>
            </div>

            {/* Hora Exacta de Marcación y Estado */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 text-center">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Hora de Marcación</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {lastScanResult.timestamp}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Control de Ingreso</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  REGISTRADO
                </span>
              </div>
            </div>

            {/* Botón para Escanear Siguiente */}
            <button
              onClick={() => setLastScanResult(null)}
              className="btn-next-scan w-full"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Escanear Siguiente</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

