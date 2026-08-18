export type UserRole = 'ADMIN' | 'DOCENTE' | 'ACUDIENTE' | 'ESTUDIANTE';
export type Role = UserRole;

export type EstadoAsistencia = 'PRESENTE' | 'TARDE' | 'EXCUSADO' | 'AUSENTE';

export interface TipoDocumento {
  id: string;
  sigla: string;
  nombre: string;
}

export interface EPS {
  id: string;
  nombre_eps: string;
}

export interface ARL {
  id: string;
  nombre_arl: string;
}

export interface Sede {
  id: string;
  nombre_sede: string;
  direccion: string;
}

export interface Grado {
  id: string;
  nombre_grado: string;
}

export interface Grupo {
  id: string;
  nombre_grupo: string;
}

export interface Departamento {
  id: string;
  nombre_departamento: string;
}

export interface Ciudad {
  id: string;
  nombre_ciudad: string;
  departamento_id: string;
}

export interface Asignatura {
  id: string;
  nombre_asignatura: string;
  area?: string;
}

export interface Acudiente {
  id: string;
  tipo_doc_id: string;
  numero_doc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  password?: string;
}

export interface PadreFamilia {
  id: string;
  tipo_doc_id: string;
  numero_doc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
}

export interface Docente {
  id: string;
  tipo_doc_id: string;
  numero_doc: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  asignatura_id?: string;
  asignaturas_ids?: string[];
  asignaturas_nombres?: string[];
  password?: string;
}

export interface Estudiante {
  id: string;
  codigo_estudiantil: string;
  tipo_doc_id: string;
  numero_doc: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  estrato: number;
  genero: string;
  rh: string; // RH Blood Type e.g., O+, A+, O-, B+
  observacion_medica: string;
  grado_id: string;
  grupo_id: string;
  sede_id: string;
  eps_id: string;
  arl_id: string;
  acudiente_id: string;
  padre_id: string;
  foto_url?: string;
  password?: string;
  // Optional expanded guardian/parent info
  acudiente_nombre?: string;
  acudiente_telefono?: string;
  acudiente_correo?: string;
  acudiente_direccion?: string;
  padre_nombre?: string;
  padre_telefono?: string;
}

export interface Asistencia {
  id?: string;
  estudiante_id: string;
  docente_id: string;
  fecha: string; // YYYY-MM-DD or DD/MM/YYYY
  hora_ingreso: string; // HH:MM:SS AM/PM
  hora_salida?: string; // HH:MM:SS AM/PM
  estado: EstadoAsistencia; // PRESENTE = A tiempo, TARDE = Retardo al colegio, EXCUSADO = Falla justificada, AUSENTE = Ausente
  observacion: string;
  asignatura_id?: string;
  asignatura_nombre?: string;
  area_activa?: string;
  docente_nombre?: string;
  estudiante_nombre?: string;
  estudiante_documento?: string;
  grado_id?: string;
  grado_nombre?: string;
  grupo_id?: string;
  grupo_nombre?: string;
  metodo_registro?: string;
  creado_en?: any;
}

export interface Usuario {
  id: string;
  uid_firebase: string;
  email: string;
  rol: UserRole;
  referencia_id: string;
  nombre_display?: string;
  password?: string;
}

export interface Excusa {
  id: string;
  estudiante_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  creado_el: string;
  archivo_nombre?: string;
}

export type ExcusaMedica = Excusa;

export type EstadoPaseSalida = 'AUTORIZADO' | 'SALIDA_EFECTUADA' | 'CANCELADO' | 'VENCIDO';

export interface PaseSalida {
  id: string;
  estudiante_id: string;
  estudiante_nombre?: string;
  estudiante_documento?: string;
  grado_nombre?: string;
  grupo_nombre?: string;
  fecha: string;
  hora_autorizada: string;
  hora_salida_efectiva?: string;
  motivo: string;
  categoria_motivo: 'CITA_MEDICA' | 'RETIRO_ACUDIENTE' | 'CALAMIDAD' | 'ACTIVIDAD_PEDAGOGICA' | 'ENFERMERIA' | 'OTRO';
  autorizado_por: string;
  persona_retira: string;
  documento_retira: string;
  telefono_contacto: string;
  parentesco_retira: string;
  estado: EstadoPaseSalida;
  observaciones?: string;
  codigo_seguridad: string;
  creado_el: string;
}

export type TipoServicioPAE = 'DESAYUNO' | 'ALMUERZO' | 'REFRIGERIO' | 'SALA_SISTEMAS' | 'BIBLIOTECA';

export interface RegistroPAE {
  id: string;
  estudiante_id: string;
  estudiante_nombre?: string;
  estudiante_documento?: string;
  grado_nombre?: string;
  grupo_nombre?: string;
  fecha: string;
  hora: string;
  tipo_servicio: TipoServicioPAE;
  operador_entrega: string;
  observacion?: string;
  equipo_numero?: string;
}

export type TipoAnotacionConvivencia = 'TIPO_I' | 'TIPO_II' | 'TIPO_III' | 'RECONOCIMIENTO';

export interface AnotacionObservador {
  id: string;
  estudiante_id: string;
  estudiante_nombre?: string;
  estudiante_documento?: string;
  grado_nombre?: string;
  grupo_nombre?: string;
  docente_id: string;
  docente_nombre: string;
  fecha: string;
  hora: string;
  tipo: TipoAnotacionConvivencia;
  titulo: string;
  descripcion: string;
  descargos_estudiante?: string;
  compromisos_estudiante: string;
  compromisos_acudiente?: string;
  estado_firma: 'PENDIENTE' | 'FIRMADO';
  firmado_por?: string;
  fecha_firma?: string;
  creado_el: string;
}
