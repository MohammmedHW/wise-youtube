// AppContext.js
import React, { createContext, useState } from 'react';

// Create Context
export const AppContext = createContext();

// Create Provider Component
export const AppProvider = ({ children }) => {
  const [checkTrialFirstTime, setCheckTrialFirstTime] = useState(null);
  return (
    <AppContext.Provider value={{ checkTrialFirstTime, setCheckTrialFirstTime }}>
      {children}
    </AppContext.Provider>
  );
};