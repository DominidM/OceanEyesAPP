import { getUserProfile, logout } from '@/shared/firebase/auth';

export type PanelRoute = '/admin' | '/admin/municipio';

export const ACCESS_DENIED_MESSAGE = 'Acceso denegado. Esta cuenta no tiene permisos de administrador.';

/**
 * Verificación común a correo/contraseña y Google: solo los roles 'admin' y 'municipal'
 * entran al panel. Nunca crea perfiles: una cuenta sin perfil o con otro rol se rechaza y se
 * cierra su sesión. Si no se puede leer el perfil también se cierra la sesión.
 */
export async function resolvePanelRoute(uid: string): Promise<PanelRoute | null> {
  let role: string | undefined;
  try {
    role = (await getUserProfile(uid))?.role;
  } catch (error) {
    await logout().catch(() => undefined);
    throw error;
  }
  if (role === 'admin') return '/admin';
  if (role === 'municipal') return '/admin/municipio';
  await logout();
  return null;
}

/** Mensajes en español para los errores del popup de Google; null si se ignora en silencio. */
export function googleLoginErrorMessage(error: unknown): string | null {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google antes de terminar. Vuelve a intentarlo.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio y vuelve a intentarlo.';
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado para iniciar sesión con Google.';
    default:
      return code || (error as Error | null)?.message || String(error);
  }
}
