import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  ScanLine, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Users, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Database,
  Radio,
  UserCheck,
  UserPlus,
  LogOut,
  User,
  GraduationCap,
  School,
  DoorOpen,
  Utensils,
  Award,
  Bell
} from 'lucide-react';
import { SchoolCrest } from './SchoolCrest';
import type { UserRole, Usuario } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Usuario;
  onResetSeedData: () => void;
  studentCount: number;
  attendanceTodayCount: number;
  onOpenRegisterModal?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  currentUser,
  onResetSeedData,
  studentCount,
  attendanceTodayCount,
  onOpenRegisterModal,
  onOpenLoginModal,
  onLogout,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'ESTUDIANTE', label: 'Portal Estudiante', icon: GraduationCap, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'SCANNER', label: 'Escáner QR', icon: ScanLine, roles: ['ADMIN', 'DOCENTE'] },
    { id: 'PASES_SALIDA', label: 'Pases de Salida', icon: DoorOpen, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'PAE_ALERTAS', label: 'PAE & Alertas', icon: Utensils, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'OBSERVADOR', label: 'Observador Digital', icon: Award, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'CARNETS', label: 'Carnetización', icon: QrCode, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'DASHBOARD', label: 'Tablero HUD', icon: LayoutDashboard, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] },
    { id: 'REPORTES', label: 'Reportes & Export', icon: FileSpreadsheet, roles: ['ADMIN', 'DOCENTE'] },
    { id: 'ACUDIENTES', label: 'Portal Acudiente', icon: Users, roles: ['ADMIN', 'ACUDIENTE'] },
    { id: 'ADMIN', label: 'Gestión CRUD', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      {/* Top Branding & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Institution Brand with Official Crest */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Official Triangular Crest */}
              <div className="p-1.5 bg-slate-900/90 border border-[#00F0FF]/50 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center justify-center">
                <SchoolCrest size={46} showGlow={true} />
              </div>

              {/* Softworker Tech Icon */}
              <div className="relative group hidden sm:block">
                <div className="w-11 h-11 bg-[#0b0f19] border border-[#00F0FF]/50 rounded-2xl flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                  <QrCode className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-orbitron text-lg sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-[#00F0FF] via-slate-100 to-[#00FF66] bg-clip-text text-transparent">
                  SOFTWORKER
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full font-bold">
                  v2.6 CYBER-SAAS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
                INSTITUCIÓN EDUCATIVA TÉCNICA FRANCISCO JOSÉ DE CALDAS — NATAGAIMA TOLIMA
              </p>
            </div>
          </div>

          {/* HUD Live Stats & Clock Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Context Action Button: Register Student */}
            {onOpenRegisterModal && (currentRole === 'ADMIN' || currentRole === 'DOCENTE') && (
              <button
                onClick={onOpenRegisterModal}
                className="neon-btn-green px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Estudiante</span>
              </button>
            )}

            {/* Clock Widget */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-[#00F0FF]">
              <Clock className="w-4 h-4 text-[#00F0FF] animate-pulse" />
              <span className="font-semibold tracking-wider">{time || '00:00:00'}</span>
            </div>

            {/* Live Indicator Counters */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-[#00FF66] animate-pulse" />
              <span className="text-slate-400">Hoy:</span>
              <span className="text-[#00FF66] font-bold">{attendanceTodayCount} Asistencias</span>
            </div>

            {/* Active Session & Login Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 border border border-slate-800 rounded-xl">
              
              {/* Profile Badge Button */}
              <button
                onClick={onOpenLoginModal}
                className="px-2.5 py-1 text-xs font-mono text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                title="Haga clic para cambiar de usuario o ingresar a otro portal"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00F0FF] flex items-center justify-center text-white font-bold text-[10px]">
                  {currentUser?.nombre_display?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden md:block max-w-[150px] truncate">
                  <span className="block text-[11px] font-bold leading-none truncate">
                    {currentUser?.nombre_display || 'Usuario Caldas'}
                  </span>
                  <span className="text-[9px] font-mono text-[#00F0FF] uppercase tracking-tighter">
                    Rol: {currentRole}
                  </span>
                </div>
              </button>

              {/* Role Quick Selector Pills */}
              <div className="hidden lg:flex items-center space-x-1">
                {(['ADMIN', 'DOCENTE', 'ACUDIENTE', 'ESTUDIANTE'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`px-2 py-1 text-[10px] font-mono font-semibold rounded-lg transition-all duration-200 ${
                      currentRole === role
                        ? 'bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/20 border border-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-800 mx-0.5"></div>

              {/* Login / Switch Portal Button */}
              <button
                onClick={onOpenLoginModal}
                className="px-2.5 py-1 text-xs font-mono font-bold text-[#00F0FF] hover:bg-[#00F0FF]/10 rounded-lg flex items-center gap-1.5 transition-all"
                title="Abrir inicio de sesión por portal"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="hidden sm:inline">Portal</span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-xs font-mono font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-all border border-transparent hover:border-red-900/50"
                  title="Cerrar sesión actual"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden xl:inline text-[11px]">Salir</span>
                </button>
              )}
            </div>

            {/* Seed / Reset Database Button */}
            <button
              onClick={onResetSeedData}
              title="Restablecer Datos de Prueba Natagaima"
              className="p-2 bg-slate-900/80 hover:bg-[#7000FF]/20 border border-slate-800 hover:border-[#7000FF] rounded-xl text-slate-400 hover:text-[#c084fc] transition-all text-xs font-mono flex items-center gap-1.5"
            >
              <Database className="w-4 h-4 text-[#7000FF]" />
              <span className="hidden xl:inline text-xs">Reset Datos</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 sm:space-x-2 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar pb-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F0FF]/20 via-[#00F0FF]/10 to-transparent border border-[#00F0FF]/60 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF] animate-bounce' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
