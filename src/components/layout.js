import { useEffect, useState } from "react";
import Header from "./header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { AUTH_EXPIRED_EVENT } from "../util/fetch";

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(true);
  const modeIcon = isLight ? faSun : faMoon;
  const navigate = useNavigate();
  const auth = useAuth();
  
  const getCurrentTheme = () =>
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: light)")
      : { matches: true };

  const switchColorMode = () => {
    setIsLight((prevState) => !prevState);
    const rootElement = document.body;
    rootElement.classList.toggle("dark-mode");
  };

  useEffect(() => {
    const isThemeLight = getCurrentTheme().matches;
    setIsLight(isThemeLight);
  }, []);

  useEffect(() => {
    const rootElement = document.body;
    if (isLight) {
      rootElement.classList.remove("dark-mode");
    } else {
      rootElement.classList.add("dark-mode");
    }
  }, [isLight]);

  useEffect(() => {
    const handleAuthExpired = () => {
      auth.signOut(() => navigate("/sign-in", { replace: true }));
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [auth, navigate]);

  return (
    <div className="App">
      <Header isLight={isLight} />
      <div className="App-divider" />
      <div className="App-body">{children}</div>
      <button className="color-mode-switch" onClick={switchColorMode}>
        <FontAwesomeIcon icon={modeIcon} />
      </button>
    </div>
  );
};

export default Layout;
