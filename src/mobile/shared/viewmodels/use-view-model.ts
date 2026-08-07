import { useEffect, useRef, useSyncExternalStore } from 'react';

import type { ViewModelState, ViewModel } from './view-model';

type StateOf<TVM> = TVM extends ViewModel<infer S, any> ? S : never;
type DepsOf<TVM> = TVM extends ViewModel<ViewModelState, infer D> ? D : never;

export function useViewModel<TVM extends ViewModel<ViewModelState, any>>(
  create: (deps: DepsOf<TVM>) => TVM,
  deps: DepsOf<TVM>,
): [TVM, StateOf<TVM>] {
  const vmRef = useRef<TVM | null>(null);
  if (vmRef.current === null) {
    vmRef.current = create(deps);
  }
  const vm = vmRef.current;

  // Mantiene las deps al día en cada render (patrón "latest ref").
  vm.bind(deps);

  const state = useSyncExternalStore<StateOf<TVM>>(
    vm.subscribe,
    vm.getState as () => StateOf<TVM>,
    vm.getState as () => StateOf<TVM>,
  );

  useEffect(() => {
    vm.sync();
  });

  useEffect(() => () => vm.dispose(), [vm]);

  return [vm, state];
}
