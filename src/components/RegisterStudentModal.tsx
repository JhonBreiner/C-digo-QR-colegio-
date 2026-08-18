import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  HeartPulse, 
  BookOpen, 
  Users, 
  CheckCircle2,
  Sparkles,
  CreditCard
} from 'lucide-react';
import type { Estudiante, Grado, Grupo, Sede, EPS, ARL, TipoDocumento } from '../types';

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterStudent: (newStudent: Omit<Estudiante, 'id' | 'codigo_estudiantil'>) => void;
  grados: Grado[];
  grupos: Grupo[];
  sedes: Sede[];
  epsList: EPS[];
  arlList: ARL[];
  tiposDoc: TipoDocumento[];
}

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onRegisterStudent,
  grados,
  grupos,
  sedes,
  epsList,
  arlList,
  tiposDoc,
}) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocId, setTipoDocId] = useState(tiposDoc[0]?.id || 'TD-01');
  const [numeroDoc, setNumeroDoc] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('2010-01-15');
  const [genero, setGenero] = useState('M');
  const [estrato, setEstrato] = useState<number>(1);
  const [rh, setRh] = useState('O+');

  const [gradoId, setGradoId] = useState(grados[0]?.id || 'GRA-06');
  const [grupoId, setGrupoId] = useState(grupos[0]?.id || 'GRP-61');
  const [sedeId, setSedeId] = useState(sedes[0]?.id || 'SEDE-01');

  const [epsId, setEpsId] = useState(epsList[0]?.id || 'EPS-01');
  const [arlId, setArlId] = useState(arlList[0]?.id || 'ARL-01');
  const [observacionMedica, setObservacionMedica] = useState('');

  const [acudienteNombre, setAcudienteNombre] = useState('');
  const [acudienteTelefono, setAcudienteTelefono] = useState('');
  const [acudienteCorreo, setAcudienteCorreo] = useState('');
  const [acudienteDireccion, setAcudienteDireccion] = useState('');
  
  const [padreNombre, setPadreNombre] = useState('');
  const [padreTelefono, setPadreTelefono] = useState('');

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nombres.trim() || !apellidos.trim() || !numeroDoc.trim()) {
      setFormError('Por favor completa los nombres, apellidos y número de documento.');
      return;
    }

    onRegisterStudent({
      tipo_doc_id: tipoDocId,
      numero_doc: numeroDoc.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fecha_nacimiento: fechaNacimiento,
      estrato: Number(estrato),
      genero,
      rh,
      observacion_medica: observacionMedica.trim() || 'Sin observaciones médicas reportadas',
      grado_id: gradoId,
      grupo_id: grupoId,
      sede_id: sedeId,
      eps_id: epsId,
      arl_id: arlId,
      acudiente_id: 'ACU-NEW',
      padre_id: 'PAD-NEW',
      foto_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      acudiente_nombre: acudienteNombre.trim(),
      acudiente_telefono: acudienteTelefono.trim(),
      acudiente_correo: acudienteCorreo.trim(),
      acudiente_direccion: acudienteDireccion.trim(),
      padre_nombre: padreNombre.trim(),
      padre_telefono: padreTelefono.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel p-6 rounded-2xl border border-[#00F0FF]/50 shadow-[0_0_50px_rgba(0,240,255,0.2)] my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00F0FF]/10 border border-[#00F0FF] rounded-xl text-[#00F0FF]">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-slate-100 flex items-center gap-2">
                Registrar Nuevo Estudiante
                <span className="text-xs font-mono text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded-full border border-[#00FF66]/30">
                  Matrícula 2026
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                I.E.T. Francisco José de Caldas - Natagaima, Tolima
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300">
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-mono">
          
          {/* Section 1: Datos Personales */}
          <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
              1. Datos Personales
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Camilo"
                  value={nombres}
                  onChange={e => setNombres(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tique Capera"
                  value={apellidos}
                  onChange={e => setApellidos(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Tipo Documento</label>
                <select
                  value={tipoDocId}
                  onChange={e => setTipoDocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                >
                  {tiposDoc.map(td => (
                    <option key={td.id} value={td.id}>{td.nombre} ({td.sigla})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Número Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1098234567"
                  value={numeroDoc}
                  onChange={e => setNumeroDoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fecha Nacimiento</label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={e => setFechaNacimiento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Género</label>
                <select
                  value={genero}
                  onChange={e => setGenero(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                >
                  <option value="M">Masculino (M)</option>
                  <option value="F">Femenino (F)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Estrato</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={estrato}
                  onChange={e => setEstrato(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#00FF66] font-bold block mb-1">Tipo de Sangre (RH) *</label>
                <select
                  value={rh}
                  onChange={e => setRh(e.target.value)}
                  className="w-full bg-slate-950 border border-[#00FF66]/50 rounded-lg px-3 py-2 text-[#00FF66] font-bold focus:border-[#00FF66] focus:outline-none"
                >
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Datos Académicos */}
          <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
            <h4 className="text-[#7000FF] font-bold text-xs uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c084fc]" />
              2. Asignación Académica
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Sede Educativa</label>
                <select
                  value={sedeId}
                  onChange={e => setSedeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#7000FF] focus:outline-none"
                >
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Grado (6° a 11°)</label>
                <select
                  value={gradoId}
                  onChange={e => setGradoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#7000FF] focus:outline-none"
                >
                  {grados.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre_grado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Grupo</label>
                <select
                  value={grupoId}
                  onChange={e => setGrupoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#7000FF] focus:outline-none"
                >
                  {grupos.map(gr => (
                    <option key={gr.id} value={gr.id}>{gr.nombre_grupo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Datos Médicos e Institucionales */}
          <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
            <h4 className="text-rose-400 font-bold text-xs uppercase flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              3. Salud, EPS & Salud Ocupacional
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">EPS Afiliada</label>
                <select
                  value={epsId}
                  onChange={e => setEpsId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 focus:outline-none"
                >
                  {epsList.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre_eps}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ARL Institucional</label>
                <select
                  value={arlId}
                  onChange={e => setArlId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 focus:outline-none"
                >
                  {arlList.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre_arl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Observaciones Médicas / Alergias</label>
              <input
                type="text"
                placeholder="Ej: Inhalador para asma, alergia a penicilina, usa gafas formuladas..."
                value={observacionMedica}
                onChange={e => setObservacionMedica(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Datos Acudiente y Padres */}
          <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
            <h4 className="text-[#00FF66] font-bold text-xs uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00FF66]" />
              4. Datos del Acudiente Principal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Nombre Completo Acudiente</label>
                <input
                  type="text"
                  placeholder="Ej: Esperanza Devia Guzmán"
                  value={acudienteNombre}
                  onChange={e => setAcudienteNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00FF66] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej: 3124598021"
                  value={acudienteTelefono}
                  onChange={e => setAcudienteTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00FF66] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="Ej: acudiente@gmail.com"
                  value={acudienteCorreo}
                  onChange={e => setAcudienteCorreo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00FF66] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dirección de Residencia</label>
                <input
                  type="text"
                  placeholder="Ej: Cra 5 # 10-12 Centro, Natagaima"
                  value={acudienteDireccion}
                  onChange={e => setAcudienteDireccion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-[#00FF66] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="neon-btn-green px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar y Generar Carné QR
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
