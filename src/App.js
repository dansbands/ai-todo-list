import "./App.css";
import Tasks from "./components/tasks";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>I'm a React App</div>
      </header>
      <div className="App-body">
        <Tasks />
      </div>
    </div>
  );
}

export default App;
