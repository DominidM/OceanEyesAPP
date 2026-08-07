import { useEffect, useRef, useSyncExternalStore } from 'react';

import type { ViewModelState, ViewModel } from './view-model';

export function useViewModel<TState extends ViewModelState, TDeps, TVM extends ViewModel<TState, TDeps>>(
  create: (deps: TDeps) => TVM,
  deps: TDeps,
): TVM {
  const vmRef = useRef<TVM | null>(null);
  if (vmRef.current === null) {
    vmRef.current = create(deps);
  }
  const vm = vmRef.current;

  // Mantiene las deps al día en cada render (patrón "latest ref").
  vm.bind(deps);

  useSyncExternalStore(vm.subscribe, vm.getState, vm.getState);

  useEffect(() => {
    vm.sync();
  });

  useEffect(() => () => vm.dispose(), [vm]);

  return vm;
}
