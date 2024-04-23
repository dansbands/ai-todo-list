import "./App.css";
import Chat from "./components/chat";
import Tasks from "./components/tasks";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>I'm a React App</div>
        <Tasks />
        <Chat />
      </header>
    </div>
  );
}

export default App;
