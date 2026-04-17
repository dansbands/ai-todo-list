 "use client";

export const AUTH_EXPIRED_EVENT = "app:auth-expired";

const apiBaseUrl = "";

export const serverUrl = apiBaseUrl;

const getUrl = (path) => `${apiBaseUrl}${path}`;
const getSameOriginRetryUrl = () => "";

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getResponseHeaders = (response) => {
  const headers = {};

  if (response?.headers?.forEach) {
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
  }

  return headers;
};

const parseResponseData = async (response) => {
  if (!response) {
    return null;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers?.get?.("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  try {
    return await response.text();
  } catch (error) {
    return null;
  }
};

const createResponseLike = (response, data) => ({
  status: response.status,
  data,
  headers: getResponseHeaders(response),
});

const createRequestError = (response, data) => {
  const errorMessage =
    (typeof data === "string" && data.trim()) ||
    (data &&
      typeof data === "object" &&
      (typeof data.error === "string"
        ? data.error
        : typeof data.message === "string"
          ? data.message
          : "")) ||
    response.statusText ||
    `Request failed with status ${response.status}`;

  const error = new Error(errorMessage);
  error.response = createResponseLike(response, data);
  return error;
};

const getRequestInit = (config = {}) => {
  const init = {
    method: config.method,
    headers: config.headers,
  };

  if (Object.prototype.hasOwnProperty.call(config, "data")) {
    init.body = JSON.stringify(config.data);
  }

  return init;
};

export const getStoredValue = (key) => {
  if (typeof window === "undefined") {
    return null;
  }

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

const notifyAuthExpired = (error) => {
  if (error?.response?.status !== 401 || typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: {
        message: getRequestErrorMessage(
          error,
          "Your session has expired. Please sign in again."
        ),
      },
    })
  );
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

const sendRequest = async (url, config, options = {}) => {
  const response = await fetch(url, getRequestInit(config));
  const data = await parseResponseData(response);

  if (!response.ok) {
    const error = createRequestError(response, data);
    if (options.withAuth && response.status === 401) {
      notifyAuthExpired(error);
    }
    throw error;
  }

  return createResponseLike(response, data);
};

const request = async (config, options = {}) => {
  try {
    return await sendRequest(config.url, config, options);
  } catch (error) {
    const retryUrl = getSameOriginRetryUrl(config.url);

    if (!error?.response && retryUrl) {
      return sendRequest(retryUrl, config, options);
    }

    throw error;
  }
};

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
  const message = await request({
    method: "get",
    url: appUrl,
    headers: baseHeaders,
  });
  return message.data;
};

export const getUserTodos = async () => {
  const message = await request(
    {
      method: "post",
      url: userTodosUrl,
      data: {},
      ...getConfig(true),
    },
    { withAuth: true }
  );
  return getTodosFromResponse(message.data);
};

export const getTodos = async () => {
  const message = await request(
    {
      method: "get",
      url: todosUrl,
      ...getConfig(true),
    },
    { withAuth: true }
  );
  return getTodosFromResponse(message.data);
};

export const postTodo = async (todo) => {
  const message = await request(
    {
      method: "post",
      url: todosUrl,
      data: {
        title: todo.title,
        completed: todo.completed,
      },
      ...getConfig(true),
    },
    { withAuth: true }
  );

  return getTodoFromResponse(message.data);
};

export const updateTodo = async (todo) => {
  const editUrl = `${todosUrl}/${todo._id}/edit`;
  const message = await request(
    {
      method: "put",
      url: editUrl,
      data: {
        title: todo.title,
        completed: todo.completed,
      },
      ...getConfig(true),
    },
    { withAuth: true }
  );

  return getTodoFromResponse(message.data);
};

export const completeTodo = async (todo) => {
  const completeUrl = `${todosUrl}/${todo._id}/complete`;
  const message = await request(
    {
      method: "put",
      url: completeUrl,
      data: {
        completed: todo.completed,
      },
      ...getConfig(true),
    },
    { withAuth: true }
  );

  return getTodoFromResponse(message.data);
};

export const deleteTodo = async (id) => {
  const url = getUrl(`/api/todos/${id}`);

  const message = await request(
    {
      method: "delete",
      url,
      ...getConfig(true),
    },
    { withAuth: true }
  );
  return getDeleteResponse(message.data);
};

export const postNewUser = async (formValues, options = {}) => {
  const url = getUrl(options.includeAuth ? "/api/upgrade-guest" : "/api/signup");
  const config = getConfig(Boolean(options.includeAuth));

  const data = await request(
    {
      method: "post",
      url,
      data: formValues,
      ...config,
    },
    { withAuth: Boolean(options.includeAuth) }
  );
  return data;
};

export const postExistingUser = async (formValues) => {
  const url = getUrl("/api/signin");

  const data = await request({
    method: "post",
    url,
    data: formValues,
    ...getConfig(),
  });
  return data;
};

export const createGuestSession = async () => {
  const url = getUrl("/api/guest-session");

  const data = await request({
    method: "post",
    url,
    data: {},
    ...getConfig(),
  });
  return data;
};

export const postChatMessage = async ({ todoId, message = "" }) => {
  const url = getUrl("/api/chat");

  const result = await request(
    {
      method: "post",
      url,
      data: {
        todoId,
        ...(typeof message === "string" && message.trim()
          ? { message: message.trim() }
          : {}),
      },
      ...getConfig(true),
    },
    { withAuth: true }
  );

  return result.data;
};
