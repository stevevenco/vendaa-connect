export interface TopUpContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export interface TopUpProviderProps {
  children: React.ReactNode;
}
