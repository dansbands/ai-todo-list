import React from "react";

const Task = ({ data }) => {
  const { title, dueDate, completed } = data;
  const text = `${title} - ${dueDate} - ${completed}`;

  return <div>{text}</div>;
};

export default Task;
