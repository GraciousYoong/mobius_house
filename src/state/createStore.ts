import { useSyncExternalStore } from 'react';

/**
 * Minimal external store. Lets the 3D scene publish values (such as the
 * camera pose) that DOM components read, without coupling the two trees.
 */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const getState = () => state;
  const setState = (next: Partial<T>) => {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useStore<S>(selector: (s: T) => S): S {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  return { getState, setState, subscribe, useStore };
}
