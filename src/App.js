import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";
import Tasks from "./components/tasks";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function App() {
  const [isLight, setIsLight] = useState(true);
  const modeIcon = isLight ? faSun : faMoon;

  const switchColorMode = () => {
    setIsLight(prevState => !prevState);
    const rootElement = document.body;
    console.log('rootElement', rootElement)
    rootElement.classList.toggle("dark-mode")
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-title">A.I. To-Do List</div>
        <div className="App-subtitle">powered by ChatGPT</div>
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
