import React, { useState } from "react";

const Input = ({
  name,
  title,
  inputValue,
  setInputValue,
  handleSubmit,
  inputError,
  setInputError,
}) => {
  const handleInputChange = (e) => {
    if (inputError) setInputError({[title]: false});
    setInputValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const checkForSubmit = (e) => {
    if (e.key === "Enter") return handleSubmit(e);
  };

  return (
    <div className="form-input-group">
      <label htmlFor={name}>{title}</label>
      <input
        className="form-input"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onKeyUp={checkForSubmit}
      />
      {inputError && (
        <div className="task-input-error">
          Please enter a task name in the input field above.
        </div>
      )}
    </div>
  );
};

export default Input;
