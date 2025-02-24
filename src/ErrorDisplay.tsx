import React from 'react';
import { useError } from './ErrorContext';

const ErrorDisplay: React.FC = () => {
  const { error } = useError();

  if (!error) return null;

  return (
    <div className='error-boundary'>
      {error}
    </div>
  );
};

export default ErrorDisplay;