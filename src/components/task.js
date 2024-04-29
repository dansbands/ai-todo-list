import React, { useState } from "react";
import { faChevronRight, faTrash } from "@fortawesome/free-solid-svg-icons";
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
        <button className="task-delete-button" onClick={() => deleteTodo(_id)}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          className={`task-toggle-button ${isOpen && "rotate-90-right"}`}
          onClick={() => toggleOpen((prevState) => !prevState)}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div className={isOpen ? "task-info-pane" : "hidden"}>
        <Chat title={title} />
      </div>
    </>
  );
};

export default Task;
