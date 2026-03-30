import { useEffect, useState } from "react";
import Header from "./header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const STYLE_MODES = [
  { id: "classic", label: "Classic" },
  { id: "calm", label: "Calm Pro" },
  { id: "vibrant", label: "Vibrant" },
];

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(true);
  const [styleMode, setStyleMode] = useState("classic");
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

  useEffect(() => {
    const rootElement = document.body;
    rootElement.classList.remove("style-classic", "style-calm", "style-vibrant");
    rootElement.classList.add(`style-${styleMode}`);
  }, [styleMode]);

  return (
    <div className="App">
      <Header isLight={isLight} />
      <div className="App-divider" />
      <div className="App-body">{children}</div>

      <div className="style-switcher" role="group" aria-label="Visual style options">
        {STYLE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`style-switcher-button ${styleMode === mode.id ? "active" : ""}`}
            onClick={() => setStyleMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <button className="color-mode-switch" onClick={switchColorMode}>
        <FontAwesomeIcon icon={modeIcon} />
      </button>
    </div>
  );
};

export default Layout;
