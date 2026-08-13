import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { QRScannerModule } from './components/QRScannerModule';
import { QRCardGenerator } from './components/QRCardGenerator';
import { ReportsModule } from './components/ReportsModule';
import { ParentsModule } from './components/ParentsModule';
import { AdminCrudModule } from './components/AdminCrudModule';

import { 
  getLocalStore, 
  saveLocalStore, 
  resetLocalSeedStore 
} from './firebase/config';

import type { 
  UserRole, Estudiante, Docente, Asistencia, Excusa, 
  Grado, Grupo, Sede, Asignatura, EPS, ARL, TipoDocumento, Acudiente, Usuario 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('SCANNER');
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Master State loaded from Store
  const [dbData, setDbData] = useState(() => getLocalStore());

  // Current active user
  const currentUser: Usuario = dbData.usuarios[0] || {
    id: 'USR-01',
    uid_firebase: 'admin-softworker',
    email: 'admin@softworker.co',
    rol: 'ADMIN',
    referencia_id: 'ADM-01',
    nombre_display: 'Administrador Softworker'
  };

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

  // Handler: Add Student
  const handleAddEstudiante = async (studentData: Omit<Estudiante, 'id'>) => {
    const newId = `EST-${Date.now().toString().slice(-5)}`;
    const newEstudiante: Estudiante = {
      id: newId,
      ...studentData,
      foto_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
    };

    setDbData(prev => ({
      ...prev,
      estudiantes: [newEstudiante, ...prev.estudiantes]
    }));
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
    const newDocente: Docente = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      ...docenteData
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
      alert("¡Base de datos restablecida con datos semilla para Natagaima!");
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
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onSubmitExcusa={handleSubmitExcusa}
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
