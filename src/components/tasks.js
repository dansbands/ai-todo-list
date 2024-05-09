import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Task from "./task";
import { completeTodo, deleteTodo, getTodos, postTodo } from "../util/fetch";
import loadingGif from '../img/loading.gif';

const Tasks = () => {
  const [pageLoadingState, setPageLoadingState] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);

  useEffect(() => {
    setPageLoadingState("loading");
    getTodos().then((todos) => {
      if (todos.length !== allTasks.length) setAllTasks(todos);
      setPageLoadingState("complete");
    });
  }, [allTasks]);

  const handleInputChange = (val) => {
    if (inputError) setInputError(false);
    setInputValue(val);
  };

  const checkForSubmit = (e) => {
    if (e.key === "Enter") return handleSubmit(e);
  };

  const handleSubmit = () => {
    const newTask = {
      title: inputValue,
      completed: false,
    };

    if (inputValue) {
      postTodo(newTask, allTasks, setAllTasks);
      setAllTasks((prevState) => [newTask, ...prevState]);
      setInputValue("");
    } else {
      setInputError(true);
    }
  };

  const toggleCompleted = (id) => {
    const newTasks = [...allTasks];
    const foundItm = newTasks.find((task) => task._id === id);
    foundItm.completed = !foundItm.completed;
    completeTodo(foundItm, allTasks, setAllTasks);

    setAllTasks(newTasks);
  };

  const sortByCompleted = (a, b) => {
    if (a.completed === b.completed) return 0;
    if (a.completed) return 1;
    return -1;
  };

  return (
    <>
      {(pageLoadingState && pageLoadingState === "loading") ? (
        <div className="loading-indicator">
          <img src={loadingGif} alt="loading-image" />
        </div>
      ) : (
        <>
          <div className="task-form">
            <div className="task-form-left">
              <input
                name="task-name"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
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
                const { _id } = taskData;
                return (
                  <Task
                    key={_id}
                    data={taskData}
                    toggleCompleted={toggleCompleted}
                    deleteTodo={() => deleteTodo(_id, allTasks, setAllTasks)}
                  />
                );
              })}
          </div>
        </>
      )}
    </>
  );
};

export default Tasks;
