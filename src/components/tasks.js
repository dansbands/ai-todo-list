import React from "react";
import Task from "./task";

const allTasks = [
  {
    title: "Lots to do",
    dueDate: "11/25/24",
    completed: false,
    order: 1,
  },
  {
    title: "Plenty going on",
    dueDate: "11/20/24",
    completed: false,
    order: 2,
  },
  {
    title: "I think it's nap time",
    dueDate: "11/27/24",
    completed: false,
    order: 3,
  },
];

const Tasks = () => {
  return (
    <>
      <div>Tasks</div>
      {allTasks.map((taskData) => {
        return <Task data={taskData} />;
      })}
    </>
  );
};

export default Tasks;
