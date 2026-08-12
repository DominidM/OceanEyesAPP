import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { firestore } from './app';
import type { Municipality } from './types';

const COLLECTION = 'municipalities';

export async function createMunicipalityApplication(input: {
  name: string;
  province: string;
  region: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  ownerUid: string;
}): Promise<string> {
  const ref = doc(firestore, COLLECTION, input.ownerUid);
  await setDoc(ref, {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMunicipalityByOwner(ownerUid: string): Promise<Municipality | null> {
  try {
    const directSnapshot = await getDoc(doc(firestore, COLLECTION, ownerUid));
    if (directSnapshot.exists()) {
      return { id: directSnapshot.id, ...directSnapshot.data() } as Municipality;
    }
  } catch {
    // Los registros anteriores usaban un ID automático; se consultan abajo.
  }
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION), where('ownerUid', '==', ownerUid), limit(1)),
  );
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Municipality;
}

export function subscribeMunicipalityByOwner(
  ownerUid: string,
  callback: (municipality: Municipality | null) => void,
): Unsubscribe {
  let unsubscribeLegacy: Unsubscribe | undefined;
  const directQuery = query(
    collection(firestore, COLLECTION),
    where(documentId(), '==', ownerUid),
    where('ownerUid', '==', ownerUid),
    limit(1),
  );
  const unsubscribeDirect = onSnapshot(
    directQuery,
    (snapshot) => {
      unsubscribeLegacy?.();
      unsubscribeLegacy = undefined;
      const directDoc = snapshot.docs[0];
      if (directDoc) {
        callback({ id: directDoc.id, ...directDoc.data() } as Municipality);
        return;
      }
      const legacyQuery = query(
        collection(firestore, COLLECTION),
        where('ownerUid', '==', ownerUid),
        limit(1),
      );
      unsubscribeLegacy = onSnapshot(
        legacyQuery,
        (legacySnapshot) => {
          const legacyDoc = legacySnapshot.docs[0];
          callback(legacyDoc ? ({ id: legacyDoc.id, ...legacyDoc.data() } as Municipality) : null);
        },
        (err) => console.warn('[municipalities] subscribeMunicipalityByOwner legacy:', err),
      );
    },
    (err) => console.warn('[municipalities] subscribeMunicipalityByOwner:', err),
  );
  return () => {
    unsubscribeDirect();
    unsubscribeLegacy?.();
  };
}

export function subscribeAllMunicipalities(
  callback: (municipalities: Municipality[]) => void,
): Unsubscribe {
  const q = query(collection(firestore, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Municipality)));
    },
    (err) => console.warn('[municipalities] subscribeAllMunicipalities:', err),
  );
}

export async function approveMunicipality(municipalityId: string, adminUid: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'active',
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectMunicipality(
  municipalityId: string,
  adminUid: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'rejected',
    approvedBy: adminUid,
    rejectedReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function reactivateMunicipality(municipalityId: string, adminUid: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'active',
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getMunicipality(uid: string): Promise<Municipality | null> {
  const snapshot = await getDoc(doc(firestore, COLLECTION, uid));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Municipality) : null;
}

export async function updateMunicipality(
  municipalityId: string,
  changes: Partial<Pick<Municipality, 'address' | 'phone' | 'contactEmail' | 'bounds'>>,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}
