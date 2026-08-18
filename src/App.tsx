import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { QRScannerModule } from './components/QRScannerModule';
import { QRCardGenerator } from './components/QRCardGenerator';
import { ReportsModule } from './components/ReportsModule';
import { ParentsModule } from './components/ParentsModule';
import { AdminCrudModule } from './components/AdminCrudModule';
import { RegisterStudentModal } from './components/RegisterStudentModal';
import { LoginModal } from './components/LoginModal';
import { StudentPortal } from './components/StudentPortal';
import { GatePassModule } from './components/GatePassModule';
import { EarlyAlertsModule } from './components/EarlyAlertsModule';
import { SchoolObserverModule } from './components/SchoolObserverModule';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { 
  subscribeToInAppNotifications, 
  getHistorialNotificaciones, 
  despacharAlertaAsistencia 
} from './services/notificationService';

import { 
  getLocalStore, 
  saveLocalStore, 
  resetLocalSeedStore 
} from './firebase/config';

import type { 
  UserRole, Estudiante, Docente, Asistencia, Excusa, PaseSalida, AnotacionObservador,
  Grado, Grupo, Sede, Asignatura, EPS, ARL, TipoDocumento, Acudiente, Usuario 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ESTUDIANTE');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Master State loaded from Store
  const [dbData, setDbData] = useState(() => getLocalStore());

  // Subscribe to real-time notifications to update badge
  useEffect(() => {
    const history = getHistorialNotificaciones();
    setUnreadCount(history.length);

    const unsubscribe = subscribeToInAppNotifications((_notif) => {
      setUnreadCount(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Current active user state
  const [currentUser, setCurrentUser] = useState<Usuario>(() => dbData.usuarios[0] || {
    id: 'USR-01',
    uid_firebase: 'admin-softworker',
    email: 'admin@ietcaldas.edu.co',
    rol: 'ADMIN',
    referencia_id: 'ADM-01',
    nombre_display: 'Lic. Héctor Fabio - Rector'
  });

  // Keep tab in sync with current role access
  useEffect(() => {
    if (currentRole === 'ESTUDIANTE') {
      if (activeTab === 'SCANNER' || activeTab === 'ADMIN' || activeTab === 'REPORTES' || activeTab === 'ACUDIENTES') {
        setActiveTab('ESTUDIANTE');
      }
    } else if (currentRole === 'ACUDIENTE') {
      if (activeTab === 'SCANNER' || activeTab === 'ADMIN' || activeTab === 'REPORTES') {
        setActiveTab('ACUDIENTES');
      }
    }
  }, [currentRole]);

  // Sync state to LocalStore backup
  useEffect(() => {
    saveLocalStore(dbData);
  }, [dbData]);

  // Handler: Register Attendance
  const handleRegisterAttendance = async (newAsistenciaData: Omit<Asistencia, 'id'>) => {
    const newId = `ASI-${Date.now().toString().slice(-6)}`;
    const fullAsistencia: Asistencia = {
      id: newId,
      ...newAsistenciaData
    };

    setDbData(prev => ({
      ...prev,
      asistencias: [fullAsistencia, ...prev.asistencias]
    }));

    // If student arrived late, automatically trigger Web Push & In-App alert
    if (newAsistenciaData.estado === 'TARDE') {
      const student = dbData.estudiantes.find(e => e.id === newAsistenciaData.estudiante_id);
      if (student) {
        const acudiente = dbData.acudientes.find(a => a.id === student.acudiente_id);
        const grado = dbData.grados.find(g => g.id === student.grado_id);
        const grupo = dbData.grupos.find(g => g.id === student.grupo_id);
        const asignatura = dbData.asignaturas.find(as => as.id === newAsistenciaData.asignatura_id);
        const docente = dbData.docentes.find(d => d.id === newAsistenciaData.docente_id);

        despacharAlertaAsistencia({
          estudiante: student,
          acudiente,
          tipo: 'TARDANZA',
          fecha: newAsistenciaData.fecha,
          hora: newAsistenciaData.hora_ingreso,
          materia: asignatura?.nombre_asignatura || 'Ingreso Institucional',
          docenteNombre: docente ? `${docente.nombres} ${docente.apellidos}` : 'Control Portería',
          gradoNombre: grado?.nombre_grado,
          grupoNombre: grupo?.nombre_grupo
        });
      }
    }
  };

  // Handler: Register Medical Excusa
  const handleSubmitExcusa = async (newExcusaData: Omit<Excusa, 'id' | 'creado_el' | 'estado'>) => {
    const newExcusa: Excusa = {
      id: `EXC-${Date.now().toString().slice(-6)}`,
      ...newExcusaData,
      estado: 'PENDIENTE',
      creado_el: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      excusas: [newExcusa, ...prev.excusas]
    }));
  };

  // Handler: Approve / Reject Medical Excusa
  const handleUpdateExcusaState = (excusaId: string, nuevoEstado: 'APROBADA' | 'RECHAZADA') => {
    setDbData(prev => {
      const targetExcusa = prev.excusas.find(ex => ex.id === excusaId);
      const updatedExcusas = prev.excusas.map(ex => 
        ex.id === excusaId ? { ...ex, estado: nuevoEstado } : ex
      );

      let updatedAsistencias = [...prev.asistencias];
      if (nuevoEstado === 'APROBADA' && targetExcusa) {
        updatedAsistencias = prev.asistencias.map(a => {
          if (a.estudiante_id === targetExcusa.estudiante_id && a.fecha >= targetExcusa.fecha_inicio && a.fecha <= targetExcusa.fecha_fin) {
            return { ...a, estado: 'EXCUSADO', observacion: `Incapacidad Médica Aprobada: ${targetExcusa.motivo}` };
          }
          return a;
        });
      }

      return {
        ...prev,
        excusas: updatedExcusas,
        asistencias: updatedAsistencias
      };
    });
  };

  // Handler: Add Gate Pass (Pase de Salida)
  const handleAddPaseSalida = async (nuevoPase: Omit<PaseSalida, 'id' | 'creado_el'>) => {
    const newPase: PaseSalida = {
      id: `PASE-${Math.floor(1000 + Math.random() * 9000)}`,
      ...nuevoPase,
      creado_el: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      pases_salida: [newPase, ...(prev.pases_salida || [])]
    }));
  };

  // Handler: Confirm effective exit in Gate (Salida Efectuada en Portería)
  const handleConfirmarSalidaEfectuada = (paseId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    setDbData(prev => ({
      ...prev,
      pases_salida: (prev.pases_salida || []).map(p => 
        p.id === paseId ? { ...p, estado: 'SALIDA_EFECTUADA', hora_salida_efectiva: timeStr } : p
      )
    }));
  };

  // Handler: Add Observer Annotation (Convivencia Escolar)
  const handleAddAnotacionObservador = async (nuevaAnotacion: Omit<AnotacionObservador, 'id' | 'creado_el'>) => {
    const newObs: AnotacionObservador = {
      id: `OBS-${Math.floor(100 + Math.random() * 900)}`,
      ...nuevaAnotacion,
      creado_el: new Date().toISOString()
    };

    setDbData(prev => ({
      ...prev,
      anotaciones_observador: [newObs, ...(prev.anotaciones_observador || [])]
    }));
  };

  // Handler: Sign Observer Annotation
  const handleFirmarAnotacion = (anotacionId: string, firmadoPor: string) => {
    const today = new Date().toISOString().split('T')[0];
    setDbData(prev => ({
      ...prev,
      anotaciones_observador: (prev.anotaciones_observador || []).map(o =>
        o.id === anotacionId ? { ...o, estado_firma: 'FIRMADO', firmado_por: firmadoPor, fecha_firma: today } : o
      )
    }));
  };

  // Handler: Add Student
  const handleAddEstudiante = async (studentData: Omit<Estudiante, 'id' | 'codigo_estudiantil'>) => {
    const nextSeq = String(dbData.estudiantes.length + 1).padStart(3, '0');
    const codigoEstudiantil = `2026-CALDAS-${nextSeq}`;
    const newId = `EST-${Date.now().toString().slice(-5)}`;

    const newEstudiante: Estudiante = {
      id: newId,
      codigo_estudiantil: codigoEstudiantil,
      ...studentData,
      foto_url: studentData.foto_url || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
    };

    setDbData(prev => ({
      ...prev,
      estudiantes: [newEstudiante, ...prev.estudiantes]
    }));

    // Auto-switch to Carnetization tab to show generated QR card
    setActiveTab('CARNETS');
  };

  // Handler: Delete Student
  const handleDeleteEstudiante = async (id: string) => {
    setDbData(prev => ({
      ...prev,
      estudiantes: prev.estudiantes.filter(e => e.id !== id)
    }));
  };

  // Handler: Add Teacher
  const handleAddDocente = async (docenteData: Omit<Docente, 'id'>) => {
    const selectedAsig = dbData.asignaturas.find(a => a.id === docenteData.asignatura_id);
    const asigName = selectedAsig ? `${selectedAsig.nombre_asignatura}${selectedAsig.ihs ? ` (IHS: ${selectedAsig.ihs})` : ''}` : '';
    
    const newDocente: Docente = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      ...docenteData,
      asignaturas_ids: docenteData.asignaturas_ids || (docenteData.asignatura_id ? [docenteData.asignatura_id] : []),
      asignaturas_nombres: docenteData.asignaturas_nombres || (asigName ? [asigName] : [])
    };

    setDbData(prev => ({
      ...prev,
      docentes: [newDocente, ...prev.docentes]
    }));
  };

  // Handler: Delete Teacher
  const handleDeleteDocente = async (id: string) => {
    setDbData(prev => ({
      ...prev,
      docentes: prev.docentes.filter(d => d.id !== id)
    }));
  };

  // Handler: Reset Seed Data
  const handleResetSeedData = () => {
    if (confirm("¿Estás seguro de restablecer todos los datos iniciales de prueba para la I.E.T. Francisco José de Caldas?")) {
      const reseted = resetLocalSeedStore();
      setDbData(reseted);
      alert("¡Base de datos restablecida con datos semilla oficiales para Natagaima!");
    }
  };

  const todayAsistenciasCount = dbData.asistencias.filter(a => a.fecha === selectedDate).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 cyber-grid flex flex-col font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">
      
      {/* App Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={currentUser}
        onResetSeedData={handleResetSeedData}
        studentCount={dbData.estudiantes.length}
        attendanceTodayCount={todayAsistenciasCount}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={() => setIsLoginModalOpen(true)}
        onOpenNotificationCenter={() => {
          setIsNotificationCenterOpen(true);
          setUnreadCount(0);
        }}
        unreadNotificationsCount={unreadCount}
      />

      {/* Global In-App Notification Toast Container (Real-Time HUD Toasts) */}
      <NotificationToastContainer />

      {/* Notification Center Modal (Push Settings, Simulator, History) */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        estudiantes={dbData.estudiantes}
        acudientes={dbData.acudientes}
        grados={dbData.grados}
        grupos={dbData.grupos}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'ESTUDIANTE' && (
          <StudentPortal
            estudiantes={dbData.estudiantes}
            asistencias={dbData.asistencias}
            excusas={dbData.excusas}
            pasesSalida={dbData.pases_salida || []}
            anotacionesObservador={dbData.anotaciones_observador || []}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            asignaturas={dbData.asignaturas}
            epsList={dbData.eps}
            acudientes={dbData.acudientes}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'PASES_SALIDA' && (
          <GatePassModule
            estudiantes={dbData.estudiantes}
            pasesSalida={dbData.pases_salida || []}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            acudientes={dbData.acudientes}
            currentRole={currentRole}
            currentUser={currentUser}
            onAddPaseSalida={handleAddPaseSalida}
            onConfirmarSalidaEfectuada={handleConfirmarSalidaEfectuada}
          />
        )}

        {activeTab === 'ALERTAS' && (
          <EarlyAlertsModule
            estudiantes={dbData.estudiantes}
            asistencias={dbData.asistencias}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            asignaturas={dbData.asignaturas}
            acudientes={dbData.acudientes}
            currentRole={currentRole}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'OBSERVADOR' && (
          <SchoolObserverModule
            estudiantes={dbData.estudiantes}
            anotacionesObservador={dbData.anotaciones_observador || []}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            docentes={dbData.docentes}
            currentRole={currentRole}
            currentUser={currentUser}
            onAddAnotacion={handleAddAnotacionObservador}
            onFirmarAnotacion={handleFirmarAnotacion}
          />
        )}

        {activeTab === 'SCANNER' && (
          <QRScannerModule
            estudiantes={dbData.estudiantes}
            grados={dbData.grados}
            grupos={dbData.grupos}
            asignaturas={dbData.asignaturas}
            docentes={dbData.docentes}
            onRegisterAttendance={handleRegisterAttendance}
            currentDocenteId={dbData.docentes[0]?.id || 'DOC-01'}
          />
        )}

        {activeTab === 'CARNETS' && (
          <QRCardGenerator
            estudiantes={dbData.estudiantes}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            epsList={dbData.eps}
            arlList={dbData.arl}
            acudientes={dbData.acudientes}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <DashboardStats
            estudiantes={dbData.estudiantes}
            asistencias={dbData.asistencias}
            grados={dbData.grados}
            grupos={dbData.grupos}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}

        {activeTab === 'REPORTES' && (
          <ReportsModule
            estudiantes={dbData.estudiantes}
            asistencias={dbData.asistencias}
            grados={dbData.grados}
            grupos={dbData.grupos}
            asignaturas={dbData.asignaturas}
            docentes={dbData.docentes}
            sedes={dbData.sedes}
            epsList={dbData.eps}
          />
        )}

        {activeTab === 'ACUDIENTES' && (
          <ParentsModule
            estudiantes={dbData.estudiantes}
            asistencias={dbData.asistencias}
            excusas={dbData.excusas}
            grados={dbData.grados}
            grupos={dbData.grupos}
            epsList={dbData.eps}
            acudientes={dbData.acudientes}
            currentRole={currentRole}
            onSubmitExcusa={handleSubmitExcusa}
            onUpdateExcusaState={handleUpdateExcusaState}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminCrudModule
            estudiantes={dbData.estudiantes}
            docentes={dbData.docentes}
            grados={dbData.grados}
            grupos={dbData.grupos}
            sedes={dbData.sedes}
            asignaturas={dbData.asignaturas}
            acudientes={dbData.acudientes}
            epsList={dbData.eps}
            arlList={dbData.arl}
            tiposDocumento={dbData.tipos_documento}
            onAddEstudiante={handleAddEstudiante}
            onDeleteEstudiante={handleDeleteEstudiante}
            onAddDocente={handleAddDocente}
            onDeleteDocente={handleDeleteDocente}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Global Register Student Modal */}
      <RegisterStudentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterStudent={handleAddEstudiante}
        grados={dbData.grados}
        grupos={dbData.grupos}
        sedes={dbData.sedes}
        epsList={dbData.eps}
        arlList={dbData.arl}
        tiposDoc={dbData.tipos_documento}
      />

      {/* Login Modal for Role & Profile Switching */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        docentes={dbData.docentes}
        acudientes={dbData.acudientes}
        estudiantes={dbData.estudiantes}
      />

      {/* Cyber Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center font-mono text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 <strong className="text-[#00F0FF]">SOFTWORKER</strong> — Sistema de Gestión Estudiantil por Código QR</p>
          <p className="text-slate-400">Institución Educativa Técnica Francisco José de Caldas • Natagaima, Tolima</p>
        </div>
      </footer>

    </div>
  );
}
