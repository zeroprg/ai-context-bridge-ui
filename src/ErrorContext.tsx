import React, { createContext, useContext, useState, ReactNode } from 'react';

type ErrorContextType = {
  error: string | null;
  setError: (error: string | null) => void;
};

const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
});

type ErrorProviderProps = {
  children: ReactNode;
};

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
