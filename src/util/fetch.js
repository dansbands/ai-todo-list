import axios from "axios";

export const serverUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_SERVER_URL
    : process.env.REACT_APP_PROD_SERVER_URL;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
const todosUrl = `${serverUrl}/api/todos`;
const userTodosUrl = `${serverUrl}/api/user/todos`;

export const getUserTodos = async (userId) => {
  const message = await axios.post(userTodosUrl, {
    userId,
    headers,
  });
  return message.data;
};

export const getTodos = async () => {
  const message = await axios.get(todosUrl, {
    headers,
  });
  return message.data;
};

export const postTodo = async (todo, tasks, setTasks) => {
  await axios
    .post(todosUrl, {
      ...todo,
      headers,
    })
    .then(() => getTodos())
    .then((todos) => {
      if (todos.length !== tasks.length) setTasks(todos);
    });
};

export const updateTodo = async (todo) => {
  const editUrl = `${todosUrl}/${todo._id}/edit`;
  await axios.put(editUrl, {
    ...todo,
  });
};

export const completeTodo = async (todo, tasks, setTasks) => {
  const completeUrl = `${todosUrl}/${todo._id}/complete`;
  await axios
    .put(completeUrl, {
      ...todo,
    })
    .then(() => getTodos())
    .then((todos) => {
      setTasks(todos);
    });
};

export const deleteTodo = async (id, tasks, setTasks) => {
  const url = `${serverUrl}/api/todos/${id}`;

  await axios
    .delete(url, {
      body: { id },
      headers,
    })
    .then(() => getTodos())
    .then((todos) => {
      if (todos.length !== tasks.length) setTasks(todos);
    });
};

export const postNewUser = async (formValues) => {
  const url = `${serverUrl}/signup`;

  const data = await axios.post(url, {
    ...formValues,
    headers,
  });
  return data;
};

export const postExistingUser = async (formValues) => {
  const url = `${serverUrl}/signin`;

  const data = await axios.post(url, {
    ...formValues,
    headers,
  });
  return data;
};
