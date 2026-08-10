// Exports de uso del lado del cliente (landing).
export type { RolSugerido, RolStep, RolUserData } from './types';
export { emptyRolUserData } from './types';
export { MASCOT_IMAGES, MASCOT_NAME, ROLES, rolPorId } from './roles';
export type { Rol } from './roles';
export { ROL_STEPS } from './steps';
export { getMockRecommendation } from './mock-rol';
export { fetchRolRecommendation, fetchRolReply } from './client';
export { sendRolEmail } from './email';
export type { RolEmailStatus } from './email';
