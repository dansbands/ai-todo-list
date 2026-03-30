const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const auth = require("./middleware/auth");
const { ObjectId, getCollections } = require("./lib/db");
const {
  isPlainObject,
  validateChatPayload,
  validateTodoCompletePayload,
  validateTodoCreatePayload,
  validateTodoEditPayload,
} = require("./lib/validation");
const {
  AiServiceUnavailableError,
  getGuidance,
} = require("./services/aiService");

const app = express();
const GUEST_AI_REQUEST_LIMIT = 3;

const isDev = process.env.NODE_ENV === "development";
const corsOptions = {
  origin: isDev ? true : "*",
  optionsSuccessStatus: 201,
};

const routePaths = (path) => [path, `/api${path}`];

const getTodoFilter = (todoId, userId) => ({
  _id: new ObjectId(todoId),
  userId,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.get(routePaths("/health"), (req, res) => {
  if (isDev) {
    setTimeout(() => {
      res.send("Got the app!!!");
    }, 1000);
  } else {
    res.send("Got the app!!!");
  }
});

app.get(routePaths("/user"), auth, async (req, res) => {
  if (req.user.isGuest) {
    return res.status(200).send({
      _id: req.user._id,
      firstName: "Guest",
      lastName: "User",
      email: "guest@local",
      isGuest: true,
      aiRequestLimit: GUEST_AI_REQUEST_LIMIT,
    });
  }

  if (!ObjectId.isValid(req.user._id)) {
    return res.status(401).send({ error: "Invalid token payload" });
  }

  try {
    const { usersCollection } = await getCollections();
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.user._id),
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.log("User Error", error);
    return res.status(500).send({ error: "Unable to fetch user" });
  }
});

app.post(routePaths("/signup"), async (req, res) => {
  try {
    const { usersCollection } = await getCollections();
    let user = await usersCollection.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).send({ error: "User already registered" });
    }

    user = {
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
    };

    const result = await usersCollection.insertOne(user);
    const userId = String(result.insertedId);
    const token = jwt.sign({ _id: userId }, process.env.JWT_PRIVATE_KEY);

    return res.header("Authorization", `Bearer ${token}`).status(201).send({
      token,
      _id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to sign up user" });
  }
});

app.post(routePaths("/signin"), async (req, res) => {
  try {
    const { usersCollection } = await getCollections();
    const user = await usersCollection.findOne({ email: req.body.email });
    let pwMatch = false;

    if (user) {
      pwMatch = await bcrypt.compare(req.body.password, user.password);
    }

    if (!user) {
      return res.status(400).send({ error: "User does not exist" });
    }

    if (pwMatch) {
      const token = jwt.sign(
        { _id: String(user._id) },
        process.env.JWT_PRIVATE_KEY
      );

      return res.header("Authorization", `Bearer ${token}`).status(200).send({
        token,
        _id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }

    return res
      .status(401)
      .send({ error: "Invalid username and password combination" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to sign in user" });
  }
});

app.post(routePaths("/guest-session"), async (req, res) => {
  try {
    const guestId = `guest_${crypto.randomUUID()}`;
    const token = jwt.sign(
      { _id: guestId, isGuest: true },
      process.env.JWT_PRIVATE_KEY
    );

    return res.status(201).send({
      token,
      _id: guestId,
      firstName: "Guest",
      lastName: "User",
      email: "guest@local",
      isGuest: true,
      aiRequestLimit: GUEST_AI_REQUEST_LIMIT,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to create guest session" });
  }
});

app.post(routePaths("/user/todos"), auth, async (req, res) => {
  if (isPlainObject(req.body) && Object.keys(req.body).length > 0) {
    return res
      .status(400)
      .json({ error: "This endpoint does not accept a request body" });
  }

  try {
    const { todoCollection } = await getCollections();
    const todos = await todoCollection
      .find({ userId: req.user._id })
      .sort({ _id: -1 })
      .toArray();
    return res.status(200).json({ todos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to fetch todos" });
  }
});

app.get(routePaths("/todos"), auth, async (req, res) => {
  try {
    const { todoCollection } = await getCollections();
    const todos = await todoCollection
      .find({ userId: req.user._id })
      .sort({ _id: -1 })
      .toArray();
    return res.status(200).json({ todos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to fetch todos" });
  }
});

app.post(routePaths("/todos"), auth, async (req, res) => {
  const validationError = validateTodoCreatePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const { todoCollection } = await getCollections();
    const todo = {
      title: req.body.title.trim(),
      completed: req.body.completed,
      userId: req.user._id,
      ownerType: req.user.isGuest ? "guest" : "user",
    };

    const result = await todoCollection.insertOne(todo);
    const createdTodo = await todoCollection.findOne({
      _id: result.insertedId,
      userId: req.user._id,
    });

    if (!createdTodo) {
      console.error("Todo created but could not be retrieved", {
        insertedId: result.insertedId,
        userId: req.user._id,
      });
      return res.status(500).json({ error: "Unable to create todo" });
    }

    return res.status(201).json({ todo: createdTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to create todo" });
  }
});

app.put(routePaths("/todos/:id/edit"), auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  const validationError = validateTodoEditPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const { todoCollection } = await getCollections();
    const filter = getTodoFilter(req.params.id, req.user._id);
    const result = await todoCollection.updateOne(filter, {
      $set: {
        title: req.body.title.trim(),
        completed: req.body.completed,
      },
    });

    if (!result.matchedCount) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = await todoCollection.findOne(filter);

    if (!updatedTodo) {
      console.error("Todo updated but could not be retrieved", {
        todoId: req.params.id,
        userId: req.user._id,
      });
      return res.status(500).json({ error: "Unable to update todo" });
    }

    return res.status(200).json({ todo: updatedTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to update todo" });
  }
});

app.put(routePaths("/todos/:id/complete"), auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  const validationError = validateTodoCompletePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const { todoCollection } = await getCollections();
    const filter = getTodoFilter(req.params.id, req.user._id);
    const result = await todoCollection.updateOne(filter, {
      $set: {
        completed: req.body.completed,
      },
    });

    if (!result.matchedCount) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = await todoCollection.findOne(filter);

    if (!updatedTodo) {
      console.error("Todo completion updated but could not be retrieved", {
        todoId: req.params.id,
        userId: req.user._id,
      });
      return res.status(500).json({ error: "Unable to update todo" });
    }

    return res.status(200).json({ todo: updatedTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to update todo" });
  }
});

app.delete(routePaths("/todos/:id"), auth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  try {
    const { todoCollection } = await getCollections();
    const result = await todoCollection.deleteOne(
      getTodoFilter(req.params.id, req.user._id)
    );

    if (!result.deletedCount) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(200).json({ deletedId: req.params.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to delete todo" });
  }
});

app.post(routePaths("/chat"), auth, async (req, res) => {
  const validationError = validateChatPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { message, todoId } = req.body;

  if (!ObjectId.isValid(todoId)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  try {
    const { todoCollection, usersCollection } = await getCollections();

    if (req.user.isGuest) {
      const usageRecord = await usersCollection.findOne({ _id: req.user._id });
      const requestsUsed = Number.isInteger(usageRecord?.guestAiRequestsUsed)
        ? usageRecord.guestAiRequestsUsed
        : 0;

      if (requestsUsed >= GUEST_AI_REQUEST_LIMIT) {
        return res.status(403).json({
          error:
            "Guest limit reached. Please sign up to continue using AI guidance.",
          code: "GUEST_LIMIT_REACHED",
          limit: GUEST_AI_REQUEST_LIMIT,
        });
      }
    }

    const todo = await todoCollection.findOne(
      getTodoFilter(todoId, req.user._id)
    );

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const guidance = await getGuidance({
      todoTitle: todo.title,
      userMessage: message,
    });

    await todoCollection.updateOne(getTodoFilter(todoId, req.user._id), {
      $set: {
        response: guidance,
      },
    });

    if (req.user.isGuest) {
      await usersCollection.updateOne(
        { _id: req.user._id },
        { $inc: { guestAiRequestsUsed: 1 } },
        { upsert: true }
      );

      const updatedUsageRecord = await usersCollection.findOne({
        _id: req.user._id,
      });

      const requestsUsed = Number.isInteger(
        updatedUsageRecord?.guestAiRequestsUsed
      )
        ? updatedUsageRecord.guestAiRequestsUsed
        : 1;
      const requestsRemaining = Math.max(
        GUEST_AI_REQUEST_LIMIT - requestsUsed,
        0
      );

      return res.status(200).json({
        ...guidance,
        guestUsage: {
          limit: GUEST_AI_REQUEST_LIMIT,
          used: requestsUsed,
          remaining: requestsRemaining,
        },
      });
    }

    return res.status(200).json(guidance);
  } catch (error) {
    if (error instanceof AiServiceUnavailableError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Error processing the AI request" });
  }
});

module.exports = app;
