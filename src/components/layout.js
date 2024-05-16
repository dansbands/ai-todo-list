import { useState } from "react";
import Header from "./header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const Layout = ({ children }) => {
  const [isLight, setIsLight] = useState(true);
  const modeIcon = isLight ? faSun : faMoon;

  const switchColorMode = () => {
    setIsLight((prevState) => !prevState);
    const rootElement = document.body;
    rootElement.classList.toggle("dark-mode");
  };

  return (
    <div className="App">
      <Header />
      <div className="App-divider" />
      <div className="App-body">{children}</div>
      <button className="color-mode-switch" onClick={switchColorMode}>
        <FontAwesomeIcon icon={modeIcon} />
      </button>
    </div>
  );
};

export default Layout;
