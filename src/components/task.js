import React, { useState } from "react";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted }) => {
  const [isOpen, toggleOpen] = useState(false);

  const { title, dueDate, completed, id } = data;
  const text = `${title} - ${dueDate}`;

  return (
    <>
      <div className="task-row">
        <label className="task-container">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => toggleCompleted(id)}
          />
          <div className="checkmark"></div>
          <div className="task-title">{text}</div>
        </label>
        <button
          className="task-toggle-button"
          onClick={() => toggleOpen((prevState) => !prevState)}
        >
          <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
        </button>
      </div>
      {isOpen && (
        <div className="task-info-pane">
          <Chat title={title} />
        </div>
      )}
    </>
  );
};

export default Task;
