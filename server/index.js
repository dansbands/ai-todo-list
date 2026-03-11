const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("./middleware/auth");
const app = express();

const isDev = process.env.NODE_ENV === "development";
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 201, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const connectionString = `mongodb+srv://${username}:${password}@cluster0.uojjxxo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

MongoClient.connect(connectionString).then((client) => {
  const db = client.db("ai-todo-list");
  const todoCollection = db.collection("todos");
  const usersCollection = db.collection("users");

  const getTodoFilter = (todoId, userId) => ({
    _id: new ObjectId(todoId),
    userId,
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors(!isDev ? corsOptions : null));
  app.use(express.json());

  const PORT = process.env.PORT || 10000;

  app.get("/", (req, res) => {
    if (isDev) {
      setTimeout(() => {
        res.send("Got the app!!!");
      }, 1000);
    } else {
      res.send("Got the app!!!");
    }
  });

  /**
   * *** USERS Routes ***
   */
  app.get("/user", auth, async (req, res) => {
    if (!ObjectId.isValid(req.user._id)) {
      return res.status(401).send({ error: "Invalid token payload" });
    }

    try {
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

  app.post("/signup", async (req, res) => {
    let user = await usersCollection.findOne({ email: req.body.email });
    if (user) return res.status(400).send({ error: "User already registered" });

    user = req.body;
    user.password = await bcrypt.hash(user.password, 10);
    usersCollection
      .insertOne(user)
      .then((result) => {
        const userId = String(result.insertedId);
        const token = jwt.sign(
          { _id: userId },
          process.env.JWT_PRIVATE_KEY
          // { expiresIn: "1800s" }
        );
        res.header("Authorization", `Bearer ${token}`).status(201).send({
          token,
          _id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      })
      .catch((error) => console.error(error));
  });

  app.post("/signin", async (req, res) => {
    let user = await usersCollection.findOne({ email: req.body.email });
    let pwMatch = false;
    if (user) {
      pwMatch = await bcrypt.compare(req.body.password, user.password);
    }
    if (!user) {
      return res.status(400).send({ error: "User does not exist" });
    } else if (user && pwMatch) {
      const token = jwt.sign(
        { _id: String(user._id) },
        process.env.JWT_PRIVATE_KEY
      );
      res.header("Authorization", `Bearer ${token}`).status(200).send({
        token,
        _id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      res
        .status(401)
        .send({ error: "Invalid username and password combination" });
    }
  });

  /**
   * *** TODOS Routes ***
   */

  app.post("/api/user/todos", auth, async (req, res) => {
    try {
      const todos = await todoCollection.find({ userId: req.user._id }).toArray();
      return res.status(200).send(todos);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to fetch todos" });
    }
  });

  app.get("/api/todos", auth, async (req, res) => {
    try {
      const todos = await todoCollection.find({ userId: req.user._id }).toArray();
      return res.status(200).send(todos);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to fetch todos" });
    }
  });

  app.post("/api/todos", auth, async (req, res) => {
    try {
      const todo = {
        ...req.body,
        userId: req.user._id,
      };

      const result = await todoCollection.insertOne(todo);

      return res.status(201).send({
        ...todo,
        _id: result.insertedId,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to create todo" });
    }
  });

  app.put("/api/todos/:id/edit", auth, async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ error: "Invalid todo id" });
    }

    try {
      const filter = getTodoFilter(req.params.id, req.user._id);
      const result = await todoCollection.updateOne(filter, {
        $set: {
          title: req.body.title,
          completed: req.body.completed,
        },
      });

      if (!result.matchedCount) {
        return res.status(404).send({ error: "Todo not found" });
      }

      const updatedTodo = await todoCollection.findOne(filter);
      return res.status(200).send(updatedTodo);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to update todo" });
    }
  });

  app.put("/api/todos/:id/complete", auth, async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ error: "Invalid todo id" });
    }

    try {
      const filter = getTodoFilter(req.params.id, req.user._id);
      const result = await todoCollection.updateOne(filter, {
        $set: {
          completed: req.body.completed,
        },
      });

      if (!result.matchedCount) {
        return res.status(404).send({ error: "Todo not found" });
      }

      const updatedTodo = await todoCollection.findOne(filter);
      return res.status(200).send(updatedTodo);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to update todo" });
    }
  });

  app.delete("/api/todos/:id", auth, async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ error: "Invalid todo id" });
    }

    try {
      const result = await todoCollection.deleteOne(
        getTodoFilter(req.params.id, req.user._id)
      );

      if (!result.deletedCount) {
        return res.status(404).send({ error: "Todo not found" });
      }

      return res.status(200).json({ message: `Deleted ${req.params.id}` });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Unable to delete todo" });
    }
  });

  // Chat Routes

  app.post("/api/chat", auth, async (req, res) => {
    const { message, todoId } = req.body;

    if (!ObjectId.isValid(todoId)) {
      return res.status(400).send({ error: "Invalid todo id" });
    }

    try {
      const todo = await todoCollection.findOne(getTodoFilter(todoId, req.user._id));

      if (!todo) {
        return res.status(404).send({ error: "Todo not found" });
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      await todoCollection.updateOne(getTodoFilter(todoId, req.user._id), {
        $set: {
          response: response.data,
        },
      });
      return res.status(200).send(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Error processing the AI request" });
    }
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
