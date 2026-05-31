import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ErrorContext = createContext(null);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = useCallback((message) => {
    setError(message || "Something went wrong");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(() => {
    return {
      error,
      setError,
      showError,
      clearError,
    };
  }, [error, showError, clearError]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error("useError must be used inside ErrorProvider");
  }

  return context;
};