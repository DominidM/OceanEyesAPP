import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase/app';

const SEED_REWARDS = [
  {
    title: 'Bono de combustible',
    description: 'Vale de S/ 50 para gasolina en grifos autorizados.',
    pointsCost: 200,
    stock: 20,
    active: true,
    sponsor: 'OceanEyes',
  },
  {
    title: 'Red de pesca ecológica',
    description: 'Red de pesca certificada que no daña el ecosistema marino.',
    pointsCost: 500,
    stock: 10,
    active: true,
    sponsor: 'Pesca Sostenible Perú',
  },
  {
    title: 'Kit de limpieza costera',
    description: 'Guantes, bolsas biodegradables y chaleco reflectante.',
    pointsCost: 150,
    stock: 30,
    active: true,
    sponsor: 'OceanEyes',
  },
  {
    title: 'Curso de pesca responsable',
    description: 'Certificación en técnicas de pesca sostenible (online).',
    pointsCost: 300,
    stock: null,
    active: true,
    sponsor: 'ONG MarLimpio',
  },
  {
    title: 'Boyas inteligentes',
    description: 'Par de boyas con GPS para monitorear zonas de pesca.',
    pointsCost: 1000,
    stock: 5,
    active: true,
    sponsor: 'OceanEyes',
  },
];

export async function seedRewards() {
  for (const reward of SEED_REWARDS) {
    await addDoc(collection(firestore, 'rewards'), {
      ...reward,
      createdAt: serverTimestamp(),
    });
  }
}
