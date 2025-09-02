import { useContext } from 'react';
import { TopUpContext } from '../context/TopUpContext';
import { TopUpContextType } from '../context/TopUpContext.types';

export const useTopUp = (): TopUpContextType => {
  const context = useContext(TopUpContext);
  if (!context) {
    throw new Error('useTopUp must be used within a TopUpProvider');
  }
  return context;
};
