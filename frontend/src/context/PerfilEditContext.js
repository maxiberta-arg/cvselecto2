import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

const PerfilEditContext = createContext();

export function PerfilEditProvider({ children }) {
  const [editMode, setEditModeRaw] = useState(() => {
    const stored = sessionStorage.getItem('perfilEditMode');
    console.log('INIT editMode from sessionStorage:', stored);
    return stored === 'true';
  });

  // Actualiza sessionStorage cada vez que cambia editMode
  useEffect(() => {
    sessionStorage.setItem('perfilEditMode', editMode);
    console.log('SET editMode in sessionStorage:', editMode);
  }, [editMode]);

  // Setter que actualiza el estado y sessionStorage
  const setEditMode = (value) => {
    setEditModeRaw(value);
    sessionStorage.setItem('perfilEditMode', value);
    console.log('CALL setEditMode:', value);
  };
  return (
    <PerfilEditContext.Provider value={{ editMode, setEditMode }}>
      {children}
    </PerfilEditContext.Provider>
  );
}

export function usePerfilEdit() {
  return useContext(PerfilEditContext);
}
