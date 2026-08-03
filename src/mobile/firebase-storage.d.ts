declare module 'firebase/storage' {
  export function getStorage(...args: unknown[]): unknown;
  export function ref(...args: unknown[]): unknown;
  export function uploadBytes(...args: unknown[]): Promise<unknown>;
  export function getDownloadURL(...args: unknown[]): Promise<string>;
}
