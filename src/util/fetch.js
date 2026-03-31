import axios from "axios";

const normalizeBaseUrl = (value) =>
  typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";

const apiBaseUrl = normalizeBaseUrl(
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_SERVER_URL
    : process.env.REACT_APP_PROD_SERVER_URL || ""
);

export const serverUrl = apiBaseUrl;

const getUrl = (path) => `${apiBaseUrl}${path}`;
const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const getStoredValue = (key) => {
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    return storedValue;
  }
};

export const getRequestErrorMessage = (error, fallbackMessage) => {
  const errorPayload = error?.response?.data?.error ?? error?.response?.data;

  if (typeof errorPayload === "string" && errorPayload.trim()) {
    return errorPayload;
  }

  if (
    errorPayload &&
    typeof errorPayload === "object" &&
    typeof errorPayload.message === "string" &&
    errorPayload.message.trim()
  ) {
    return errorPayload.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const getAuthHeaders = () => {
  const token = getStoredValue("token");

  return token
    ? {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      }
    : baseHeaders;
};

const getConfig = (withAuth = false) => ({
  headers: withAuth ? getAuthHeaders() : baseHeaders,
});

const appUrl = getUrl("/api/health");
const todosUrl = getUrl("/api/todos");
const userTodosUrl = getUrl("/api/user/todos");

const getTodosFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.todos)) {
    return data.todos;
  }

  throw new Error("Invalid todos response");
};

const getTodoFromResponse = (data) => {
  if (data?.todo && data.todo?._id) {
    return data.todo;
  }

  if (data?._id) {
    return data;
  }

  throw new Error("Invalid todo response");
};

const getDeleteResponse = (data) => {
  if (typeof data?.deletedId === "string" && data.deletedId) {
    return data;
  }

  throw new Error("Invalid delete response");
};

export const getApp = async () => {
  const message = await axios.get(appUrl, {
    headers: baseHeaders,
  });
  return message.data;
};

export const getUserTodos = async () => {
  const message = await axios.post(userTodosUrl, {}, getConfig(true));
  return getTodosFromResponse(message.data);
};

export const getTodos = async () => {
  const message = await axios.get(todosUrl, getConfig(true));
  return getTodosFromResponse(message.data);
};

export const postTodo = async (todo) => {
  const message = await axios.post(
    todosUrl,
    {
      title: todo.title,
      completed: todo.completed,
    },
    getConfig(true)
  );

  return getTodoFromResponse(message.data);
};

export const updateTodo = async (todo) => {
  const editUrl = `${todosUrl}/${todo._id}/edit`;
  const message = await axios.put(
    editUrl,
    {
      title: todo.title,
      completed: todo.completed,
    },
    getConfig(true)
  );

  return getTodoFromResponse(message.data);
};

export const completeTodo = async (todo) => {
  const completeUrl = `${todosUrl}/${todo._id}/complete`;
  const message = await axios.put(
    completeUrl,
    {
      completed: todo.completed,
    },
    getConfig(true)
  );

  return getTodoFromResponse(message.data);
};

export const deleteTodo = async (id) => {
  const url = getUrl(`/api/todos/${id}`);

  const message = await axios.delete(url, getConfig(true));
  return getDeleteResponse(message.data);
};

export const postNewUser = async (formValues, options = {}) => {
  const url = getUrl(options.includeAuth ? "/api/upgrade-guest" : "/api/signup");
  const config = getConfig(Boolean(options.includeAuth));

  const data = await axios.post(url, formValues, config);
  return data;
};

export const postExistingUser = async (formValues) => {
  const url = getUrl("/api/signin");

  const data = await axios.post(url, formValues, getConfig());
  return data;
};

export const createGuestSession = async () => {
  const url = getUrl("/api/guest-session");

  const data = await axios.post(url, {}, getConfig());
  return data;
};
