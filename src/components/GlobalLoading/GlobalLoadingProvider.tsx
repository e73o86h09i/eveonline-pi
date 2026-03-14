import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { GlobalLoadingContext } from './GlobalLoadingContext';

const GlobalLoadingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const counterRef = useRef(0);

  const startLoading = useCallback(() => {
    counterRef.current++;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ loading, startLoading, stopLoading }), [loading, startLoading, stopLoading]);

  return <GlobalLoadingContext value={value}>{children}</GlobalLoadingContext>;
};

export { GlobalLoadingProvider };
