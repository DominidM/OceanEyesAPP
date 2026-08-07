export type ViewModelState = Record<string, unknown>;

export abstract class ViewModel<TState extends ViewModelState = ViewModelState, TDeps = undefined> {
  protected deps: TDeps;
  protected state: TState;
  private listeners = new Set<() => void>();

  constructor(initial: TState, deps: TDeps) {
    this.state = initial;
    this.deps = deps;
  }

  getState = (): TState => this.state;

  protected setState(patch: Partial<TState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  bind(deps: TDeps): void {
    this.deps = deps;
  }

  sync(): void {
    /* hook para que los ViewModels sincronicen deps con el estado sin setState en render */
  }

  dispose(): void {
    this.listeners.clear();
  }
}
