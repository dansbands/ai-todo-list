import React, { useState } from "react";
import {
  faChevronRight,
  faEllipsis,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted, deleteTodo }) => {
  const [isControlsOpen, setControlsOpen] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const { title, completed, _id, response } = data;

  const handleToggleControls = () => {
    setControlsOpen((prevState) => !prevState);
  };

  const handleTogglePanel = () => {
    setPanelOpen((prevState) => !prevState);
  };

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
            onClick={handleToggleControls}
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </button>
          <button
            className={`task-toggle-button ${
              isPanelOpen ? "rotate-90-right" : ""
            }`}
            onClick={handleTogglePanel}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          {isControlsOpen && (
            <button
              className="task-delete-button"
              onClick={() => deleteTodo(_id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
      <div className={`task-panel ${isPanelOpen ? "open" : "closed"}`}>
        <Chat title={title} todoId={_id} chatResponse={response} />
      </div>
    </>
  );
};

export default Task;
