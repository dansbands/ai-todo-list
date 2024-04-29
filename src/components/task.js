import React, { useState } from "react";
import {
  faChevronRight,
  faEllipsis,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted, deleteTodo }) => {
  const [isControlsOpen, toggleControlsOpen] = useState(false);
  const [isPanelOpen, togglePanelOpen] = useState(false);

  const { title, completed, _id } = data;

  return (
    <>
      <div className="task-row">
        <div className="task-row-left">
          <label className="task-checkbox-container">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => toggleCompleted(_id)}
            />
            <div className="task-checkmark"></div>
          </label>
          <div className="task-title">{title}</div>
        </div>
        <div className="task-button-container">
          <button
            className="task-controls-button"
            onClick={() => toggleControlsOpen((prevState) => !prevState)}
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </button>
          <button
            className={`task-toggle-button ${isPanelOpen && "rotate-90-right"}`}
            onClick={() => togglePanelOpen((prevState) => !prevState)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        {isControlsOpen && (
          <button
            className="task-delete-button"
            onClick={() => deleteTodo(_id)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
      <div className={isPanelOpen ? "task-info-pane" : "hidden"}>
        <Chat title={title} />
      </div>
    </>
  );
};

export default Task;
