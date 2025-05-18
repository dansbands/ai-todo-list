import { useEffect, useState } from "react";
import Header from "./header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(true);
  const modeIcon = isLight ? faSun : faMoon;
  
  const getCurrentTheme = () =>
    window.matchMedia("(prefers-color-scheme: light)");

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
