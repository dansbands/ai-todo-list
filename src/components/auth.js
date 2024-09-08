import React, { useState } from "react";

export const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user"));

  const signIn = (newUser, callback) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", JSON.stringify(newUser.token));
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
