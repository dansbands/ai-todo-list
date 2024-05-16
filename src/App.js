import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";
import Tasks from "./components/tasks";
import {
  faMoon,
  faRightToBracket,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function App() {
  const [isLight, setIsLight] = useState(true);
  const modeIcon = isLight ? faSun : faMoon;
  let loggedIn = false; // replace with Auth, route "Log In" to /login screen

  const switchColorMode = () => {
    setIsLight((prevState) => !prevState);
    const rootElement = document.body;
    rootElement.classList.toggle("dark-mode");
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-main">
          <div className="App-title-container">
            <div className="App-title">A.I. To-Do List</div>
            <div className="App-subtitle">powered by ChatGPT</div>
          </div>
        </div>
        <div className="App-header-right">
          {loggedIn ? (
            <div className="App-user">
              <FontAwesomeIcon icon={faUser} />
              User Name
            </div>
          ) : (
            <a className="App-login" href="/">
              <FontAwesomeIcon icon={faRightToBracket} />
              Log In
            </a>
          )}
        </div>
      </header>
      <div className="App-divider" />
      <div className="App-body">
        <Tasks />
      </div>
      <button className="color-mode-switch" onClick={switchColorMode}>
        <FontAwesomeIcon icon={modeIcon} />
      </button>
    </div>
  );
}

export default App;
