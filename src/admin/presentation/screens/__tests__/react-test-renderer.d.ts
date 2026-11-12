// Tipos mínimos de react-test-renderer para las pruebas (el paquete no trae tipos propios y
// no se agrega @types/react-test-renderer solo para esto).
declare module 'react-test-renderer' {
  import type { ReactElement } from 'react';

  export interface ReactTestInstance {
    type: unknown;
    props: Record<string, any>;
    parent: ReactTestInstance | null;
    findAll(predicate: (node: ReactTestInstance) => boolean): ReactTestInstance[];
    findAllByType(type: unknown): ReactTestInstance[];
  }

  export interface ReactTestRenderer {
    root: ReactTestInstance;
    unmount(): void;
  }

  export function act(callback: () => void): void;
  export function act(callback: () => Promise<void>): Promise<void>;

  const renderer: { create(element: ReactElement): ReactTestRenderer };
  export default renderer;
}
