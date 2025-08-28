import { createContext } from 'react';
import { TopUpContextType } from './TopUpContext.types';

export const TopUpContext = createContext<TopUpContextType | undefined>(undefined);
