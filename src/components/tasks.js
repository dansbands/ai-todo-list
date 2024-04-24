import React, { useState } from "react";
import Task from "./task";
import { v4 as uuid } from "uuid";

const exampleTasks = [
  {
    title: "Take out trash",
    dueDate: "11/25/24",
    completed: false,
    order: 1,
    id: uuid(),
  },
  {
    title: "Clean air conditioner filters",
    dueDate: "11/20/24",
    completed: false,
    order: 2,
    id: uuid(),
  },
  {
    title: "Change oil in car",
    dueDate: "11/27/24",
    completed: false,
    order: 3,
    id: uuid(),
  },
];

const Tasks = () => {
  const [allTasks, setAllTasks] = useState([...exampleTasks]);
  const [inputValue, setInputValue] = useState("");

  const checkForSubmit = (e) => {
    if (e.key === "Enter") return handleSubmit(e);
  };

  const handleSubmit = () => {
    const newTask = {
      title: inputValue,
      dueDate: "11/20/24",
      completed: false,
      order: allTasks.length + 1,
      id: uuid(),
    };

    setAllTasks((prevState) => [...prevState, newTask]);
    setInputValue("");
  };

  const toggleCompleted = (id) => {
    const newTasks = [...allTasks];
    const foundItm = newTasks.find((task) => task.id === id);
    foundItm.completed = !foundItm.completed;

    setAllTasks(newTasks);
  };

  const sortByCompleted = (a, b) => {
    if (a.completed === b.completed) return 0;
    if (a.completed) return 1;
    return -1;
  };

  return (
    <>
      <div className="task-list">Tasks</div>
      <div className="task-form">
        <input
          name="task-name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={checkForSubmit}
        />
        <button type="submit" onClick={handleSubmit}>
          Add Task
        </button>
      </div>

      <div className="task-list">
        {allTasks
          .sort((a, b) => sortByCompleted(a, b))
          .map((taskData) => {
            return <Task data={taskData} toggleCompleted={toggleCompleted} />;
          })}
      </div>
    </>
  );
};

export default Tasks;
