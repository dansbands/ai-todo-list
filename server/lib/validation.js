const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getUnexpectedFields = (body, allowedFields) =>
  Object.keys(body).filter((field) => !allowedFields.includes(field));

const validateTodoCreatePayload = (body) => {
  if (!isPlainObject(body)) {
    return "Request body must be a JSON object";
  }

  const unexpectedFields = getUnexpectedFields(body, ["title", "completed"]);
  if (unexpectedFields.length) {
    return `Unexpected fields: ${unexpectedFields.join(", ")}`;
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return "Title is required";
  }

  if (typeof body.completed !== "boolean") {
    return "Completed must be a boolean";
  }

  return null;
};

const validateTodoEditPayload = (body) => validateTodoCreatePayload(body);

const validateTodoCompletePayload = (body) => {
  if (!isPlainObject(body)) {
    return "Request body must be a JSON object";
  }

  const unexpectedFields = getUnexpectedFields(body, ["completed"]);
  if (unexpectedFields.length) {
    return `Unexpected fields: ${unexpectedFields.join(", ")}`;
  }

  if (typeof body.completed !== "boolean") {
    return "Completed must be a boolean";
  }

  return null;
};

const validateChatPayload = (body) => {
  if (!isPlainObject(body)) {
    return "Request body must be a JSON object";
  }

  const unexpectedFields = getUnexpectedFields(body, ["todoId", "message"]);
  if (unexpectedFields.length) {
    return `Unexpected fields: ${unexpectedFields.join(", ")}`;
  }

  if (typeof body.todoId !== "string" || !body.todoId.trim()) {
    return "todoId is required";
  }

  if (
    body.message !== undefined &&
    (typeof body.message !== "string" || !body.message.trim())
  ) {
    return "message must be a non-empty string when provided";
  }

  return null;
};

module.exports = {
  isPlainObject,
  validateChatPayload,
  validateTodoCompletePayload,
  validateTodoCreatePayload,
  validateTodoEditPayload,
};
