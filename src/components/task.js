import React, { useState } from "react";
import {
  faChevronRight,
  faEllipsis,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "./chat";

const Task = ({ data, toggleCompleted, deleteTodo, updateTaskTitle }) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);

  const { title, completed, _id, response } = data;

  const handleTogglePanel = () => {
    setPanelOpen((prevState) => !prevState);
  };

  const handleToggleControls = () => {
    setSwipeOffset(swipeOffset === 0 ? -100 : 0);
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (startX !== null) {
      const currentX = e.touches[0].clientX;
      const offset = currentX - startX;

      if (offset < 0) {
        setSwipeOffset(Math.max(offset, -100)); 
      } else {
        setSwipeOffset(Math.min(offset, 0));
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -50) {
      setSwipeOffset(-100); 
    } else {
      setSwipeOffset(0);
    }
    setStartX(null);
  };

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleSave = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== title) {
      updateTaskTitle(_id, editedTitle.trim());
    }
  };

  const handleInputChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
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
          <div className="task-title">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={handleInputChange}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyPress}
                autoFocus
              />
            ) : (
              <span onClick={handleTitleClick}>{title}</span>
            )}
          </div>
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
