import type { FC } from 'react';
import { Header } from './components/Header';
import { PICalculator } from './components/PICalculator';

const App: FC = () => (
  <div className="min-h-screen bg-gray-900">
    <Header />
    <PICalculator />
  </div>
);

export { App };
