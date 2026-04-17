 "use client";

import React, { useState } from "react";
import Chat from "./chat";

const DELETE_REVEAL_WIDTH = 92;
const DELETE_REVEAL_THRESHOLD = DELETE_REVEAL_WIDTH / 2;

const Task = ({
  data,
  toggleCompleted,
  deleteTodo,
  updateTaskTitle,
  onGuestLimitReached,
}) => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);

  const { title, completed, _id, assistantGuidance, response } = data;

  const handleTogglePanel = () => {
    setSwipeOffset(0);
    setPanelOpen((prevState) => !prevState);
  };

  const handleToggleControls = () => {
    setSwipeOffset((prevState) =>
      prevState === 0 ? -DELETE_REVEAL_WIDTH : 0
    );
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (startX !== null) {
      const currentX = e.touches[0].clientX;
      const offset = currentX - startX;

      if (offset < 0) {
        setSwipeOffset(Math.max(offset, -DELETE_REVEAL_WIDTH));
      } else {
        setSwipeOffset(Math.min(offset, 0));
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -DELETE_REVEAL_THRESHOLD) {
      setSwipeOffset(-DELETE_REVEAL_WIDTH);
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
    <div className={`task-swipe-shell ${swipeOffset < 0 ? "is-revealed" : ""}`}>
      <button
        className="task-delete-button"
        onClick={() => deleteTodo(_id)}
        aria-label={`Delete ${title}`}
      >
        🗑️
      </button>
      <div
        className="task-container"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div
          className="task-row"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
              ⋯
            </button>
            <button
              className={`task-toggle-button ${
                isPanelOpen ? "rotate-90-right" : ""
              }`}
              onClick={handleTogglePanel}
            >
              ❯
            </button>
          </div>
        </div>
        <div className={`task-panel ${isPanelOpen ? "open" : "closed"}`}>
          <Chat
            title={title}
            todoId={_id}
            chatResponse={assistantGuidance || response}
            onGuestLimitReached={onGuestLimitReached}
          />
        </div>
      </div>
    </div>
  );
};

export default Task;
