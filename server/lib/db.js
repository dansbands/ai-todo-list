const { MongoClient, ObjectId } = require("mongodb");

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const encodedUsername = username ? encodeURIComponent(username) : "";
const encodedPassword = password ? encodeURIComponent(password) : "";
const hasDbCredentials = Boolean(username) && Boolean(password);
const connectionString = hasDbCredentials
  ? `mongodb+srv://${encodedUsername}:${encodedPassword}@cluster0.uojjxxo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  : "";

let clientPromise;

const getMongoClient = () => {
  if (!hasDbCredentials) {
    throw new Error("Database credentials are not configured");
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(connectionString, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
  }

  return clientPromise;
};

const getCollections = async () => {
  const client = await getMongoClient();
  const db = client.db("ai-todo-list");

  return {
    db,
    usersCollection: db.collection("users"),
    todoCollection: db.collection("todos"),
  };
};

module.exports = {
  ObjectId,
  getCollections,
};
