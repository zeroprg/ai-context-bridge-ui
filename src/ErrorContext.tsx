import React, { createContext, useContext, useState } from 'react';
import { setCookie } from './auth';

interface ErrorProviderProps {
  children: React.ReactNode;
}

interface ErrorContextProps {
  error: string | null;
  handleError: (errorMessage: string, errorObject?: any) => void;
}

const ErrorContext = createContext<ErrorContextProps>({ error: null, handleError: () => {} });

export const useError = () => useContext(ErrorContext);

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
    const handleError = (errorMessage: string, errorObject?: any) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 10000);

    if (errorObject && isConnectionError(errorObject)) {
      setCookie('sessionId', '', -1);
    }
  };

  const isConnectionError = (errorObject: any) => {
    return errorObject.code === 'ERR_NETWORK' || errorObject.code === 'CORS_ERROR';
  };

  return (
    <ErrorContext.Provider value={{ error, handleError }}>
      {children}
    </ErrorContext.Provider>
  );
};
