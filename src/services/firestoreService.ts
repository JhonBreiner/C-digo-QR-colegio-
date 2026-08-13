import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  TipoDocumento,
  EPS,
  ARL,
  Sede,
  Grado,
  Grupo,
  Departamento,
  Ciudad,
  Asignatura,
  Acudiente,
  PadreFamilia,
  Docente,
  Estudiante,
  Asistencia,
  ExcusaMedica,
  Usuario,
  EstadoAsistencia
} from '../types';

// Generic CRUD helper
export async function getCollectionData<T>(colName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, colName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error al obtener ${colName}:`, error);
    return [];
  }
}

export function subscribeCollectionData<T>(colName: string, callback: (data: T[]) => void) {
  const q = query(collection(db, colName));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(list);
  }, (error) => {
    console.error(`Error en suscripción de ${colName}:`, error);
  });
}

export async function createDocument<T extends object>(colName: string, data: T, customId?: string): Promise<string> {
  if (customId) {
    const docRef = doc(db, colName, customId);
    await setDoc(docRef, { ...data, id: customId });
    return customId;
  } else {
    const docRef = await addDoc(collection(db, colName), data);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  }
}

export async function updateDocument<T extends object>(colName: string, id: string, data: Partial<T>): Promise<void> {
  const docRef = doc(db, colName, id);
  await updateDoc(docRef, data as any);
}

export async function deleteDocument(colName: string, id: string): Promise<void> {
  const docRef = doc(db, colName, id);
  await deleteDoc(docRef);
}

// Escáner y Control de Asistencia Específico
export async function registrarAsistenciaQR(
  codigoEstudiantilOrDoc: string,
  docenteId?: string,
  gradoId?: string,
  grupoId?: string,
  asignaturaId?: string
): Promise<{
  success: boolean;
  estudiante?: Estudiante;
  asistencia?: Asistencia;
  mensaje: string;
  estado?: EstadoAsistencia;
}> {
  try {
    // Buscar estudiante por código estudiantil o por número de documento
    const qCod = query(collection(db, 'estudiantes'), where('codigo_estudiantil', '==', codigoEstudiantilOrDoc.trim()));
    let snap = await getDocs(qCod);

    if (snap.empty) {
      const qDoc = query(collection(db, 'estudiantes'), where('numero_doc', '==', codigoEstudiantilOrDoc.trim()));
      snap = await getDocs(qDoc);
    }

    if (snap.empty) {
      return {
        success: false,
        mensaje: `No se encontró ningún estudiante registrado con el código/documento: "${codigoEstudiantilOrDoc}"`
      };
    }

    const estDoc = snap.docs[0];
    const estudiante = { id: estDoc.id, ...estDoc.data() } as Estudiante;

    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActualStr = ahora.toTimeString().split(' ')[0]; // HH:mm:ss
    const horasDecimal = ahora.getHours() + ahora.getMinutes() / 60;

    // Calcular estado: Si llega después de las 7:10 AM -> TARDE, de lo contrario PRESENTE
    // Umbral predeterminado de ingreso matutino: 7:10 AM
    let estado: EstadoAsistencia = 'PRESENTE';
    if (horasDecimal > 7.16) { // ~7:10 AM
      estado = 'TARDE';
    }

    // Verificar si ya tiene registro de asistencia hoy
    const qExistente = query(
      collection(db, 'asistencias'),
      where('estudiante_id', '==', estudiante.id),
      where('fecha', '==', fechaHoy)
    );
    const snapExistente = await getDocs(qExistente);

    if (!snapExistente.empty) {
      const docExistente = snapExistente.docs[0];
      const asistExistente = { id: docExistente.id, ...docExistente.data() } as Asistencia;
      
      // Actualizar observacion o marcar salida si aplica
      await updateDoc(doc(db, 'asistencias', asistExistente.id!), {
        hora_salida: horaActualStr,
        observacion: `Re-escaneado a las ${horaActualStr}`
      });

      return {
        success: true,
        estudiante,
        asistencia: { ...asistExistente, hora_salida: horaActualStr },
        mensaje: `¡Asistencia de ${estudiante.nombres} ${estudiante.apellidos} ya registrada para hoy! (Hora salida actualizada)`,
        estado: asistExistente.estado
      };
    }

    // Crear registro nuevo
    const nuevaAsistencia: Asistencia = {
      estudiante_id: estudiante.id!,
      docente_id: docenteId || '',
      fecha: fechaHoy,
      hora_ingreso: horaActualStr,
      estado: estado,
      observacion: estado === 'TARDE' ? 'Ingreso registrado con retardo' : 'Ingreso registrado con código QR',
      grado_id: gradoId || estudiante.grado_id,
      grupo_id: grupoId || estudiante.grupo_id,
      asignatura_id: asignaturaId || '',
      metodo_registro: 'QR',
      creado_en: serverTimestamp()
    };

    const newDocRef = await addDoc(collection(db, 'asistencias'), nuevaAsistencia);
    nuevaAsistencia.id = newDocRef.id;

    return {
      success: true,
      estudiante,
      asistencia: nuevaAsistencia,
      mensaje: `Asistencia de ${estudiante.nombres} ${estudiante.apellidos} registrada correctamente como [${estado}].`,
      estado
    };
  } catch (error: any) {
    console.error('Error al registrar asistencia QR:', error);
    return {
      success: false,
      mensaje: `Error al procesar lectura QR: ${error.message}`
    };
  }
}

// Obtener reporte enriquecido de asistencias
export async function getReporteAsistencias(filtros: {
  fechaInicio?: string;
  fechaFin?: string;
  gradoId?: string;
  grupoId?: string;
  estudianteId?: string;
  estado?: string;
}) {
  try {
    const snapAsistencia = await getDocs(collection(db, 'asistencias'));
    let asistencias = snapAsistencia.docs.map(d => ({ id: d.id, ...d.data() } as Asistencia));

    // Filtrar localmente para mayor flexibilidad
    if (filtros.fechaInicio) {
      asistencias = asistencias.filter(a => a.fecha >= filtros.fechaInicio!);
    }
    if (filtros.fechaFin) {
      asistencias = asistencias.filter(a => a.fecha <= filtros.fechaFin!);
    }
    if (filtros.gradoId) {
      asistencias = asistencias.filter(a => a.grado_id === filtros.gradoId);
    }
    if (filtros.grupoId) {
      asistencias = asistencias.filter(a => a.grupo_id === filtros.grupoId);
    }
    if (filtros.estudianteId) {
      asistencias = asistencias.filter(a => a.estudiante_id === filtros.estudianteId);
    }
    if (filtros.estado && filtros.estado !== 'TODOS') {
      asistencias = asistencias.filter(a => a.estado === filtros.estado);
    }

    // Cargar mapas de metadatos para resolver nombres
    const [estudiantes, grados, grupos, asignaturas] = await Promise.all([
      getCollectionData<Estudiante>('estudiantes'),
      getCollectionData<Grado>('grados'),
      getCollectionData<Grupo>('grupos'),
      getCollectionData<Asignatura>('asignaturas')
    ]);

    const estMap = new Map(estudiantes.map(e => [e.id, e]));
    const gradoMap = new Map(grados.map(g => [g.id, g.nombre_grado]));
    const grupoMap = new Map(grupos.map(g => [g.id, g.nombre_grupo]));
    const asigMap = new Map(asignaturas.map(a => [a.id, a.nombre_asignatura]));

    return asistencias.map(a => {
      const est = estMap.get(a.estudiante_id);
      return {
        ...a,
        codigo_estudiantil: est?.codigo_estudiantil || 'N/A',
        estudiante_nombre: est ? `${est.nombres} ${est.apellidos}` : 'Estudiante no registrado',
        numero_doc: est?.numero_doc || 'N/A',
        nombre_grado: gradoMap.get(a.grado_id || est?.grado_id || '') || 'Sin grado',
        nombre_grupo: grupoMap.get(a.grupo_id || est?.grupo_id || '') || 'Sin grupo',
        nombre_asignatura: asigMap.get(a.asignatura_id || '') || 'General'
      };
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return [];
  }
}
