import axios from "axios";

export const serverUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_SERVER_URL
    : process.env.REACT_APP_PROD_SERVER_URL;
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

const appUrl = `${serverUrl}/`;
const todosUrl = `${serverUrl}/api/todos`;
const userTodosUrl = `${serverUrl}/api/user/todos`;

export const getApp = async () => {
  const message = await axios.get(appUrl, {
    headers: baseHeaders,
  });
  return message.data;
};

export const getUserTodos = async () => {
  const message = await axios.post(userTodosUrl, {}, getConfig(true));
  return message.data;
};

export const getTodos = async () => {
  const message = await axios.get(todosUrl, getConfig(true));
  return message.data;
};

export const postTodo = async (todo, tasks, setTasks) => {
  await axios
    .post(todosUrl, todo, getConfig(true))
    .then(() => getTodos())
    .then((todos) => {
      if (todos.length !== tasks.length) setTasks(todos);
    });
};

export const updateTodo = async (todo) => {
  const editUrl = `${todosUrl}/${todo._id}/edit`;
  await axios.put(
    editUrl,
    {
      ...todo,
    },
    getConfig(true)
  );
};

export const completeTodo = async (todo, tasks, setTasks) => {
  const completeUrl = `${todosUrl}/${todo._id}/complete`;
  await axios
    .put(
      completeUrl,
      {
        ...todo,
      },
      getConfig(true)
    )
    .then(() => getTodos())
    .then((todos) => {
      setTasks(todos);
    });
};

export const deleteTodo = async (id, tasks, setTasks) => {
  const url = `${serverUrl}/api/todos/${id}`;

  await axios
    .delete(url, {
      ...getConfig(true),
      data: { id },
    })
    .then(() => getTodos())
    .then((todos) => {
      if (todos.length !== tasks.length) setTasks(todos);
    });
};

export const postNewUser = async (formValues) => {
  const url = `${serverUrl}/signup`;

  const data = await axios.post(url, formValues, getConfig());
  return data;
};

export const postExistingUser = async (formValues) => {
  const url = `${serverUrl}/signin`;

  const data = await axios.post(url, formValues, getConfig());
  return data;
};
