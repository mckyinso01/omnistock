import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      checkAuthState();
    } catch (err) {
      console.error("AuthContext checkAuthState exception:", err);
      setIsLoadingAuth(false);
    }
  }, []);

  const checkAuthState = () => {
    const token = sessionStorage.getItem('omnistock_auth_token') || sessionStorage.getItem('stockmate_auth_token');
    const storedEmail = sessionStorage.getItem('omnistock_user_email') || sessionStorage.getItem('stockmate_user_email') || 'operator@omnistock.io';

    if (token) {
      setUser({
        name: "OmniStock Operator",
        email: storedEmail,
        role: "admin"
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoadingAuth(false);
  };

  const login = (email) => {
    const userEmail = email || 'operator@omnistock.io';
    sessionStorage.setItem('omnistock_auth_token', 'mock_omnistock_token_2026');
    sessionStorage.setItem('stockmate_auth_token', 'mock_omnistock_token_2026');
    sessionStorage.setItem('omnistock_user_email', userEmail);
    setUser({
      name: "OmniStock Operator",
      email: userEmail,
      role: "admin"
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('omnistock_auth_token');
    sessionStorage.removeItem('stockmate_auth_token');
    sessionStorage.removeItem('omnistock_user_email');
    sessionStorage.removeItem('stockmate_user_email');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      login,
      logout,
      checkAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
