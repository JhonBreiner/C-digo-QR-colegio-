/**
 * Softworker & Institución Educativa Técnica Francisco José de Caldas (Natagaima)
 * Arquitectura Backend Firebase - Inicializador y Cargador de Datos de Prueba (Seeders)
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc,
  writeBatch 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase para Softworker / I.E.T. Francisco José de Caldas
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyNatagaimaSoftworker2026",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "softworker-caldas.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "softworker-caldas",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "softworker-caldas.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "665199825759",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:665199825759:web:softworker2026"
};

// Inicialización de servicios
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Datos Iniciales (Seeders) para las 15 colecciones de la I.E.T. Francisco José de Caldas
 */
export const SEED_DATA_COLLECTIONS = {
  tipos_documento: [
    { id: 'TD-01', sigla: 'TI', nombre: 'Tarjeta de Identidad' },
    { id: 'TD-02', sigla: 'CC', nombre: 'Cédula de Ciudadanía' },
    { id: 'TD-03', sigla: 'CE', nombre: 'Cédula de Extranjería' }
  ],
  eps: [
    { id: 'EPS-01', nombre_eps: 'Asmet Salud EPS' },
    { id: 'EPS-02', nombre_eps: 'Nueva EPS' },
    { id: 'EPS-03', nombre_eps: 'Coosalud' },
    { id: 'EPS-04', nombre_eps: 'Salud Total' }
  ],
  arl: [
    { id: 'ARL-01', nombre_arl: 'Positiva ARL' },
    { id: 'ARL-02', nombre_arl: 'Sura ARL' },
    { id: 'ARL-03', nombre_arl: 'AXA Colpatria' }
  ],
  sedes: [
    { id: 'SEDE-01', nombre_sede: 'Sede Principal Francisco José de Caldas', direccion: 'Cra 5 N° 7-12 Natagaima' },
    { id: 'SEDE-02', nombre_sede: 'Sede Primaria San Antonio', direccion: 'Barrio San Antonio Natagaima' },
    { id: 'SEDE-03', nombre_sede: 'Sede Rural Paso Ancho', direccion: 'Vereda Paso Ancho Natagaima' }
  ],
  grados: [
    { id: 'GRA-06', nombre_grado: '6° Grado' },
    { id: 'GRA-07', nombre_grado: '7° Grado' },
    { id: 'GRA-08', nombre_grado: '8° Grado' },
    { id: 'GRA-09', nombre_grado: '9° Grado' },
    { id: 'GRA-10', nombre_grado: '10° Grado (Técnico)' },
    { id: 'GRA-11', nombre_grado: '11° Grado (Técnico)' }
  ],
  grupos: [
    { id: 'GRP-61', nombre_grupo: '6-01' },
    { id: 'GRP-71', nombre_grupo: '7-01' },
    { id: 'GRP-81', nombre_grupo: '8-01' },
    { id: 'GRP-91', nombre_grupo: '9-01' },
    { id: 'GRP-101', nombre_grupo: '10-01' },
    { id: 'GRP-111', nombre_grupo: '11-01' }
  ],
  departamentos: [
    { id: 'DEP-73', nombre_departamento: 'Tolima' },
    { id: 'DEP-41', nombre_departamento: 'Huila' }
  ],
  ciudades: [
    { id: 'CIU-01', nombre_ciudad: 'Natagaima', departamento_id: 'DEP-73' },
    { id: 'CIU-02', nombre_ciudad: 'Purificación', departamento_id: 'DEP-73' },
    { id: 'CIU-03', nombre_ciudad: 'Neiva', departamento_id: 'DEP-41' }
  ],
  asignaturas: [
    { id: 'ASIG-01', nombre_asignatura: 'Sistemas y Programación' },
    { id: 'ASIG-02', nombre_asignatura: 'Matemáticas' },
    { id: 'ASIG-03', nombre_asignatura: 'Español y Literatura' },
    { id: 'ASIG-04', nombre_asignatura: 'Ciencias Naturales' }
  ],
  acudientes: [
    { id: 'ACU-01', tipo_doc_id: 'TD-02', numero_doc: '28549302', nombres: 'María Elena', apellidos: 'Tique Capera', telefono: '3124598021', correo: 'maria.tique@gmail.com', direccion: 'Calle 4 # 8-22 Natagaima' }
  ],
  padres_familia: [
    { id: 'PAD-01', tipo_doc_id: 'TD-02', numero_doc: '93120443', nombres: 'Pedro Nel', apellidos: 'Tique Gonzalez', telefono: '3105678901', correo: 'pedro.tique@gmail.com' }
  ],
  docentes: [
    { id: 'DOC-01', tipo_doc_id: 'TD-02', numero_doc: '1110543210', nombres: 'Carlos Mario', apellidos: 'Mendoza Ruiz', correo: 'carlos.mendoza@ietcaldas.edu.co', telefono: '3118901234', asignatura_id: 'ASIG-01' }
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
      observacion_medica: 'Alergia leve',
      grado_id: 'GRA-10',
      grupo_id: 'GRP-101',
      sede_id: 'SEDE-01',
      eps_id: 'EPS-01',
      arl_id: 'ARL-01',
      acudiente_id: 'ACU-01',
      padre_id: 'PAD-01'
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
      estado: 'PRESENTE',
      observacion: 'Asistencia registrada con éxito'
    }
  ],
  usuarios: [
    { id: 'USR-01', uid_firebase: 'admin-softworker', email: 'admin@softworker.co', rol: 'ADMIN', referencia_id: 'ADM-01' },
    { id: 'USR-02', uid_firebase: 'docente-carlos', email: 'carlos.mendoza@ietcaldas.edu.co', rol: 'DOCENTE', referencia_id: 'DOC-01' }
  ]
};

/**
 * Función para sembrar/cargar datos iniciales en Cloud Firestore
 */
export async function seedFirestoreDatabase() {
  try {
    const batch = writeBatch(db);
    console.log("Iniciando carga de datos en Firestore...");
    
    for (const [colName, items] of Object.entries(SEED_DATA_COLLECTIONS)) {
      for (const item of items) {
        const itemRef = doc(db, colName, item.id);
        batch.set(itemRef, item, { merge: true });
      }
    }
    
    await batch.commit();
    console.log("¡Carga masiva de datos en Firestore completada exitosamente!");
    return { success: true, message: "Base de datos Firestore sembrada con éxito" };
  } catch (error) {
    console.error("Error al sembrar Firestore:", error);
    return { success: false, error };
  }
}
