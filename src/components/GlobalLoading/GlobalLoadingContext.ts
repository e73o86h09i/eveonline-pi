import { createContext } from 'react';

type GlobalLoadingContextValue = {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

export { type GlobalLoadingContextValue, GlobalLoadingContext };
