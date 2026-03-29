import React from "react";

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
    if (inputError) {
      const errorKey = name || title;
      setInputError((prevState) => ({
        ...prevState,
        [errorKey]: false,
      }));
    }
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
      <input
        className="form-input"
        name={name}
        placeholder={title}
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
