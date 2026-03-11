import React, { useState } from "react";
import { getStoredValue } from "../util/fetch";

export const AuthContext = React.createContext(null);
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
