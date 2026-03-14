import { useCallback, useState } from 'react';

const PREFIX = 'eve-pi-calc';

const buildKey = (key: string): string => `${PREFIX}:${key}`;

const readFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(buildKey(key));
    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
};

const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(buildKey(key));
  } catch {
    // silently ignore
  }
};

const useLocalStorage = <T>(key: string, fallback: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => readFromStorage(key, fallback));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        writeToStorage(key, next);

        return next;
      });
    },
    [key],
  );

  return [state, setValue];
};

export { useLocalStorage, readFromStorage, writeToStorage, removeFromStorage };
