import React, { useState } from "react";
import {
  faChevronRight,
  faEllipsis,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted, deleteTodo }) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(null);

  const { title, completed, _id, response } = data;

  // Handle panel toggle
  const handleTogglePanel = () => {
    setPanelOpen((prevState) => !prevState);
  };

  const handleToggleControls = () => {
    setSwipeOffset(swipeOffset === 0 ? -100 : 0);
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (startX !== null) {
      const currentX = e.touches[0].clientX;
      const offset = currentX - startX;

      // Allow swiping left (negative offset) or right (positive offset)
      if (offset < 0) {
        setSwipeOffset(Math.max(offset, -100)); // Limit swipe left to -100px
      } else {
        setSwipeOffset(Math.min(offset, 0)); // Limit swipe right to 0px
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (swipeOffset < -50) {
      setSwipeOffset(-100); // Fully reveal delete button
    } else {
      setSwipeOffset(0); // Reset position (hide delete button)
    }
    setStartX(null);
  };

  return (
    <div
      className="task-container"
      style={{ transform: `translateX(${swipeOffset}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        </div>
      </div>
      <div className={`task-panel ${isPanelOpen ? "open" : "closed"}`}>
        <Chat title={title} todoId={_id} chatResponse={response} />
      </div>
      <button
        className="task-delete-button"
        onClick={() => deleteTodo(_id)}
        style={{ display: swipeOffset === -100 ? "flex" : "none" }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
};

export default Task;
