export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_LENGTH_MESSAGE = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;

export function isPasswordLongEnough(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
