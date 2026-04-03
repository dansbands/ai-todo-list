process.env.JWT_PRIVATE_KEY = "test-private-key";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const mockCollections = {
  usersCollection: {
    findOne: jest.fn(),
    insertOne: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
  },
  todoCollection: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
  },
};

jest.mock("./lib/db", () => {
  const actual = jest.requireActual("./lib/db");

  return {
    ...actual,
    getCollections: jest.fn(async () => mockCollections),
  };
});

jest.mock("./services/aiService", () => {
  const actual = jest.requireActual("./services/aiService");

  return {
    ...actual,
    getGuidance: jest.fn(),
  };
});

const app = require("./app");
const { getGuidance } = require("./services/aiService");

const createAuthToken = (payload = {}) =>
  jwt.sign(
    {
      _id: "660f1d2e3c4b5a6978877665",
      ...payload,
    },
    process.env.JWT_PRIVATE_KEY
  );

const createTodoCursor = (todos) => ({
  sort: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue(todos),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCollections.usersCollection.findOne.mockReset();
  mockCollections.usersCollection.insertOne.mockReset();
  mockCollections.usersCollection.deleteOne.mockReset();
  mockCollections.usersCollection.updateOne.mockReset();
  mockCollections.usersCollection.updateMany.mockReset();
  mockCollections.todoCollection.find.mockReset();
  mockCollections.todoCollection.findOne.mockReset();
  mockCollections.todoCollection.insertOne.mockReset();
  mockCollections.todoCollection.updateOne.mockReset();
  mockCollections.todoCollection.updateMany.mockReset();
  mockCollections.todoCollection.deleteOne.mockReset();
});

describe("auth routes", () => {
  it("signs in a user with valid credentials", async () => {
    const passwordHash = await require("bcrypt").hash("hunter2", 10);
    mockCollections.usersCollection.findOne.mockResolvedValue({
      _id: "660f1d2e3c4b5a6978877665",
      firstName: "Dan",
      lastName: "Smith",
      email: "dan@example.com",
      password: passwordHash,
    });

    const response = await request(app).post("/api/signin").send({
      email: "dan@example.com",
      password: "hunter2",
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      firstName: "Dan",
      email: "dan@example.com",
    });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects a user with an invalid password", async () => {
    const passwordHash = await require("bcrypt").hash("correct-password", 10);
    mockCollections.usersCollection.findOne.mockResolvedValue({
      _id: "660f1d2e3c4b5a6978877665",
      email: "dan@example.com",
      password: passwordHash,
    });

    const response = await request(app).post("/api/signin").send({
      email: "dan@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid username and password combination",
    });
  });
});

describe("todo ownership enforcement", () => {
  it("does not allow one user to edit another user's todo", async () => {
    mockCollections.todoCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

    const response = await request(app)
      .put("/api/todos/660f1d2e3c4b5a6978877665/edit")
      .set("Authorization", `Bearer ${createAuthToken()}`)
      .send({
        title: "Updated title",
        completed: false,
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Todo not found" });
    expect(mockCollections.todoCollection.updateOne).toHaveBeenCalledTimes(1);
  });
});

describe("assistant guidance normalization", () => {
  it("normalizes malformed stored assistant guidance before returning todos", async () => {
    const todos = [
      {
        _id: "660f1d2e3c4b5a6978877665",
        title: "Learn Cursor",
        completed: false,
        userId: "660f1d2e3c4b5a6978877665",
        assistantGuidance: {
          message: "",
          links: [
            {
              linkTitle: "Bad link",
              url: "javascript:alert(1)",
              description: "Nope",
            },
          ],
          googleSearch: "",
          steps: "Read docs first",
        },
      },
    ];

    mockCollections.todoCollection.find.mockReturnValue(createTodoCursor(todos));

    const response = await request(app)
      .post("/api/user/todos")
      .set("Authorization", `Bearer ${createAuthToken()}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.todos).toHaveLength(1);
    expect(response.body.todos[0].assistantGuidance).toMatchObject({
      message: "Guidance could not be generated in the expected format. Please try again.",
      links: [],
      googleSearch: "Learn Cursor",
      steps: ["Read docs first"],
    });
  });

  it("stores normalized assistant guidance on chat responses", async () => {
    getGuidance.mockResolvedValue({
      message: "Start with the official docs.",
      links: [],
      googleSearch: "learn cursor editor",
      steps: ["Read the getting started guide"],
    });

    mockCollections.todoCollection.findOne
      .mockResolvedValueOnce({
        _id: "660f1d2e3c4b5a6978877665",
        title: "Learn Cursor",
        completed: false,
        userId: "660f1d2e3c4b5a6978877665",
      })
      .mockResolvedValueOnce({
        _id: "660f1d2e3c4b5a6978877665",
        title: "Learn Cursor",
        completed: false,
        userId: "660f1d2e3c4b5a6978877665",
        assistantGuidance: {
          message: "Start with the official docs.",
          links: [],
          googleSearch: "learn cursor editor",
          steps: ["Read the getting started guide"],
          generatedAt: "2026-04-03T12:00:00.000Z",
        },
      });
    mockCollections.todoCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const response = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${createAuthToken()}`)
      .send({
        todoId: "660f1d2e3c4b5a6978877665",
        message: "Help me learn Cursor",
      });

    expect(response.status).toBe(200);
    expect(mockCollections.todoCollection.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          assistantGuidance: expect.objectContaining({
            message: "Start with the official docs.",
            generatedAt: expect.any(String),
          }),
        }),
      })
    );
    expect(response.body).toMatchObject({
      message: "Start with the official docs.",
      googleSearch: "learn cursor editor",
      steps: ["Read the getting started guide"],
    });
  });
});
