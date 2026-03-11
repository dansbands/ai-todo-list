import React, { useState } from "react";

export const AuthContext = React.createContext(null);

const getStoredValue = (key) => {
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    return storedValue;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredValue("user"));

  const signIn = (newUser, callback) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newUser.token);
    callback();
  };

  const signOut = (callback) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    callback();
  };

  const value = { user, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};

export default AuthProvider;
