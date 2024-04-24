import React, { useState } from "react";

const Task = ({ data, toggleCompleted }) => {
  const [isOpen, toggleOpen] = useState(false);

  const { title, dueDate, completed, id } = data;
  const text = `${title} - ${dueDate}`;

  return (
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
    </div>
  );
};

export default Task;
