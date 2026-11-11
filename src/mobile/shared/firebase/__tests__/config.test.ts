import { firebaseConfig, isFirebaseConfigured } from '../config';

describe('firebase config (sin env)', () => {
  it('isFirebaseConfigured es false sin variables de entorno', () => {
    expect(isFirebaseConfigured()).toBe(false);
  });

  it('firebaseConfig expone todas las claves esperadas', () => {
    expect(firebaseConfig).toHaveProperty('apiKey');
    expect(firebaseConfig).toHaveProperty('projectId');
    expect(firebaseConfig).toHaveProperty('appId');
  });
});