import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Task from "../components/task";
import {
  completeTodo,
  deleteTodo,
  getRequestErrorMessage,
  getUserTodos,
  postTodo,
  updateTodo,
} from "../util/fetch";
import loadingGif from "../img/loading.gif";
import Input from "./input";
import { useAuth } from "../components/auth";
import GuestUpgradeModal from "../components/guest-upgrade-modal";

const Tasks = () => {
  const [pageLoadingState, setPageLoadingState] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [inputValue, setInputValue] = useState({ taskName: "" });
  const [inputError, setInputError] = useState({ taskName: false });
  const [taskMutationError, setTaskMutationError] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isGuestUpgradeOpen, setGuestUpgradeOpen] = useState(false);
  const [guestUpgradeMessage, setGuestUpgradeMessage] = useState("");
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user?.isGuest) {
      setGuestUpgradeOpen(false);
      setGuestUpgradeMessage("");
    }
  }, [auth.user?.isGuest]);

  useEffect(() => {
    let isActive = true;

    if (!auth.user?._id) {
      setAllTasks([]);
      setPageLoadingState("complete");
      setTaskMutationError("");
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
        setTaskMutationError("");
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
      setTaskMutationError("");
      setIsCreatingTask(true);

      try {
        const createdTodo = await postTodo(newTask);
        setAllTasks((prevState) => [createdTodo, ...prevState]);
        setInputValue({ taskName: "" });
        setInputError({ taskName: false });
      } catch (error) {
        console.error("Error creating todo:", error);
        setTaskMutationError(
          getRequestErrorMessage(error, "Unable to create the task right now.")
        );
      } finally {
        setIsCreatingTask(false);
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
      setTaskMutationError("");
      const updatedTodo = await completeTodo({
        _id: foundItm._id,
        completed: !foundItm.completed,
      });

      setAllTasks((prevState) =>
        prevState.map((task) => (task._id === id ? updatedTodo : task))
      );
    } catch (error) {
      console.error("Error updating todo completion:", error);
      setTaskMutationError(
        getRequestErrorMessage(error, "Unable to update the task right now.")
      );
    }
  };

  const sortByCompleted = (a, b) => {
    if (a.completed === b.completed) return 0;
    if (a.completed) return 1;
    return -1;
  };

  const handleDelete = async (taskId) => {
    try {
      setTaskMutationError("");
      const result = await deleteTodo(taskId);
      setAllTasks((prevState) =>
        prevState.filter((task) => task._id !== result.deletedId)
      );
    } catch (error) {
      console.error("Error deleting todo:", error);
      setTaskMutationError(
        getRequestErrorMessage(error, "Unable to delete the task right now.")
      );
    }
  };

  const updateTaskTitle = async (taskId, newTitle) => {
    const taskToUpdate = allTasks.find((task) => task._id === taskId);
    if (!taskToUpdate) {
      return;
    }

    try {
      setTaskMutationError("");
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
      setTaskMutationError(
        getRequestErrorMessage(error, "Unable to rename the task right now.")
      );
    }
  };

  const openGuestUpgrade = (payload = {}) => {
    setGuestUpgradeMessage(
      typeof payload?.error === "string" && payload.error
        ? payload.error
        : "Create an account to keep using AI guidance and save this guest session."
    );
    setGuestUpgradeOpen(true);
  };

  return (
    <>
      {pageLoadingState && pageLoadingState === "loading" ? (
        <div className="page-loader-shell">
          <div className="loading-indicator">
            <img src={loadingGif} alt="loader" />
          </div>
        </div>
      ) : pageLoadingState === "error" ? (
        <div className="page-loader-shell">
          <div className="loading-indicator">
            <div>Unable to load tasks.</div>
          </div>
        </div>
      ) : (
        <>
          {auth.user?.isGuest && (
            <div className="guest-banner">
              <span>
                Guest mode: you can use AI guidance up to {auth.user.aiRequestLimit || 3} times.
                Create an account to save your progress permanently.
              </span>
              <button type="button" onClick={() => openGuestUpgrade()}>
                Sign Up
              </button>
            </div>
          )}
          <div className="task-form">
            {taskMutationError && (
              <div className="auth-error">{taskMutationError}</div>
            )}
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
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isCreatingTask}
              >
                {isCreatingTask ? (
                  <span className="button-spinner" aria-hidden="true"></span>
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
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
                    onGuestLimitReached={openGuestUpgrade}
                  />
                );
              })}
          </div>
          <GuestUpgradeModal
            isOpen={isGuestUpgradeOpen}
            onClose={() => setGuestUpgradeOpen(false)}
            message={guestUpgradeMessage}
          />
        </>
      )}
    </>
  );
};

export default Tasks;
