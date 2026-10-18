import { useEffect, useState } from 'react';

/**
 * useState that remembers its value in localStorage, so viewer preferences
 * (minimap size, panel positions) survive a reload. Falls back to plain state
 * when storage is unavailable (private mode, blocked site data).
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: keep the value for this visit only.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
