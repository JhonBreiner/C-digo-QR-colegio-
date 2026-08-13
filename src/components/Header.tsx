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
  UserCheck
} from 'lucide-react';
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
    { id: 'SCANNER', label: 'Escáner QR', icon: ScanLine, roles: ['ADMIN', 'DOCENTE'] },
    { id: 'CARNETS', label: 'Carnetización', icon: QrCode, roles: ['ADMIN', 'DOCENTE'] },
    { id: 'DASHBOARD', label: 'Tablero HUD', icon: LayoutDashboard, roles: ['ADMIN', 'DOCENTE', 'ACUDIENTE'] },
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
          
          {/* Logo & Institution Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#00FF66] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse-glow"></div>
              <div className="relative w-12 h-12 bg-[#0b0f19] border border-[#00F0FF]/50 rounded-xl flex items-center justify-center text-[#00F0FF]">
                <QrCode className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-orbitron text-xl font-extrabold tracking-wider bg-gradient-to-r from-[#00F0FF] via-slate-100 to-[#00FF66] bg-clip-text text-transparent">
                  SOFTWORKER
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 rounded-full font-bold">
                  v2.6 CYBER-SAAS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
                I.E.T. Francisco José de Caldas • Natagaima, Tolima
              </p>
            </div>
          </div>

          {/* HUD Live Stats & Clock Bar */}
          <div className="flex flex-wrap items-center gap-3">
            
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

            {/* Role Switcher Selector */}
            <div className="flex items-center space-x-2 bg-slate-900/90 p-1 border border-slate-800 rounded-xl">
              <UserCheck className="w-4 h-4 text-[#7000FF] ml-1.5 hidden sm:inline" />
              <span className="text-[11px] font-mono text-slate-400 uppercase hidden lg:inline">Rol:</span>
              {(['ADMIN', 'DOCENTE', 'ACUDIENTE'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-all duration-200 ${
                    currentRole === role
                      ? 'bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/20 border border-white/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {role}
                </button>
              ))}
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
        <nav className="flex items-center space-x-1 sm:space-x-2 mt-4 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar pb-1">
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
