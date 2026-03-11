import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Task from "../components/task";
import {
  completeTodo,
  deleteTodo,
  getUserTodos,
  postTodo,
  updateTodo,
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
    let isActive = true;

    if (!auth.user?._id) {
      setAllTasks([]);
      setPageLoadingState("complete");
      return () => {
        isActive = false;
      };
    }

    const loadTodos = async () => {
      setPageLoadingState("loading");

      try {
        const todos = await getUserTodos();

        if (!isActive) {
          return;
        }

        setAllTasks(todos);
        setPageLoadingState("complete");
      } catch (error) {
        console.error("Error loading todos:", error);

        if (!isActive) {
          return;
        }

        setAllTasks([]);
        setPageLoadingState("error");
      }
    };

    loadTodos();

    return () => {
      isActive = false;
    };
  }, [auth.user?._id]);

  const handleSubmit = async () => {
    const trimmedTaskName = inputValue.taskName?.trim();
    const newTask = {
      title: trimmedTaskName,
      completed: false,
    };

    if (trimmedTaskName) {
      try {
        const createdTodo = await postTodo(newTask);
        setAllTasks((prevState) => [createdTodo, ...prevState]);
        setInputValue({ taskName: "" });
        setInputError({ taskName: false });
      } catch (error) {
        console.error("Error creating todo:", error);
      }
    } else {
      setInputError({ taskName: true });
    }
  };

  const toggleCompleted = async (id) => {
    const foundItm = allTasks.find((task) => task._id === id);
    if (!foundItm) {
      return;
    }

    try {
      const updatedTodo = await completeTodo({
        _id: foundItm._id,
        completed: !foundItm.completed,
      });

      setAllTasks((prevState) =>
        prevState.map((task) => (task._id === id ? updatedTodo : task))
      );
    } catch (error) {
      console.error("Error updating todo completion:", error);
    }
  };

  const sortByCompleted = (a, b) => {
    if (a.completed === b.completed) return 0;
    if (a.completed) return 1;
    return -1;
  };

  const handleDelete = async (taskId) => {
    try {
      const result = await deleteTodo(taskId);
      setAllTasks((prevState) =>
        prevState.filter((task) => task._id !== result.deletedId)
      );
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const updateTaskTitle = async (taskId, newTitle) => {
    const taskToUpdate = allTasks.find((task) => task._id === taskId);
    if (!taskToUpdate) {
      return;
    }

    try {
      const updatedTodo = await updateTodo({
        _id: taskToUpdate._id,
        title: newTitle,
        completed: taskToUpdate.completed,
      });

      setAllTasks((prevState) =>
        prevState.map((task) => (task._id === taskId ? updatedTodo : task))
      );
    } catch (error) {
      console.error("Error updating todo title:", error);
    }
  };

  return (
    <>
      {pageLoadingState && pageLoadingState === "loading" ? (
        <div className="loading-indicator">
          <img src={loadingGif} alt="loader" />
        </div>
      ) : pageLoadingState === "error" ? (
        <div className="loading-indicator">
          <div>Unable to load tasks.</div>
        </div>
      ) : (
        <>
          <div className="task-form">
            <div className="task-form-left">
              <Input
                name="taskName"
                title="Task Name"
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
            {[...allTasks]
              .sort((a, b) => sortByCompleted(a, b))
              .map((taskData) => {
                const { _id } = taskData;
                return (
                  <Task
                    key={_id}
                    data={taskData}
                    toggleCompleted={toggleCompleted}
                    deleteTodo={() => handleDelete(_id)}
                    updateTaskTitle={updateTaskTitle}
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
