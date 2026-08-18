import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
    { id: 'TD-04', sigla: 'RC', nombre: 'Registro Civil de Nacimiento' },
  ],
  eps: [
    { id: 'EPS-01', nombre_eps: 'Asmet Salud EPS (Natagaima)' },
    { id: 'EPS-02', nombre_eps: 'Nueva EPS EPS-S' },
    { id: 'EPS-03', nombre_eps: 'Coosalud EPS' },
    { id: 'EPS-04', nombre_eps: 'Salud Total EPS' },
  ],
  arl: [
    { id: 'ARL-01', nombre_arl: 'Positiva Compañía de Seguros' },
    { id: 'ARL-02', nombre_arl: 'ARL Sura Colombia' },
    { id: 'ARL-03', nombre_arl: 'AXA Colpatria ARL' },
  ],
  sedes: [
    { id: 'SEDE-01', nombre_sede: 'Sede Principal', direccion: 'Cra 5 N° 7-12, Centro Natagaima, Tolima' },
    { id: 'SEDE-02', nombre_sede: 'Sede María Auxiliadora', direccion: 'Barrio María Auxiliadora, Natagaima, Tolima' },
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
    { id: 'GRP-01', nombre_grupo: '01' },
    { id: 'GRP-02', nombre_grupo: '02' },
    { id: 'GRP-03', nombre_grupo: '03' },
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
    // ÁREA: CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL
    { id: 'ASIG-19', nombre_asignatura: 'Física', area: 'Ciencias Naturales y Educación Ambiental', ihs: 3, docente_titular: 'José Edgar Trilleras Trilleras' },
    { id: 'ASIG-11', nombre_asignatura: 'Química', area: 'Ciencias Naturales y Educación Ambiental', ihs: 3, docente_titular: 'Mercy Eloisa Herrada Yara' },
    { id: 'ASIG-21', nombre_asignatura: 'Ciencias Naturales y Educación Ambiental', area: 'Ciencias Naturales y Educación Ambiental', ihs: 6, docente_titular: 'Docente Ciencias Naturales' },
    
    // ÁREA: CIENCIAS SOCIALES
    { id: 'ASIG-01', nombre_asignatura: 'Ciencias Sociales', area: 'Ciencias Sociales', ihs: 3, docente_titular: 'Jamer Andrade Vargas' },
    { id: 'ASIG-12', nombre_asignatura: 'Cátedra de Paz', area: 'Ciencias Sociales', ihs: 1, docente_titular: 'Deisy Yaneth Medina Murcia' },
    { id: 'ASIG-02', nombre_asignatura: 'Ciencias Políticas y Económicas', area: 'Ciencias Económicas y Políticas', ihs: 2, docente_titular: 'Jamer Andrade Vargas' },
    { id: 'ASIG-03', nombre_asignatura: 'Filosofía', area: 'Filosofía', ihs: 2, docente_titular: 'Jamer Andrade Vargas' },
    
    // ÁREA: HUMANIDADES
    { id: 'ASIG-04', nombre_asignatura: 'Lengua Castellana', area: 'Humanidades: Lengua Castellana', ihs: 4, docente_titular: 'Luis Eduardo Cuellar' },
    { id: 'ASIG-10', nombre_asignatura: 'Inglés (Idioma Extranjero)', area: 'Humanidades: Idioma Extranjero', ihs: 3, docente_titular: 'Larissa Alejandra González Rodríguez' },
    
    // ÁREA: MATEMÁTICAS
    { id: 'ASIG-07', nombre_asignatura: 'Matemáticas', area: 'Matemáticas', ihs: 4, docente_titular: 'John Fredy Díaz' },
    
    // ÁREA: TECNOLOGÍA E INFORMÁTICA
    { id: 'ASIG-13', nombre_asignatura: 'Tecnología e Informática', area: 'Tecnología e Informática', ihs: 1, docente_titular: 'Jhon Jairo Molano Jiménez' },
    
    // ÁREA: EDUCACIÓN ARTÍSTICA
    { id: 'ASIG-14', nombre_asignatura: 'Educación Artística', area: 'Educación Artística', ihs: 1, docente_titular: 'Ruth Lucena Oliveros Culma' },
    
    // ÁREA: ÉTICA Y VALORES
    { id: 'ASIG-16', nombre_asignatura: 'Educación Ética y en Valores Humanos', area: 'Educación Ética y en Valores Humanos', ihs: 1, docente_titular: 'Silenia Rodríguez Matoma' },
    
    // ÁREA: EDUCACIÓN RELIGIOSA
    { id: 'ASIG-17', nombre_asignatura: 'Educación Religiosa', area: 'Educación Religiosa', ihs: 1, docente_titular: 'Silenia Rodríguez Matoma' },
    
    // ÁREA: EDUCACIÓN FÍSICA
    { id: 'ASIG-18', nombre_asignatura: 'Educación Física, Recreación y Deportes', area: 'Educación Física, Recreación y Deportes', ihs: 2, docente_titular: 'Juan Sebastián Román Salazar' },
    
    // ÁREA: CÁTEDRA DE EMPRENDIMIENTO
    { id: 'ASIG-05', nombre_asignatura: 'Cátedra de Emprendimiento', area: 'Cátedra de Emprendimiento', ihs: 1, docente_titular: 'Luis Eduardo Cuellar' },
    
    // ÁREA: ESPECIALIDAD TÉCNICA (SISTEMAS)
    { id: 'ASIG-06', nombre_asignatura: 'Salud Ocupacional', area: 'Especialidad', ihs: 1, docente_titular: 'Luis Eduardo Cuellar' },
    { id: 'ASIG-08', nombre_asignatura: 'Lógica de Programación', area: 'Especialidad', ihs: 3, docente_titular: 'Helvis González Cutiva' },
    { id: 'ASIG-09', nombre_asignatura: 'Mantenimiento de Computadores', area: 'Especialidad', ihs: 1, docente_titular: 'Helvis González Cutiva' },
    { id: 'ASIG-15', nombre_asignatura: 'Bases de Datos', area: 'Especialidad', ihs: 2, docente_titular: 'Ivan Andrés Perdomo' },
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
    { 
      id: 'DOC-01', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543201', 
      nombres: 'Jamer', 
      apellidos: 'Andrade Vargas', 
      correo: 'jamer.andrade@ietcaldas.edu.co', 
      telefono: '3118901201', 
      asignatura_id: 'ASIG-01',
      asignaturas_ids: ['ASIG-01', 'ASIG-02', 'ASIG-03'],
      asignaturas_nombres: ['Ciencias Sociales (IHS: 3)', 'Ciencias Políticas y Económicas (IHS: 2)', 'Filosofía (IHS: 2)']
    },
    { 
      id: 'DOC-05', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543205', 
      nombres: 'Luis Eduardo', 
      apellidos: 'Cuellar', 
      correo: 'luis.cuellar@ietcaldas.edu.co', 
      telefono: '3118901205', 
      asignatura_id: 'ASIG-04',
      asignaturas_ids: ['ASIG-04', 'ASIG-05', 'ASIG-06'],
      asignaturas_nombres: ['Lengua Castellana (IHS: 4)', 'Cátedra de Emprendimiento (IHS: 1)', 'Salud Ocupacional (IHS: 1)']
    },
    { 
      id: 'DOC-06', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543206', 
      nombres: 'John Fredy', 
      apellidos: 'Díaz', 
      correo: 'john.diaz@ietcaldas.edu.co', 
      telefono: '3118901206', 
      asignatura_id: 'ASIG-07',
      asignaturas_ids: ['ASIG-07'],
      asignaturas_nombres: ['Matemáticas (IHS: 4)']
    },
    { 
      id: 'DOC-07', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543207', 
      nombres: 'Helvis', 
      apellidos: 'González Cutiva', 
      correo: 'helvis.gonzalez@ietcaldas.edu.co', 
      telefono: '3118901207', 
      asignatura_id: 'ASIG-08',
      asignaturas_ids: ['ASIG-08', 'ASIG-09'],
      asignaturas_nombres: ['Lógica de Programación (IHS: 3)', 'Mantenimiento de Computadores (IHS: 1)']
    },
    { 
      id: 'DOC-08', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543208', 
      nombres: 'Larissa Alejandra', 
      apellidos: 'González Rodríguez', 
      correo: 'larissa.gonzalez@ietcaldas.edu.co', 
      telefono: '3118901208', 
      asignatura_id: 'ASIG-10',
      asignaturas_ids: ['ASIG-10'],
      asignaturas_nombres: ['Inglés / Humanidades: Idioma Extranjero (IHS: 3)']
    },
    { 
      id: 'DOC-10', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543210', 
      nombres: 'Mercy Eloisa', 
      apellidos: 'Herrada Yara', 
      correo: 'mercy.herrada@ietcaldas.edu.co', 
      telefono: '3118901210', 
      asignatura_id: 'ASIG-11',
      asignaturas_ids: ['ASIG-11'],
      asignaturas_nombres: ['Química / Ciencias Naturales (IHS: 3)']
    },
    { 
      id: 'DOC-11', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543211', 
      nombres: 'Deisy Yaneth', 
      apellidos: 'Medina Murcia', 
      correo: 'deisy.medina@ietcaldas.edu.co', 
      telefono: '3118901211', 
      asignatura_id: 'ASIG-12',
      asignaturas_ids: ['ASIG-12'],
      asignaturas_nombres: ['Cátedra de Paz / Ciencias Sociales (IHS: 1)']
    },
    { 
      id: 'DOC-12', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543212', 
      nombres: 'Jhon Jairo', 
      apellidos: 'Molano Jiménez', 
      correo: 'jhon.molano@ietcaldas.edu.co', 
      telefono: '3118901212', 
      asignatura_id: 'ASIG-13',
      asignaturas_ids: ['ASIG-13'],
      asignaturas_nombres: ['Informática / Tecnología e Informática (IHS: 1)']
    },
    { 
      id: 'DOC-13', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543213', 
      nombres: 'Ruth Lucena', 
      apellidos: 'Oliveros Culma', 
      correo: 'ruth.oliveros@ietcaldas.edu.co', 
      telefono: '3118901213', 
      asignatura_id: 'ASIG-14',
      asignaturas_ids: ['ASIG-14'],
      asignaturas_nombres: ['Educación Artística (IHS: 1)']
    },
    { 
      id: 'DOC-15', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543215', 
      nombres: 'Ivan Andrés', 
      apellidos: 'Perdomo', 
      correo: 'ivan.perdomo@ietcaldas.edu.co', 
      telefono: '3118901215', 
      asignatura_id: 'ASIG-15',
      asignaturas_ids: ['ASIG-15'],
      asignaturas_nombres: ['Bases de Datos / Especialidad Técnica (IHS: 2)']
    },
    { 
      id: 'DOC-16', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543216', 
      nombres: 'Silenia', 
      apellidos: 'Rodríguez Matoma', 
      correo: 'silenia.rodriguez@ietcaldas.edu.co', 
      telefono: '3118901216', 
      asignatura_id: 'ASIG-16',
      asignaturas_ids: ['ASIG-16', 'ASIG-17'],
      asignaturas_nombres: ['Educación Ética y en Valores Humanos (IHS: 1)', 'Educación Religiosa (IHS: 1)']
    },
    { 
      id: 'DOC-17', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543217', 
      nombres: 'Juan Sebastián', 
      apellidos: 'Román Salazar', 
      correo: 'juan.roman@ietcaldas.edu.co', 
      telefono: '3118901217', 
      asignatura_id: 'ASIG-18',
      asignaturas_ids: ['ASIG-18'],
      asignaturas_nombres: ['Educación Física, Recreación y Deportes (IHS: 2)']
    },
    { 
      id: 'DOC-18', 
      tipo_doc_id: 'TD-02', 
      numero_doc: '1110543218', 
      nombres: 'José Edgar', 
      apellidos: 'Trilleras Trilleras', 
      correo: 'edgar.trilleras@ietcaldas.edu.co', 
      telefono: '3118901218', 
      asignatura_id: 'ASIG-19',
      asignaturas_ids: ['ASIG-19'],
      asignaturas_nombres: ['Física / Ciencias Naturales (IHS: 3)']
    }
  ],
  estudiantes: [
    {
      id: 'EST-101',
      codigo_estudiantil: '2026-CALDAS-001',
      tipo_doc_id: 'TD-01',
      numero_doc: '1110982301',
      nombres: 'Mateo',
      apellidos: 'Devia Tique',
      fecha_nacimiento: '2012-03-12',
      estrato: 1,
      genero: 'M',
      rh: 'O+',
      observacion_medica: 'Sin alergias ni restricciones',
      grado_id: 'GRA-06',
      grupo_id: 'GRP-01', // 6-1
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'María Elena Tique Capera',
      acudiente_telefono: '3124598021'
    },
    {
      id: 'EST-102',
      codigo_estudiantil: '2026-CALDAS-002',
      tipo_doc_id: 'TD-01',
      numero_doc: '1110982302',
      nombres: 'Luciana',
      apellidos: 'Capera Aroca',
      fecha_nacimiento: '2011-07-25',
      estrato: 1,
      genero: 'F',
      rh: 'A+',
      observacion_medica: 'Lentes formulados para lectura',
      grado_id: 'GRA-07',
      grupo_id: 'GRP-02', // 7-2
      sede_id: 'SEDE-01',
      eps_id: 'EPS-02',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-02',
      padre_id: 'PAD-02',
      foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'José Hilario Aroca Yate',
      acudiente_telefono: '3157890432'
    },
    {
      id: 'EST-103',
      codigo_estudiantil: '2026-CALDAS-003',
      tipo_doc_id: 'TD-01',
      numero_doc: '1110982303',
      nombres: 'Samuel David',
      apellidos: 'Guzmán Tique',
      fecha_nacimiento: '2010-11-08',
      estrato: 2,
      genero: 'M',
      rh: 'O-',
      observacion_medica: 'Tratamiento respiratorio leve',
      grado_id: 'GRA-08',
      grupo_id: 'GRP-03', // 8-3
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-02',
      acudiente_id: 'ACU-03',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'Esperanza Devia Guzman',
      acudiente_telefono: '3209876543'
    },

    // Secundaria & Media - Sede Principal Francisco José de Caldas
    {
      id: 'EST-201',
      codigo_estudiantil: '2026-CALDAS-004',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234561',
      nombres: 'Santiago',
      apellidos: 'Tique Capera',
      fecha_nacimiento: '2009-04-15',
      estrato: 1,
      genero: 'M',
      rh: 'O+',
      observacion_medica: 'Alergia leve a la penicilina',
      grado_id: 'GRA-10',
      grupo_id: 'GRP-01',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'María Elena Tique Capera',
      acudiente_telefono: '3124598021'
    },
    {
      id: 'EST-202',
      codigo_estudiantil: '2026-CALDAS-005',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234562',
      nombres: 'Valeria',
      apellidos: 'Aroca Devia',
      fecha_nacimiento: '2008-09-22',
      estrato: 1,
      genero: 'F',
      rh: 'A+',
      observacion_medica: 'Sin novedad médica',
      grado_id: 'GRA-11',
      grupo_id: 'GRP-02',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-02',
      arl_id: 'ARL-02',
      acudiente_id: 'ACU-02',
      padre_id: 'PAD-02',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'José Hilario Aroca Yate',
      acudiente_telefono: '3157890432'
    },
    {
      id: 'EST-203',
      codigo_estudiantil: '2026-CALDAS-006',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234563',
      nombres: 'Camilo Andrés',
      apellidos: 'Yate Devia',
      fecha_nacimiento: '2010-01-10',
      estrato: 2,
      genero: 'M',
      rh: 'O-',
      observacion_medica: 'Asma bronquial - Usa inhalador',
      grado_id: 'GRA-08',
      grupo_id: 'GRP-03',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-03',
      padre_id: 'PAD-01',
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'Esperanza Devia Guzman',
      acudiente_telefono: '3209876543'
    },
    {
      id: 'EST-204',
      codigo_estudiantil: '2026-CALDAS-007',
      tipo_doc_id: 'TD-01',
      numero_doc: '1098234564',
      nombres: 'Mariana',
      apellidos: 'Guzmán Tique',
      fecha_nacimiento: '2011-06-30',
      estrato: 1,
      genero: 'F',
      rh: 'B+',
      observacion_medica: 'Usa gafas formuladas',
      grado_id: 'GRA-06',
      grupo_id: 'GRP-02',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-03',
      arl_id: 'ARL-03',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-02',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      acudiente_nombre: 'María Elena Tique Capera',
      acudiente_telefono: '3124598021'
    }
  ],
  asistencias: [
    {
      id: 'ASI-001',
      estudiante_id: 'EST-201',
      docente_id: 'DOC-01',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '06:55 AM',
      hora_salida: '01:15 PM',
      estado: 'PRESENTE' as const,
      observacion: 'Ingreso a tiempo con uniforme completo',
      asignatura_id: 'ASIG-04'
    },
    {
      id: 'ASI-002',
      estudiante_id: 'EST-202',
      docente_id: 'DOC-06',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '07:18 AM',
      hora_salida: '01:15 PM',
      estado: 'TARDE' as const,
      observacion: 'Retardo por transporte intermunicipal',
      asignatura_id: 'ASIG-03'
    },
    {
      id: 'ASI-003',
      estudiante_id: 'EST-203',
      docente_id: 'DOC-02',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '07:00 AM',
      hora_salida: '',
      estado: 'EXCUSADO' as const,
      observacion: 'Presentó incapacidad médica por asma',
      asignatura_id: 'ASIG-06'
    },
    {
      id: 'ASI-004',
      estudiante_id: 'EST-101',
      docente_id: 'DOC-04',
      fecha: new Date().toISOString().split('T')[0],
      hora_ingreso: '07:02 AM',
      hora_salida: '12:30 PM',
      estado: 'PRESENTE' as const,
      observacion: 'Asistencia Sede Primaria María Auxiliadora',
      asignatura_id: 'ASIG-01'
    }
  ],
  usuarios: [
    // ROLES: ADMINISTRADOR (Rectoría / Coordinación)
    { 
      id: 'USR-ADM-01', 
      uid_firebase: 'uid-rector', 
      email: 'rector@ietcaldas.edu.co', 
      username: 'rector',
      password: 'admin123',
      rol: 'ADMIN' as const, 
      referencia_id: 'ADM-01', 
      nombre_display: 'Lic. Héctor Fabio - Rector',
      activo: true
    },
    { 
      id: 'USR-ADM-02', 
      uid_firebase: 'uid-coordinacion', 
      email: 'coordinacion@ietcaldas.edu.co', 
      username: 'coordinadora',
      password: 'admin123',
      rol: 'ADMIN' as const, 
      referencia_id: 'ADM-02', 
      nombre_display: 'Dra. Martha Patricia - Coordinadora',
      activo: true
    },
    { 
      id: 'USR-ADM-03', 
      uid_firebase: 'admin-softworker', 
      email: 'admin@softworker.co', 
      username: 'admin',
      password: 'admin123',
      rol: 'ADMIN' as const, 
      referencia_id: 'ADM-00', 
      nombre_display: 'Administrador General Softworker',
      activo: true
    },

    // ROLES: DOCENTES
    { 
      id: 'USR-DOC-01', 
      uid_firebase: 'uid-doc-01', 
      email: 'jamer.andrade@ietcaldas.edu.co', 
      username: '1110543201',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-01', 
      nombre_display: 'Prof. Jamer Andrade Vargas',
      activo: true
    },
    { 
      id: 'USR-DOC-05', 
      uid_firebase: 'uid-doc-05', 
      email: 'luis.cuellar@ietcaldas.edu.co', 
      username: '1110543205',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-05', 
      nombre_display: 'Prof. Luis Eduardo Cuellar',
      activo: true
    },
    { 
      id: 'USR-DOC-06', 
      uid_firebase: 'uid-doc-06', 
      email: 'john.diaz@ietcaldas.edu.co', 
      username: '1110543206',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-06', 
      nombre_display: 'Prof. John Fredy Díaz',
      activo: true
    },
    { 
      id: 'USR-DOC-07', 
      uid_firebase: 'uid-doc-07', 
      email: 'helvis.gonzalez@ietcaldas.edu.co', 
      username: '1110543207',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-07', 
      nombre_display: 'Prof. Helvis González Cutiva',
      activo: true
    },
    { 
      id: 'USR-DOC-08', 
      uid_firebase: 'uid-doc-08', 
      email: 'larissa.gonzalez@ietcaldas.edu.co', 
      username: '1110543208',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-08', 
      nombre_display: 'Prof. Larissa Alejandra González',
      activo: true
    },
    { 
      id: 'USR-DOC-10', 
      uid_firebase: 'uid-doc-10', 
      email: 'mercy.herrada@ietcaldas.edu.co', 
      username: '1110543210',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-10', 
      nombre_display: 'Prof. Mercy Eloisa Herrada',
      activo: true
    },
    { 
      id: 'USR-DOC-11', 
      uid_firebase: 'uid-doc-11', 
      email: 'deisy.medina@ietcaldas.edu.co', 
      username: '1110543211',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-11', 
      nombre_display: 'Prof. Deisy Yaneth Medina',
      activo: true
    },
    { 
      id: 'USR-DOC-12', 
      uid_firebase: 'uid-doc-12', 
      email: 'jhon.molano@ietcaldas.edu.co', 
      username: '1110543212',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-12', 
      nombre_display: 'Prof. Jhon Jairo Molano',
      activo: true
    },
    { 
      id: 'USR-DOC-13', 
      uid_firebase: 'uid-doc-13', 
      email: 'ruth.oliveros@ietcaldas.edu.co', 
      username: '1110543213',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-13', 
      nombre_display: 'Prof. Ruth Lucena Oliveros',
      activo: true
    },
    { 
      id: 'USR-DOC-15', 
      uid_firebase: 'uid-doc-15', 
      email: 'ivan.perdomo@ietcaldas.edu.co', 
      username: '1110543215',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-15', 
      nombre_display: 'Prof. Ivan Andrés Perdomo',
      activo: true
    },
    { 
      id: 'USR-DOC-16', 
      uid_firebase: 'uid-doc-16', 
      email: 'silenia.rodriguez@ietcaldas.edu.co', 
      username: '1110543216',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-16', 
      nombre_display: 'Prof. Silenia Rodríguez Matoma',
      activo: true
    },
    { 
      id: 'USR-DOC-17', 
      uid_firebase: 'uid-doc-17', 
      email: 'juan.roman@ietcaldas.edu.co', 
      username: '1110543217',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-17', 
      nombre_display: 'Prof. Juan Sebastián Román',
      activo: true
    },
    { 
      id: 'USR-DOC-18', 
      uid_firebase: 'uid-doc-18', 
      email: 'edgar.trilleras@ietcaldas.edu.co', 
      username: '1110543218',
      password: 'docente123',
      rol: 'DOCENTE' as const, 
      referencia_id: 'DOC-18', 
      nombre_display: 'Prof. José Edgar Trilleras',
      activo: true
    },

    // ROLES: ACUDIENTES
    { 
      id: 'USR-ACU-01', 
      uid_firebase: 'uid-acu-01', 
      email: 'maria.tique@gmail.com', 
      username: '28549302',
      password: 'acudiente123',
      rol: 'ACUDIENTE' as const, 
      referencia_id: 'ACU-01', 
      nombre_display: 'María Elena Tique Capera (Acudiente)',
      activo: true
    },
    { 
      id: 'USR-ACU-02', 
      uid_firebase: 'uid-acu-02', 
      email: 'jose.aroca@hotmail.com', 
      username: '14289033',
      password: 'acudiente123',
      rol: 'ACUDIENTE' as const, 
      referencia_id: 'ACU-02', 
      nombre_display: 'José Hilario Aroca Yate (Acudiente)',
      activo: true
    },
    { 
      id: 'USR-ACU-03', 
      uid_firebase: 'uid-acu-03', 
      email: 'esperanza.devia@outlook.com', 
      username: '65890123',
      password: 'acudiente123',
      rol: 'ACUDIENTE' as const, 
      referencia_id: 'ACU-03', 
      nombre_display: 'Esperanza Devia Guzman (Acudiente)',
      activo: true
    },

    // ROLES: ESTUDIANTES
    { 
      id: 'USR-EST-201', 
      uid_firebase: 'uid-est-201', 
      email: 'breiner.gonzalez@estudiante.caldas.edu.co', 
      username: '2026-CALDAS-010',
      password: '1098234561',
      rol: 'ESTUDIANTE' as const, 
      referencia_id: 'EST-201', 
      nombre_display: 'Breiner Smith González Devia',
      activo: true
    },
    { 
      id: 'USR-EST-202', 
      uid_firebase: 'uid-est-202', 
      email: 'valentina.aroca@estudiante.caldas.edu.co', 
      username: '2026-CALDAS-011',
      password: '1098234562',
      rol: 'ESTUDIANTE' as const, 
      referencia_id: 'EST-202', 
      nombre_display: 'Valentina Aroca Tique',
      activo: true
    },
    { 
      id: 'USR-EST-101', 
      uid_firebase: 'uid-est-101', 
      email: 'mateo.devia@estudiante.caldas.edu.co', 
      username: '2026-CALDAS-001',
      password: '1110982301',
      rol: 'ESTUDIANTE' as const, 
      referencia_id: 'EST-101', 
      nombre_display: 'Mateo Devia Tique',
      activo: true
    },
    { 
      id: 'USR-EST-102', 
      uid_firebase: 'uid-est-102', 
      email: 'luciana.capera@estudiante.caldas.edu.co', 
      username: '2026-CALDAS-002',
      password: '1110982302',
      rol: 'ESTUDIANTE' as const, 
      referencia_id: 'EST-102', 
      nombre_display: 'Luciana Capera Aroca',
      activo: true
    }
  ],
  excusas: [
    {
      id: 'EXC-001',
      estudiante_id: 'EST-203',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      motivo: 'Cita médica de control respiratorio en Centro de Salud Natagaima',
      estado: 'APROBADA' as const,
      creado_el: new Date().toISOString(),
      archivo_nombre: 'incapacidad_medica_camilo.pdf'
    }
  ],
  pases_salida: [
    {
      id: 'PASE-7801',
      estudiante_id: 'EST-201',
      estudiante_nombre: 'Breiner Smith González Devia',
      estudiante_documento: '1098234561',
      grado_nombre: '11° Grado - Media Técnica',
      grupo_nombre: '01',
      fecha: new Date().toISOString().split('T')[0],
      hora_autorizada: '11:30 AM',
      hora_salida_efectiva: '11:35 AM',
      motivo: 'Cita médica odontológica programada en Hospital San Antonio',
      categoria_motivo: 'CITA_MEDICA' as const,
      autorizado_por: 'Lic. Héctor Fabio (Rector)',
      persona_retira: 'María Elena Tique Capera',
      documento_retira: '28549302',
      telefono_contacto: '3124598021',
      parentesco_retira: 'Madre / Acudiente',
      estado: 'SALIDA_EFECTUADA' as const,
      observaciones: 'Presentó orden médica digital emitida por Asmet Salud',
      codigo_seguridad: 'SEC-9921',
      creado_el: new Date().toISOString()
    },
    {
      id: 'PASE-7802',
      estudiante_id: 'EST-202',
      estudiante_nombre: 'Valentina Aroca Tique',
      estudiante_documento: '1098234562',
      grado_nombre: '10° Grado - Media Técnica',
      grupo_nombre: '01',
      fecha: new Date().toISOString().split('T')[0],
      hora_autorizada: '12:00 PM',
      motivo: 'Retiro solicitado por acudiente por diligencia notarial familiar',
      categoria_motivo: 'RETIRO_ACUDIENTE' as const,
      autorizado_por: 'Dra. Martha Patricia (Coordinación)',
      persona_retira: 'José Hilario Aroca Yate',
      documento_retira: '14289033',
      telefono_contacto: '3157890432',
      parentesco_retira: 'Padre',
      estado: 'AUTORIZADO' as const,
      observaciones: 'Firma de documentos y salida autorizada en portería principal',
      codigo_seguridad: 'SEC-4418',
      creado_el: new Date().toISOString()
    }
  ],
  registros_pae: [
    {
      id: 'PAE-1001',
      estudiante_id: 'EST-201',
      estudiante_nombre: 'Breiner Smith González Devia',
      estudiante_documento: '1098234561',
      grado_nombre: '11° Grado - Media Técnica',
      grupo_nombre: '01',
      fecha: new Date().toISOString().split('T')[0],
      hora: '07:10 AM',
      tipo_servicio: 'DESAYUNO' as const,
      operador_entrega: 'Operador PAE Sede Principal',
      observacion: 'Ración industrializada entregada a tiempo'
    },
    {
      id: 'PAE-1002',
      estudiante_id: 'EST-202',
      estudiante_nombre: 'Valentina Aroca Tique',
      estudiante_documento: '1098234562',
      grado_nombre: '10° Grado - Media Técnica',
      grupo_nombre: '01',
      fecha: new Date().toISOString().split('T')[0],
      hora: '07:15 AM',
      tipo_servicio: 'DESAYUNO' as const,
      operador_entrega: 'Operador PAE Sede Principal',
      observacion: 'Ración completa verificada'
    },
    {
      id: 'PAE-1003',
      estudiante_id: 'EST-101',
      estudiante_nombre: 'Juan José Tique Devia',
      estudiante_documento: '1110982301',
      grado_nombre: '1° Grado - Primaria',
      grupo_nombre: '01',
      fecha: new Date().toISOString().split('T')[0],
      hora: '11:45 AM',
      tipo_servicio: 'ALMUERZO' as const,
      operador_entrega: 'Comedor Sede María Auxiliadora',
      observacion: 'Almuerzo caliente balanceado'
    }
  ],
  anotaciones_observador: [
    {
      id: 'OBS-001',
      estudiante_id: 'EST-201',
      estudiante_nombre: 'Breiner Smith González Devia',
      estudiante_documento: '1098234561',
      grado_nombre: '11° Grado - Media Técnica',
      grupo_nombre: '01',
      docente_id: 'DOC-01',
      docente_nombre: 'Prof. Jamer Andrade Vargas',
      fecha: new Date().toISOString().split('T')[0],
      hora: '08:30 AM',
      tipo: 'RECONOCIMIENTO' as const,
      titulo: 'Felicitación por Liderazgo y Desarrollo de Software Escolar',
      descripcion: 'El estudiante demostró un desempeño excepcional y proactividad en el laboratorio de desarrollo web, liderando la arquitectura del proyecto técnico y colaborando con sus compañeros.',
      descargos_estudiante: 'Agradezco el apoyo del profesor y me comprometo a continuar fortaleciendo mis habilidades de programación.',
      compromisos_estudiante: 'Continuar como monitor del área de sistemas y apoyar a los compañeros de grados inferiores.',
      compromisos_acudiente: 'Seguir apoyando al estudiante en sus actividades pedagógicas técnicas.',
      estado_firma: 'FIRMADO' as const,
      firmado_por: 'María Elena Tique Capera (Acudiente)',
      fecha_firma: new Date().toISOString().split('T')[0],
      creado_el: new Date().toISOString()
    },
    {
      id: 'OBS-002',
      estudiante_id: 'EST-202',
      estudiante_nombre: 'Valentina Aroca Tique',
      estudiante_documento: '1098234562',
      grado_nombre: '10° Grado - Media Técnica',
      grupo_nombre: '01',
      docente_id: 'DOC-06',
      docente_nombre: 'Prof. John Fredy Díaz',
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:40 AM',
      tipo: 'TIPO_I' as const,
      titulo: 'Uso de dispositivo celular durante explicación magistral de Química',
      descripcion: 'La estudiante hizo uso reiterado del celular sin fines pedagógicos durante la sesión de laboratorio, interrumpiendo momentáneamente el orden de la clase.',
      descargos_estudiante: 'Acepto la llamada de atención y reconozco que debía mantener el celular guardado en la maleta.',
      compromisos_estudiante: 'Mantener el teléfono celular apagado o en la maleta durante todas las sesiones de clase.',
      compromisos_acudiente: 'Dialogar en el hogar sobre las normas del manual de convivencia institucional.',
      estado_firma: 'PENDIENTE' as const,
      creado_el: new Date().toISOString()
    }
  ]
};

// LocalStorage Persistent Store Backup for instant client operation
const STORAGE_KEY = 'SOFTWORKER_CALDAS_DB_V8';

export function getLocalStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      // Guarantee new tables exist if from earlier version
      if (!parsed.pases_salida) parsed.pases_salida = INITIAL_SEED_DATA.pases_salida;
      if (!parsed.registros_pae) parsed.registros_pae = INITIAL_SEED_DATA.registros_pae;
      if (!parsed.anotaciones_observador) parsed.anotaciones_observador = INITIAL_SEED_DATA.anotaciones_observador;
      return parsed;
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
