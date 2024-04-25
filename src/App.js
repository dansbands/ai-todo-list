import "./App.css";
import Tasks from "./components/tasks";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-title">A.I. To-Do List</div>
      </header>
      <div className="App-body">
        <Tasks />
      </div>
    </div>
  );
}

export default App;
