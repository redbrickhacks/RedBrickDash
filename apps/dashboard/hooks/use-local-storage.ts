import { useState, useEffect, useCallback } from 'react';

/**
 * SSR-safe localStorage hook with namespaced keys.
 * Values are persisted under 'hibiscus:{key}' in localStorage.
 *
 * Note: Initial render uses defaultValue to avoid hydration mismatches.
 * localStorage value is applied after mount via useEffect.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const namespacedKey = `hibiscus:${key}`;

  // Always initialize with default value to avoid SSR hydration mismatch
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(namespacedKey);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${namespacedKey}":`, error);
    }
    setIsHydrated(true);
  }, [namespacedKey]);

  // Persist to localStorage when value changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(namespacedKey, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${namespacedKey}":`, error);
    }
  }, [namespacedKey, value, isHydrated]);

  // Stable setter using functional updates
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, setStoredValue];
}

export default useLocalStorage;
