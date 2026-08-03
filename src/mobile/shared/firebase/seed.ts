import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/app';
import { registerUser } from '../firebase/auth';
import type { ReportCategory } from '../firebase/types';

/* ── Recompensas ── */

const SEED_REWARDS = [
  { title: 'Bono de combustible', description: 'Vale de S/ 50 para gasolina en grifos autorizados.', pointsCost: 200, stock: 20, active: true, sponsor: 'OceanEyes' },
  { title: 'Red de pesca ecológica', description: 'Red de pesca certificada que no daña el ecosistema marino.', pointsCost: 500, stock: 10, active: true, sponsor: 'Pesca Sostenible Perú' },
  { title: 'Kit de limpieza costera', description: 'Guantes, bolsas biodegradables y chaleco reflectante.', pointsCost: 150, stock: 30, active: true, sponsor: 'OceanEyes' },
  { title: 'Curso de pesca responsable', description: 'Certificación en técnicas de pesca sostenible (online).', pointsCost: 300, stock: null, active: true, sponsor: 'ONG MarLimpio' },
  { title: 'Boyas inteligentes', description: 'Par de boyas con GPS para monitorear zonas de pesca.', pointsCost: 1000, stock: 5, active: true, sponsor: 'OceanEyes' },
];

export async function seedRewards() {
  for (const reward of SEED_REWARDS) {
    await addDoc(collection(firestore, 'rewards'), {
      ...reward,
      createdAt: serverTimestamp(),
    });
  }
}

/* ── Admin + datos de prueba ── */

const TEST_REPORTS: { title: string; category: ReportCategory; description: string }[] = [
  { title: 'Red de enmalle frente a Punta Brava', category: 'pesca_ilegal', description: 'Embarcación no identificada usando redes de arrastre en zona restringida a 2 km de la costa.' },
  { title: 'Vertido industrial en estero Norte', category: 'basura_marina', description: 'Tubería descargando líquido oscuro con olor a combustible en el estero. Afecta manglares cercanos.' },
  { title: 'Arrastre cerca de arrecife', category: 'pesca_ilegal', description: 'Dos embarcaciones pequeñas con redes de arrastre a menos de 100 m del arrecife de coral protegido.' },
  { title: 'Basura plástica en playa Los Delfines', category: 'basura_marina', description: 'Gran acumulación de botellas plásticas y redes abandonadas en 200 m de orilla. Peligro para fauna.' },
  { title: 'Corriente anómala zona de pesca', category: 'variacion_mar', description: 'Cambio repentino en temperatura del agua. De 22°C a 28°C en menos de 2 horas. Peces desapareciendo.' },
  { title: 'Pesca con explosivos Punta Sal', category: 'pesca_ilegal', description: 'Se escucharon 3 detonaciones. Peces muertos flotando en área de 50 m. Testigos vieron embarcación huir.' },
  { title: 'Residuos de pesca en muelle central', category: 'basura_marina', description: 'Restos de pescado, vísceras y redes rotas acumuladas en el muelle. Mal olor y presencia de aves carroñeras.' },
  { title: 'Marea roja frente a caleta', category: 'variacion_mar', description: 'Mancha rojiza de aproximadamente 300 m de diámetro. Agua con olor fuerte. Peces muertos en la orilla.' },
];

export async function seedAdminAndTestData(adminEmail: string, adminPassword: string) {
  // 1. Crear admin
  let adminUid: string;
  try {
    const user = await registerUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'Administrador',
      profileType: 'citizen',
    });
    adminUid = user.uid;
    await updateDoc(doc(firestore, 'users', adminUid), { role: 'admin' });
  } catch {
    throw new Error('El admin ya existe o hubo un error al crearlo. ¿Ya ejecutaste el seed antes?');
  }

  // 2. Crear reportes de prueba con diferentes estados
  const statuses: Array<'pendiente' | 'en_revision' | 'verificado' | 'descartado'> = [
    'pendiente', 'en_revision', 'verificado', 'pendiente', 'pendiente', 'verificado', 'descartado', 'pendiente',
  ];

  for (let i = 0; i < TEST_REPORTS.length; i++) {
    const report = TEST_REPORTS[i];
    const status = statuses[i];
    const pastDate = new Date(Date.now() - (TEST_REPORTS.length - i) * 3600000); // cada uno 1h antes

    await addDoc(collection(firestore, 'reports'), {
      userId: adminUid,
      category: report.category,
      title: report.title,
      description: report.description,
      isAnonymous: false,
      location: { latitude: -12.0464 + Math.random() * 0.1, longitude: -77.0428 + Math.random() * 0.1, address: 'Costa peruana' },
      photoURLs: [],
      status,
      pointsAwarded: status === 'verificado' ? 100 : 0,
      createdAt: pastDate,
      submittedAt: pastDate,
      reviewedAt: status !== 'pendiente' ? new Date() : null,
      reviewedBy: status !== 'pendiente' ? adminUid : null,
    });
  }

  return adminUid;
}
