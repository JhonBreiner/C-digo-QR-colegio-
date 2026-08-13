export type UserRole = 'ADMIN' | 'DOCENTE' | 'ACUDIENTE';
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
  asignatura_id: string;
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
  observacion_medica: string;
  grado_id: string;
  grupo_id: string;
  sede_id: string;
  eps_id: string;
  arl_id: string;
  acudiente_id: string;
  padre_id: string;
  foto_url?: string;
}

export interface Asistencia {
  id?: string;
  estudiante_id: string;
  docente_id: string;
  fecha: string; // YYYY-MM-DD or Timestamp string
  hora_ingreso: string;
  hora_salida?: string;
  estado: EstadoAsistencia;
  observacion: string;
  asignatura_id?: string;
  grado_id?: string;
  grupo_id?: string;
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
