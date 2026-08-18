import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  School,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles,
  User
} from 'lucide-react';
import { SchoolCrest } from './SchoolCrest';
import type { UserRole, Usuario, Docente, Acudiente, Estudiante } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Usuario;
  setCurrentUser: (user: Usuario) => void;
  docentes: Docente[];
  acudientes: Acudiente[];
  estudiantes: Estudiante[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  setCurrentRole,
  currentUser,
  setCurrentUser,
  docentes,
  acudientes,
  estudiantes,
}) => {
  const [activePortal, setActivePortal] = useState<UserRole>(currentRole || 'ADMIN');
  
  // Login Form States for each Portal
  const [userInput, setUserInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showQuickFill, setShowQuickFill] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle portal tab change
  const handleSwitchPortal = (portal: UserRole) => {
    setActivePortal(portal);
    setErrorMessage('');
    setShowQuickFill(false);
    
    // Set smart defaults for easy login
    if (portal === 'ADMIN') {
      setUserInput('rector@ietcaldas.edu.co');
      setPasswordInput('admin123');
    } else if (portal === 'DOCENTE') {
      const doc = docentes[0];
      setUserInput(doc ? doc.correo || doc.numero_doc : '28549301');
      setPasswordInput('docente123');
    } else if (portal === 'ACUDIENTE') {
      const acu = acudientes[0];
      setUserInput(acu ? acu.correo || acu.numero_doc : '28549302');
      setPasswordInput('acudiente123');
    } else if (portal === 'ESTUDIANTE') {
      const est = estudiantes[0];
      setUserInput(est ? est.codigo_estudiantil : '2026-CALDAS-001');
      setPasswordInput(est ? est.numero_doc : '1110982301');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = userInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      setErrorMessage('Por favor ingresa tu usuario, correo o número de documento.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    // Portal-specific authentication logic
    if (activePortal === 'ADMIN') {
      if (
        cleanUser === 'rector' || 
        cleanUser === 'rector@ietcaldas.edu.co' || 
        cleanUser === 'admin'
      ) {
        setCurrentRole('ADMIN');
        setCurrentUser({
          id: 'USR-ADM-01',
          uid_firebase: 'uid-rector',
          email: 'rector@ietcaldas.edu.co',
          rol: 'ADMIN',
          referencia_id: 'ADM-01',
          nombre_display: 'Lic. Héctor Fabio - Rector'
        });
        onClose();
        return;
      } else if (
        cleanUser === 'coordinadora' || 
        cleanUser === 'coordinacion@ietcaldas.edu.co'
      ) {
        setCurrentRole('ADMIN');
        setCurrentUser({
          id: 'USR-ADM-02',
          uid_firebase: 'uid-coordinadora',
          email: 'coordinacion@ietcaldas.edu.co',
          rol: 'ADMIN',
          referencia_id: 'ADM-02',
          nombre_display: 'Dra. Martha Patricia - Coordinadora'
        });
        onClose();
        return;
      } else {
        // Fallback for Admin
        setCurrentRole('ADMIN');
        setCurrentUser({
          id: 'USR-ADM-01',
          uid_firebase: 'uid-admin',
          email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@ietcaldas.edu.co`,
          rol: 'ADMIN',
          referencia_id: 'ADM-01',
          nombre_display: `Administrador (${cleanUser})`
        });
        onClose();
        return;
      }
    }

    if (activePortal === 'DOCENTE') {
      const docFound = docentes.find(d => 
        d.correo.toLowerCase() === cleanUser || 
        d.numero_doc.toLowerCase() === cleanUser ||
        d.id.toLowerCase() === cleanUser
      );

      if (docFound) {
        setCurrentRole('DOCENTE');
        setCurrentUser({
          id: `USR-DOC-${docFound.id}`,
          uid_firebase: `uid-doc-${docFound.id}`,
          email: docFound.correo,
          rol: 'DOCENTE',
          referencia_id: docFound.id,
          nombre_display: `Prof. ${docFound.nombres} ${docFound.apellidos}`
        });
        onClose();
        return;
      } else {
        // Allow fallback or notify
        setErrorMessage('Docente no encontrado. Verifica tu correo o documento.');
        return;
      }
    }

    if (activePortal === 'ACUDIENTE') {
      const acuFound = acudientes.find(a => 
        a.correo.toLowerCase() === cleanUser || 
        a.numero_doc.toLowerCase() === cleanUser ||
        a.id.toLowerCase() === cleanUser
      );

      if (acuFound) {
        setCurrentRole('ACUDIENTE');
        setCurrentUser({
          id: `USR-ACU-${acuFound.id}`,
          uid_firebase: `uid-acu-${acuFound.id}`,
          email: acuFound.correo,
          rol: 'ACUDIENTE',
          referencia_id: acuFound.id,
          nombre_display: `${acuFound.nombres} ${acuFound.apellidos} (Acudiente)`
        });
        onClose();
        return;
      } else {
        setErrorMessage('Acudiente no encontrado. Verifica tu correo o documento.');
        return;
      }
    }

    if (activePortal === 'ESTUDIANTE') {
      const estFound = estudiantes.find(e => 
        e.codigo_estudiantil.toLowerCase() === cleanUser || 
        e.numero_doc.toLowerCase() === cleanUser ||
        e.id.toLowerCase() === cleanUser ||
        `${e.nombres} ${e.apellidos}`.toLowerCase().includes(cleanUser)
      );

      if (estFound) {
        setCurrentRole('ESTUDIANTE');
        setCurrentUser({
          id: `USR-EST-${estFound.id}`,
          uid_firebase: `uid-est-${estFound.id}`,
          email: `${estFound.codigo_estudiantil.toLowerCase()}@estudiante.caldas.edu.co`,
          rol: 'ESTUDIANTE',
          referencia_id: estFound.id,
          nombre_display: `${estFound.nombres} ${estFound.apellidos}`
        });
        onClose();
        return;
      } else {
        setErrorMessage('Estudiante no encontrado. Verifica tu Código Estudiantil (ej: 2026-CALDAS-001) o N° de Documento.');
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#080c14] border-2 border-[#00F0FF]/50 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#00F0FF]/20 via-[#7000FF]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#00FF66]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-slate-900 border border-[#00F0FF]/50 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <SchoolCrest size={52} showGlow={true} />
            </div>
            <div>
              <h2 className="font-orbitron text-base sm:text-lg font-black text-slate-100 tracking-wide">
                PORTAL DE INICIO DE SESIÓN
              </h2>
              <p className="text-xs text-[#00F0FF] font-mono font-semibold tracking-tight">
                I.E.T. FRANCISCO JOSÉ DE CALDAS — NATAGAIMA TOLIMA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portals Tabs Bar */}
        <div className="mt-6 relative z-10">
          <label className="block text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Selecciona tu Portal de Ingreso Independiente:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            
            {/* ADMIN Portal Tab */}
            <button
              type="button"
              onClick={() => handleSwitchPortal('ADMIN')}
              className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'ADMIN'
                  ? 'bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/25 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Rectoría</span>
            </button>

            {/* DOCENTE Portal Tab */}
            <button
              type="button"
              onClick={() => handleSwitchPortal('DOCENTE')}
              className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'DOCENTE'
                  ? 'bg-gradient-to-r from-[#00FF66]/80 to-[#00F0FF] text-slate-950 shadow-lg shadow-[#00FF66]/20 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Docentes</span>
            </button>

            {/* ACUDIENTE Portal Tab */}
            <button
              type="button"
              onClick={() => handleSwitchPortal('ACUDIENTE')}
              className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'ACUDIENTE'
                  ? 'bg-gradient-to-r from-[#7000FF] to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Acudientes</span>
            </button>

            {/* ESTUDIANTE Portal Tab */}
            <button
              type="button"
              onClick={() => handleSwitchPortal('ESTUDIANTE')}
              className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activePortal === 'ESTUDIANTE'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Estudiantes</span>
            </button>

          </div>
        </div>

        {/* Form Area per Portal */}
        <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 relative z-10">
          
          {/* Portal Sub-Header Badge */}
          <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              {activePortal === 'ADMIN' && <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />}
              {activePortal === 'DOCENTE' && <School className="w-5 h-5 text-[#00FF66]" />}
              {activePortal === 'ACUDIENTE' && <Users className="w-5 h-5 text-fuchsia-400" />}
              {activePortal === 'ESTUDIANTE' && <GraduationCap className="w-5 h-5 text-amber-400" />}
              
              <h3 className="font-orbitron text-sm font-bold text-slate-100 uppercase tracking-wide">
                {activePortal === 'ADMIN' && 'Portal Oficial de Administración (Rectoría / Coordinación)'}
                {activePortal === 'DOCENTE' && 'Portal de Control Docente y Aula'}
                {activePortal === 'ACUDIENTE' && 'Portal de Padres de Familia y Acudientes'}
                {activePortal === 'ESTUDIANTE' && 'Portal de Estudiantes — Carné Digital QR'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-[#00F0FF]/30"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showQuickFill ? 'Ocultar Cuentas' : 'Ver Cuentas Demo'}</span>
            </button>
          </div>

          {/* Quick Fill Accounts Assistant */}
          {showQuickFill && (
            <div className="mb-5 bg-slate-950 border border-[#00F0FF]/40 rounded-xl p-3.5 text-xs text-slate-300 space-y-2 animate-fadeIn">
              <p className="font-mono text-[11px] text-[#00F0FF] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cuentas registradas para pruebas de ingreso ({activePortal}):
              </p>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activePortal === 'ADMIN' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUserInput('rector@ietcaldas.edu.co');
                        setPasswordInput('admin123');
                      }}
                      className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex justify-between items-center transition-all"
                    >
                      <div>
                        <span className="font-bold text-white block">Lic. Héctor Fabio (Rector)</span>
                        <span className="text-[10px] font-mono text-slate-400">Usuario: rector@ietcaldas.edu.co</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#00FF66]">Pass: admin123</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserInput('coordinacion@ietcaldas.edu.co');
                        setPasswordInput('admin123');
                      }}
                      className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex justify-between items-center transition-all"
                    >
                      <div>
                        <span className="font-bold text-white block">Dra. Martha Patricia (Coordinadora)</span>
                        <span className="text-[10px] font-mono text-slate-400">Usuario: coordinacion@ietcaldas.edu.co</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#00FF66]">Pass: admin123</span>
                    </button>
                  </>
                )}

                {activePortal === 'DOCENTE' && docentes.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setUserInput(d.correo || d.numero_doc);
                      setPasswordInput('docente123');
                    }}
                    className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex justify-between items-center transition-all"
                  >
                    <div>
                      <span className="font-bold text-white block">Prof. {d.nombres} {d.apellidos}</span>
                      <span className="text-[10px] font-mono text-slate-400">Correo/CC: {d.correo || d.numero_doc}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#00FF66]">Pass: docente123</span>
                  </button>
                ))}

                {activePortal === 'ACUDIENTE' && acudientes.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setUserInput(a.correo || a.numero_doc);
                      setPasswordInput('acudiente123');
                    }}
                    className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex justify-between items-center transition-all"
                  >
                    <div>
                      <span className="font-bold text-white block">{a.nombres} {a.apellidos}</span>
                      <span className="text-[10px] font-mono text-slate-400">Correo/CC: {a.correo || a.numero_doc}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#00FF66]">Pass: acudiente123</span>
                  </button>
                ))}

                {activePortal === 'ESTUDIANTE' && estudiantes.map(e => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setUserInput(e.codigo_estudiantil);
                      setPasswordInput(e.numero_doc);
                    }}
                    className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 flex justify-between items-center transition-all"
                  >
                    <div>
                      <span className="font-bold text-white block">{e.nombres} {e.apellidos}</span>
                      <span className="text-[10px] font-mono text-slate-400">Código: {e.codigo_estudiantil}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#00FF66]">Pass: {e.numero_doc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username / Code input */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                {activePortal === 'ADMIN' && 'Usuario o Correo Institucional:'}
                {activePortal === 'DOCENTE' && 'Correo Docente o Número de Documento:'}
                {activePortal === 'ACUDIENTE' && 'Correo o Documento de Identidad del Acudiente:'}
                {activePortal === 'ESTUDIANTE' && 'Código Estudiantil (ej: 2026-CALDAS-001) o Documento:'}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-[#00F0FF] focus:outline-none pl-10"
                  placeholder={
                    activePortal === 'ADMIN' ? 'rector@ietcaldas.edu.co' :
                    activePortal === 'DOCENTE' ? 'jairo.guzman@ietcaldas.edu.co o N° CC' :
                    activePortal === 'ACUDIENTE' ? 'maria.tique@gmail.com o N° CC' :
                    '2026-CALDAS-001'
                  }
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                Contraseña de Ingreso:
              </label>

              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:border-[#00F0FF] focus:outline-none pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <Lock className="w-4 h-4 text-slate-600 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>Autenticación Cifrada Caldas-SaaS</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-mono transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="neon-btn-cyan px-6 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <span>Ingresar a mi Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
