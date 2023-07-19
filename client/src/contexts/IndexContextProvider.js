import React from 'react';
import { AuthContextProvider } from './AuthContext';
import { ContextProvider } from './ContextProvider';

export function IndexContextProvider({ children }) {
  return (
    <AuthContextProvider>
      <ContextProvider>{children}</ContextProvider>
    </AuthContextProvider>
  );
}
