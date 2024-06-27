import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Task from "../components/task";
import {
  completeTodo,
  deleteTodo,
  getUserTodos,
  postTodo,
} from "../util/fetch";
import loadingGif from "../img/loading.gif";
import Input from "./input";
import { useAuth } from "../components/auth";

const Tasks = () => {
  const [pageLoadingState, setPageLoadingState] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [inputValue, setInputValue] = useState({ taskName: "" });
  const [inputError, setInputError] = useState({ taskName: false });
  const auth = useAuth();

  useEffect(() => {
    setPageLoadingState("loading");
    getUserTodos(auth.user._id).then((todos) => {
      if (todos.length !== allTasks.length) setAllTasks(todos);
      setPageLoadingState("complete");
    });
  }, [allTasks]);

  const handleSubmit = () => {
    const newTask = {
      title: inputValue.taskName,
      completed: false,
      userId: auth.user._id,
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
      {pageLoadingState && pageLoadingState === "loading" ? (
        <div className="loading-indicator">
          <img src={loadingGif} alt="loader" />
        </div>
      ) : (
        <>
          <div className="task-form">
            <div className="task-form-left">
              <Input
                name="taskName"
                inputValue={inputValue?.taskName}
                inputError={inputError?.taskName}
                setInputValue={setInputValue}
                setInputError={setInputError}
                handleSubmit={handleSubmit}
              />
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
