import React, { useState } from "react";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted, deleteTodo }) => {
  const [isOpen, toggleOpen] = useState(false);

  const { title, completed, id, _id } = data;

  return (
    <>
      <div className="task-row">
        <div className="task-row-left">
          <label className="task-checkbox-container">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => toggleCompleted(id)}
            />
            <div className="task-checkmark"></div>
          </label>
          <div className="task-title">{title}</div>
        </div>
        <button onClick={() => deleteTodo(_id)}>X</button>
        <button
          className="task-toggle-button"
          onClick={() => toggleOpen((prevState) => !prevState)}
        >
          <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
        </button>
      </div>
      <div className={isOpen ? "task-info-pane" : "hidden"}>
        <Chat title={title} />
      </div>
    </>
  );
};

export default Task;
