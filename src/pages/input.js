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
  const handleInputChange = (val) => {
    if (inputError) setInputError(false);
    setInputValue(val);
  };

  const checkForSubmit = (e) => {
    if (e.key === "Enter") return handleSubmit(e);
  };

  return (
    <div className="form-input-group">
      <label for={name}>{title}</label>
      <input
        className="form-input"
        name={name}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
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
