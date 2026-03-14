import type { FC } from 'react';
import { Header } from './components/Header';
import { PICalculator } from './components/PICalculator';
import { GlobalLoadingProvider } from './components/GlobalLoading';

const App: FC = () => (
  <GlobalLoadingProvider>
    <div className="min-h-screen bg-gray-900">
      <Header />
      <PICalculator />
    </div>
  </GlobalLoadingProvider>
);

export { App };
