import React from "react";

const Task = ({ data, toggleCompleted }) => {
  const { title, dueDate, completed, id } = data;
  const text = `${title} - ${dueDate}`;

  return (
    <div className="task-row">
      <label className="container">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => toggleCompleted(id)}
        />
        <span className="checkmark"></span>
        {text}
      </label>
    </div>
  );
};

export default Task;
