const { MongoClient, ObjectId } = require("mongodb");

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const connectionString = `mongodb+srv://${username}:${password}@cluster0.uojjxxo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let clientPromise;

const getMongoClient = () => {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(connectionString);
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
