import React, { useState } from "react";
import Task from "./task";
import { v4 as uuid } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

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
  const [inputError, setInputError] = useState(true);

  const handleChange = (val) => {
    if (inputError) setInputError(false);
    setInputValue(val);
  };

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

    if (inputValue) {
      setAllTasks((prevState) => [...prevState, newTask]);
      setInputValue("");
    } else {
      setInputError(true);
    }
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
      <div className="task-form">
        <div className="task-form-left">
          <input
            name="task-name"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyUp={checkForSubmit}
          />
          {inputError && (
            <div className="task-input-error">
              Please enter a task name in the input field above.
            </div>
          )}
        </div>
        <div className="task-form-right">
          <button type="submit" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      <div className="task-list">
        {allTasks
          .sort((a, b) => sortByCompleted(a, b))
          .map((taskData) => {
            return (
              <Task
                key={taskData.id}
                data={taskData}
                toggleCompleted={toggleCompleted}
              />
            );
          })}
      </div>
    </>
  );
};

export default Tasks;
