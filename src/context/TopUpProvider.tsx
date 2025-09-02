import { useState, useMemo } from 'react';
import { TopUpContext } from './TopUpContext';
import { TopUpProviderProps } from './TopUpContext.types';

export const TopUpProvider = ({ children }: TopUpProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const value = useMemo(
    () => ({ isModalOpen, openModal, closeModal }),
    [isModalOpen]
  );

  return (
    <TopUpContext.Provider value={value}>{children}</TopUpContext.Provider>
  );
};
