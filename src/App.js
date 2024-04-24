import "./App.css";
import Chat from "./components/chat";
import Tasks from "./components/tasks";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>I'm a React App</div>
      </header>
      <div className="App-body">
        <Tasks />
        <Chat />
      </div>
    </div>
  );
}

export default App;
