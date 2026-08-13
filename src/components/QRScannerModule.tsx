import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  Camera, 
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
import { Html5Qrcode, CameraDevice } from 'html5-qrcode';
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
  
  // Available camera devices list
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
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

  // Fetch camera devices on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.warn("No camera devices enumerated or permission pending:", err);
      });
  }, []);

  // Stop camera helper
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.error("Camera stop error:", e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Start Camera QR Reader with fallbacks and permission detection
  const startCamera = async () => {
    setScannerError('');
    setPermissionDenied(false);
    
    // Stop previous instance if active
    await stopCamera();

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-container");
      scannerRef.current = html5QrCode;

      setIsScanning(true);

      const qrCodeSuccessCallback = async (decodedText: string) => {
        playBeep(1046, 'triangle', 0.2);
        await handleScannedCode(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 }
      };

      // 1st Attempt: Selected Camera ID or environment camera
      if (selectedCameraId) {
        await html5QrCode.start(
          selectedCameraId,
          config,
          qrCodeSuccessCallback,
          () => {}
        );
      } else {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            () => {}
          );
        } catch (envErr) {
          console.warn("FacingMode environment failed, trying user facing camera:", envErr);
          await html5QrCode.start(
            { facingMode: "user" },
            config,
            qrCodeSuccessCallback,
            () => {}
          );
        }
      }

      // Re-fetch cameras after permission granted
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          if (!selectedCameraId) setSelectedCameraId(devices[0].id);
        }
      } catch {
        // ignore
      }

    } catch (err: unknown) {
      console.error("Camera start error:", err);
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
    }
  };

  useEffect(() => {
    return () => {
      stopCamera().catch(() => {});
    };
  }, []);

  // File Upload QR Code Scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanError('');
    setIsFileScanning(true);

    try {
      const html5QrCode = new Html5Qrcode("qr-file-temp-container");
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

  // Process scanned QR code content (student code or json)
  const handleScannedCode = async (code: string) => {
    let studentCode = code.trim();
    
    // Try parsing if JSON
    try {
      const parsed = JSON.parse(code);
      if (parsed.codigo) studentCode = parsed.codigo;
      if (parsed.codigo_estudiantil) studentCode = parsed.codigo_estudiantil;
    } catch {
      // Plain text
    }

    const student = estudiantes.find(e => 
      e.codigo_estudiantil.toLowerCase() === studentCode.toLowerCase() ||
      e.numero_doc === studentCode
    );

    if (!student) {
      playBeep(220, 'sawtooth', 0.3);
      alert(`⚠️ Código QR no reconocido en el sistema: ${studentCode}`);
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

    const asistenciaData: Omit<Asistencia, 'id'> = {
      estudiante_id: student.id,
      docente_id: currentDocenteId || docentes[0]?.id || 'DOC-01',
      fecha: todayStr,
      hora_ingreso: nowFormattedTime,
      hora_salida: '',
      estado,
      observacion: isLate ? 'Escaneo QR - Retardo automático registrado' : 'Escaneo QR - Asistencia puntual',
      asignatura_id: selectedAsignatura
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
              Sesión de Escáner QR de Asistencia
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Institución Educativa Técnica Francisco José de Caldas - Natagaima
            </p>
          </div>

          <div className="flex flex-wrap items-center space-x-2 gap-y-2">
            {cameras.length > 1 && !isScanning && (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    📷 {cam.label || `Cámara (${cam.id.slice(0, 6)}...)`}
                  </option>
                ))}
              </select>
            )}

            {!isScanning ? (
              <button
                onClick={startCamera}
                className="neon-btn-green px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                Iniciar Cámara QR
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Detener Escáner
              </button>
            )}

            {/* Hidden File Input for QR Image Scan */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isFileScanning}
              className="neon-btn-purple px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isFileScanning ? 'Procesando...' : 'Escanear Imagen QR'}
            </button>
          </div>
        </div>

        {/* Hidden temp element for file QR scanner */}
        <div id="qr-file-temp-container" className="hidden"></div>

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
              Visor de Cámara con Láser Neón
            </h3>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-[#00FF66]" /> Sonido Bip Activo
            </span>
          </div>

          {/* Scanner Box viewport with Laser Line overlay */}
          <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-950 rounded-2xl border-2 border-[#00F0FF]/40 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            
            {/* HTML5 QR Code Container */}
            <div id="qr-reader-container" className="w-full h-full"></div>

            {/* Cyberpunk Laser Line Effect */}
            {isScanning && (
              <div className="laser-line"></div>
            )}

            {/* Corner HUD Markers */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00F0FF]"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00F0FF]"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00F0FF]"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00F0FF]"></div>

            {!isScanning && (
              <div className="text-center p-6 space-y-3 z-10">
                <Camera className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs font-mono text-slate-400 max-w-xs">
                  Haz clic en <span className="text-[#00FF66] font-bold">"Iniciar Cámara QR"</span> para escanear el carné estudiantil.
                </p>
              </div>
            )}
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

      {/* Floating HUD Modal Alert on Scan Confirmation */}
      {lastScanResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border-2 border-[#00FF66] max-w-md w-full space-y-5 shadow-[0_0_50px_rgba(0,255,102,0.3)] relative">
            
            <button
              onClick={() => setLastScanResult(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#00FF66]/20 border border-[#00FF66] rounded-full flex items-center justify-center mx-auto text-[#00FF66] shadow-[0_0_20px_#00FF66]">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="font-orbitron text-lg font-black text-white tracking-wider uppercase">
                ¡ASISTENCIA REGISTRADA!
              </h3>
              <p className="text-xs font-mono text-[#00FF66] font-bold">
                I.E.T. Francisco José de Caldas - Natagaima
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-4">
              <img 
                src={lastScanResult.estudiante.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"} 
                alt="Student" 
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#00F0FF]"
              />
              <div className="space-y-1 font-mono text-xs">
                <h4 className="font-bold text-slate-100 text-sm">{lastScanResult.estudiante.nombres} {lastScanResult.estudiante.apellidos}</h4>
                <p className="text-[#00F0FF]">CÓDIGO: {lastScanResult.estudiante.codigo_estudiantil}</p>
                <p className="text-slate-400 text-[10px]">DOC: {lastScanResult.estudiante.numero_doc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Hora de Entrada:</span>
                <span className="text-slate-100 font-bold text-sm">{lastScanResult.timestamp}</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block">Estado:</span>
                <span className={`font-bold text-sm ${
                  lastScanResult.asistencia.estado === 'PRESENTE' ? 'text-[#00FF66]' : 'text-amber-400'
                }`}>
                  {lastScanResult.asistencia.estado}
                </span>
              </div>
            </div>

            <button
              onClick={() => setLastScanResult(null)}
              className="w-full neon-btn-cyan py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider"
            >
              Aceptar / Continuar Escaneando
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
