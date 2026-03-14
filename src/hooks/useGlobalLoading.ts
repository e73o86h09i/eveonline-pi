import { useContext } from 'react';
import { type GlobalLoadingContextValue, GlobalLoadingContext } from '../components/GlobalLoading';

export const useGlobalLoading = (): GlobalLoadingContextValue => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }

  return ctx;
};
