import { normalizeGuidance } from "./ai-service";

const toIsoStringOrNull = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue.toISOString();
};

const getAssistantGuidanceFromTodo = (todo) => {
  if (!todo || typeof todo !== "object") {
    return null;
  }

  const storedGuidance =
    todo.assistantGuidance && typeof todo.assistantGuidance === "object"
      ? todo.assistantGuidance
      : todo.response;

  if (!storedGuidance || typeof storedGuidance !== "object") {
    return null;
  }

  const normalizedGuidance = normalizeGuidance(storedGuidance, {
    todoTitle: typeof todo.title === "string" ? todo.title : "",
  });

  return {
    ...normalizedGuidance,
    generatedAt:
      toIsoStringOrNull(todo.assistantGuidance?.generatedAt) ||
      toIsoStringOrNull(todo.updatedAt) ||
      toIsoStringOrNull(todo.createdAt),
  };
};

export const serializeTodo = (todo) => {
  if (!todo || typeof todo !== "object") {
    return todo;
  }

  return {
    ...todo,
    assistantGuidance: getAssistantGuidanceFromTodo(todo),
  };
};

export const getTodoFilter = (todoId, userId, ObjectIdType) => ({
  _id: new ObjectIdType(todoId),
  userId,
});
