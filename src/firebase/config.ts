import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type {
  TipoDocumento, EPS, ARL, Sede, Grado, Grupo,
  Departamento, Ciudad, Asignatura, Acudiente,
  PadreFamilia, Docente, Estudiante, Asistencia, Usuario, Excusa
} from '../types';

// Read env variables or use default fallback structure
const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyNatagaimaSoftworker2026",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "softworker-caldas.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "softworker-caldas",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "softworker-caldas.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "665199825759",
  appId: env.VITE_FIREBASE_APP_ID || "1:665199825759:web:softworker2026"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initial Seed Data for Natagaima - I.E.T. Francisco José de Caldas
export const INITIAL_SEED_DATA = {
  tipos_documento: [
    { id: 'TD-01', sigla: 'TI', nombre: 'Tarjeta de Identidad' },
    { id: 'TD-02', sigla: 'CC', nombre: 'Cédula de Ciudadanía' },
    { id: 'TD-03', sigla: 'CE', nombre: 'Cédula de Extranjería' },
  ],
  eps: [
    { id: 'EPS-01', nombre_eps: 'Asmet Salud EPS (Natagaima)' },
    { id: 'EPS-02', nombre_eps: 'Nueva EPS EPS-S' },
    { id: 'EPS-03', nombre_eps: 'Coosalud EPS' },
    { id: 'EPS-04', nombre_eps: 'Salud Total' },
  ],
  arl: [
    { id: 'ARL-01', nombre_arl: 'Positiva Compañía de Seguros' },
    { id: 'ARL-02', nombre_arl: 'ARL Sura Colombia' },
    { id: 'ARL-03', nombre_arl: 'AXA Colpatria ARL' },
  ],
  sedes: [
    { id: 'SEDE-01', nombre_sede: 'Sede Principal - Francisco José de Caldas', direccion: 'Cra 5 N° 7-12, Centro Natagaima, Tolima' },
    { id: 'SEDE-02', nombre_sede: 'Sede Primaria San Antonio', direccion: 'Barrio San Antonio, Natagaima' },
    { id: 'SEDE-03', nombre_sede: 'Sede Rural Paso Ancho', direccion: 'Vereda Paso Ancho, Natagaima' },
  ],
  grados: [
    { id: 'GRA-06', nombre_grado: '6° Grado - Secundaria' },
    { id: 'GRA-07', nombre_grado: '7° Grado - Secundaria' },
    { id: 'GRA-08', nombre_grado: '8° Grado - Secundaria' },
    { id: 'GRA-09', nombre_grado: '9° Grado - Secundaria' },
    { id: 'GRA-10', nombre_grado: '10° Grado - Media Técnica' },
    { id: 'GRA-11', nombre_grado: '11° Grado - Media Técnica' },
  ],
  grupos: [
    { id: 'GRP-61', nombre_grupo: '6-01' },
    { id: 'GRP-62', nombre_grupo: '6-02' },
    { id: 'GRP-71', nombre_grupo: '7-01' },
    { id: 'GRP-81', nombre_grupo: '8-01' },
    { id: 'GRP-91', nombre_grupo: '9-01' },
    { id: 'GRP-101', nombre_grupo: '10-01 Técnico' },
    { id: 'GRP-111', nombre_grupo: '11-01 Técnico' },
  ],
  departamentos: [
    { id: 'DEP-73', nombre_departamento: 'Tolima' },
    { id: 'DEP-41', nombre_departamento: 'Huila' },
  ],
  ciudades: [
    { id: 'CIU-01', nombre_ciudad: 'Natagaima', departamento_id: 'DEP-73' },
    { id: 'CIU-02', nombre_ciudad: 'Purificación', departamento_id: 'DEP-73' },
    { id: 'CIU-03', nombre_ciudad: 'Neiva', departamento_id: 'DEP-41' },
  ],
  asignaturas: [
    { id: 'ASIG-01', nombre_asignatura: 'Sistemas y Desarrollo Software' },
    { id: 'ASIG-02', nombre_asignatura: 'Matemáticas y Algoritmos' },
    { id: 'ASIG-03', nombre_asignatura: 'Lengua Castellana y Comunicación' },
    { id: 'ASIG-04', nombre_asignatura: 'Ciencias Naturales y Química' },
    { id: 'ASIG-05', nombre_asignatura: 'Física y Mecatrónica' },
  ],
  acudientes: [
    { id: 'ACU-01', tipo_doc_id: 'TD-02', numero_doc: '28549302', nombres: 'María Elena', apellidos: 'Tique Capera', telefono: '3124598021', correo: 'maria.tique@gmail.com', direccion: 'Calle 4 # 8-22 Natagaima' },
    { id: 'ACU-02', tipo_doc_id: 'TD-02', numero_doc: '14289033', nombres: 'José Hilario', apellidos: 'Aroca Yate', telefono: '3157890432', correo: 'jose.aroca@hotmail.com', direccion: 'Vereda Pozo Azul, Natagaima' },
    { id: 'ACU-03', tipo_doc_id: 'TD-02', numero_doc: '65890123', nombres: 'Esperanza', apellidos: 'Devia Guzman', telefono: '3209876543', correo: 'esperanza.devia@outlook.com', direccion: 'Cra 6 N° 10-05 Natagaima' }
  ],
  padres_familia: [
    { id: 'PAD-01', tipo_doc_id: 'TD-02', numero_doc: '93120443', nombres: 'Pedro Nel', apellidos: 'Tique Gonzalez', telefono: '3105678901', correo: 'pedro.tique@gmail.com' },
    { id: 'PAD-02', tipo_doc_id: 'TD-02', numero_doc: '93450912', nombres: 'Hernán', apellidos: 'Aroca Devia', telefono: '3189012345', correo: 'hernan.aroca@gmail.com' },
  ],
  docentes: [
    { id: 'DOC-01', tipo_doc_id: 'TD-02', numero_doc: '1110543210', nombres: 'Carlos Mario', apellidos: 'Mendoza Ruiz', correo: 'carlos.mendoza@ietcaldas.edu.co', telefono: '3118901234', asignatura_id: 'ASIG-01' },
    { id: 'DOC-02', tipo_doc_id: 'TD-02', numero_doc: '1110987654', nombres: 'Luz Dary', apellidos: 'Murillo Castro', correo: 'luz.dary@ietcaldas.edu.co', telefono: '3142345678', asignatura_id: 'ASIG-02' },
  ],
  estudiantes: [
    {
      id: 'EST-001',
      codigo_estudiantil: '2026-CALDAS-001',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234561',
      nombres: 'Santiago',
      apellidos: 'Tique Capera',
      fecha_nacimiento: '2009-04-15',
      estrato: 1,
      genero: 'M',
      observacion_medica: 'Alergia leve a la penicilina',
      grado_id: 'GRA-10',
      grupo_id: 'GRP-101',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'EST-002',
      codigo_estudiantil: '2026-CALDAS-002',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234562',
      nombres: 'Valeria',
      apellidos: 'Aroca Devia',
      fecha_nacimiento: '2008-09-22',
      estrato: 1,
      genero: 'F',
      observacion_medica: 'Ninguna observacion reportada',
      grado_id: 'GRA-11',
      grupo_id: 'GRP-111',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-02',
      arl_id: 'ARL-02',
      acudiente_id: 'ACU-02',
      padre_id: 'PAD-02',
      foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'EST-003',
      codigo_estudiantil: '2026-CALDAS-003',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234563',
      nombres: 'Camilo Andrés',
      apellidos: 'Yate Devia',
      fecha_nacimiento: '2010-01-10',
      estrato: 2,
      genero: 'M',
      observacion_medica: 'Asma bronquial - Usa inhalador',
      grado_id: 'GRA-09',
      grupo_id: 'GRP-91',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-03',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'EST-004',
      codigo_estudiantil: '2026-CALDAS-004',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234564',
      nombres: 'Mariana',
      apellidos: 'Guzmán Tique',
      fecha_nacimiento: '2011-06-30',
      estrato: 1,
      genero: 'F',
      observacion_medica: 'Usa gafas formuladas',
      grado_id: 'GRA-08',
      grupo_id: 'GRP-81',
      sede_id: 'SEDE-02',
      eps_id: 'EPS-03',
      arl_id: 'ARL-03',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-02',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'EST-005',
      codigo_estudiantil: '2026-CALDAS-005',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234565',
      nombres: 'Juan David',
      apellidos: 'Aroca Tique',
      fecha_nacimiento: '2012-11-05',
      estrato: 1,
      genero: 'M',
      observacion_medica: 'Sin requerimientos especiales',
      grado_id: 'GRA-06',
      grupo_id: 'GRP-61',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-02',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-02',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    }
  ],
  asistencias: [
    {
      id: 'ASI-001',
      estudiante_id: 'EST-001',
      docente_id: 'DOC-01',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '06:55 AM',
      hora_salida: '01:15 PM',
      estado: 'PRESENTE' as const,
      observacion: 'Ingreso a tiempo con uniforme completo',
      asignatura_id: 'ASIG-01'
    },
    {
      id: 'ASI-002',
      estudiante_id: 'EST-002',
      docente_id: 'DOC-01',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '07:18 AM',
      hora_salida: '01:15 PM',
      estado: 'TARDE' as const,
      observacion: 'Retardo por transporte intermunicipal',
      asignatura_id: 'ASIG-01'
    },
    {
      id: 'ASI-003',
      estudiante_id: 'EST-003',
      docente_id: 'DOC-02',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '07:00 AM',
      hora_salida: '',
      estado: 'EXCUSADO' as const,
      observacion: 'Presentó incapacidad médica por asma',
      asignatura_id: 'ASIG-02'
    }
  ],
  usuarios: [
    { id: 'USR-01', uid_firebase: 'admin-softworker', email: 'admin@softworker.co', rol: 'ADMIN' as const, referencia_id: 'ADM-01', nombre_display: 'Administrador Softworker' },
    { id: 'USR-02', uid_firebase: 'docente-carlos', email: 'carlos.mendoza@ietcaldas.edu.co', rol: 'DOCENTE' as const, referencia_id: 'DOC-01', nombre_display: 'Ing. Carlos Mendoza' },
    { id: 'USR-03', uid_firebase: 'acudiente-maria', email: 'maria.tique@gmail.com', rol: 'ACUDIENTE' as const, referencia_id: 'ACU-01', nombre_display: 'María Elena Tique' },
  ],
  excusas: [
    {
      id: 'EXC-001',
      estudiante_id: 'EST-003',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      motivo: 'Cita médica de control respiratorio en Centro de Salud Natagaima',
      estado: 'APROBADA' as const,
      creado_el: new Date().toISOString(),
      archivo_nombre: 'incapacidad_medica_camilo.pdf'
    }
  ]
};

// LocalStorage Persistent Store Backup for instant client operation
const STORAGE_KEY = 'SOFTWORKER_CALDAS_DB_V1';

export function getLocalStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback if corrupted
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
  return INITIAL_SEED_DATA;
}

export function saveLocalStore(data: typeof INITIAL_SEED_DATA) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetLocalSeedStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
  return INITIAL_SEED_DATA;
}
