const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors(!isDev ? corsOptions : null));
  app.use(express.json());

  const PORT = process.env.PORT || 10000;

  app.get("/", (req, res) => {
    res.send("Got the app!!!");
  });

  /**
   * *** USERS Routes ***
   */
  app.get("/user", async (req, res) => {
    const token = req.headers("authorization");
    if (!token) return res.status(401).send("Access denied. No token provided");
    const decoded = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    usersCollection
      .findOne({ _id: ObjectId(decoded._id) })
      .catch((err) => console.log("User Error", err))
      .then((user) => {
        res.status(200).send({
          _id: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        });
      });
  });

  app.post("/signup", async (req, res) => {
    let user = await usersCollection.findOne({ email: req.body.email });
    if (user) return res.status(400).send({ error: "User already registered" });

    user = req.body;
    user.password = await bcrypt.hash(user.password, 10);
    usersCollection
      .insertOne(user)
      .then((result) => {
        const token = jwt.sign(
          { _id: result._id },
          process.env.JWT_PRIVATE_KEY
          // { expiresIn: "1800s" }
        );
        res.header("x-auth-token", token).send({
          token,
          _id: user._id,
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
      const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
      res.header("Authorization", token).status(200).send({
        token,
        _id: user._id,
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

  app.post("/api/user/todos", (req, res) => {
    const todos = todoCollection.find({ userId: req.body.userId })
    todos
      .toArray()
      .then((results) => res.send(results))
      .catch((error) => console.error(error));
  });

  app.get("/api/todos", (req, res) => {
    todoCollection
      .find()
      .toArray()
      .then((results) => res.send(results))
      .catch((error) => console.error(error));
  });

  app.post("/api/todos", (req, res) => {
    todoCollection
      .insertOne(req.body)
      // .then((result)) // do something with this
      .catch((error) => console.error(error));
  });

  app.put("/api/todos/:id/edit", (req, res) => {
    console.log("PUT!!!", req.params.id);
    console.log("BODY!!!", req.body);
    todoCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title: req.body.title,
          completed: req.body.completed,
        },
      }
    );
  });

  app.put("/api/todos/:id/complete", (req, res) => {
    console.log("PUT!!!", req.params.id);
    console.log("BODY!!!", req.body);
    todoCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          completed: req.body.completed,
        },
      }
    );
  });

  app.delete("/api/todos/:id", (req, res) => {
    console.log("DELETE!!!", req.params.id);
    console.log("BODY!!!", new ObjectId(req.params.id));
    todoCollection
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.json(`Deleted ${req.params.id}`);
      })
      .catch((error) => console.error(error));
  });

  // Chat Routes

  app.post("/api/chat", async (req, res) => {
    const { message, todoId } = req.body;
    try {
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
      todoCollection.findOneAndUpdate(
        { _id: new ObjectId(todoId) },
        {
          $set: {
            response: response.data,
          },
        }
      );
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing the AI request");
    }
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
