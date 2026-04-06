import {
  AUTH_EXPIRED_EVENT,
  getApp,
  getRequestErrorMessage,
  getTodos,
  postExistingUser,
} from "./fetch";

describe("fetch util", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns text responses from getApp", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: () => "text/plain",
        forEach: (callback) => {
          callback("text/plain", "content-type");
        },
      },
      text: jest.fn().mockResolvedValueOnce("Got the app!!!"),
    });

    await expect(getApp()).resolves.toBe("Got the app!!!");
  });

  it("returns axios-like response objects for successful requests", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: () => "application/json",
        forEach: (callback) => {
          callback("application/json", "content-type");
        },
      },
      json: jest.fn().mockResolvedValueOnce({
        token: "test-token",
        email: "dan@example.com",
      }),
    });

    const response = await postExistingUser({
      email: "dan@example.com",
      password: "secret",
    });

    expect(response).toMatchObject({
      status: 200,
      data: {
        token: "test-token",
        email: "dan@example.com",
      },
    });
  });

  it("dispatches the auth expired event for authenticated 401 responses", async () => {
    const handler = jest.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, handler);
    localStorage.setItem("token", JSON.stringify("test-token"));

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: {
        get: () => "application/json",
        forEach: (callback) => {
          callback("application/json", "content-type");
        },
      },
      json: jest.fn().mockResolvedValueOnce({
        error: "Invalid or expired token",
      }),
    });

    await expect(getTodos()).rejects.toMatchObject({
      response: {
        status: 401,
        data: { error: "Invalid or expired token" },
      },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
  });

  it("normalizes request error messages", () => {
    expect(
      getRequestErrorMessage(
        {
          response: {
            data: { error: "Nope" },
          },
        },
        "Fallback"
      )
    ).toBe("Nope");
  });
});
