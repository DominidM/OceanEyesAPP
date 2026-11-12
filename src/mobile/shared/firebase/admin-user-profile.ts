import type { ProfileType } from './types';

/**
 * Tipos de cuenta que el panel puede crear. Los admins NO se crean desde el panel: se
 * asignan solo desde la consola de Firebase. Las reglas solo permiten que una cuenta cree su
 * propio perfil con role 'user' o 'municipal'.
 */
export type AdminAccountType = 'citizen' | 'fisher' | 'municipal';
export type AdminCreatableRole = 'user' | 'municipal';

export const ADMIN_ACCOUNT_TYPES: Record<
  AdminAccountType,
  { label: string; role: AdminCreatableRole; profileType: ProfileType }
> = {
  citizen: { label: 'Ciudadano', role: 'user', profileType: 'citizen' },
  fisher: { label: 'Pescador', role: 'user', profileType: 'fisher' },
  municipal: { label: 'Municipal', role: 'municipal', profileType: 'citizen' },
};

export type AdminCreatedUserInput = {
  email: string;
  displayName: string;
  accountType: AdminAccountType;
  dni?: string;
};

/**
 * Perfil que createUserByAdmin escribe en users/{uid}. Sin dependencias de Firebase para que
 * las pruebas de reglas en el emulador validen exactamente este documento; `timestamp` es el
 * serverTimestamp() del SDK que escribe.
 */
export function buildAdminCreatedProfile(input: AdminCreatedUserInput, timestamp: unknown) {
  const { role, profileType } = ADMIN_ACCOUNT_TYPES[input.accountType];
  return {
    role,
    profileType,
    displayName: input.displayName,
    email: input.email,
    dni: input.dni ?? null,
    pointsBalance: 0,
    totalPointsEarned: 0,
    verifiedReportsCount: 0,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
