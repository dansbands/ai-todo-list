const {
  DEFAULT_DEVELOPMENT_ORIGINS,
  createCorsOptions,
  getAllowedOrigins,
  parseAllowedOrigins,
} = require("./security");

describe("security config", () => {
  it("parses comma-separated origins", () => {
    expect(
      parseAllowedOrigins(" https://app.example.com/, http://localhost:3000/ , ")
    ).toEqual(["https://app.example.com", "http://localhost:3000"]);
  });

  it("uses local frontend origins by default in development", () => {
    expect(getAllowedOrigins({ nodeEnv: "development" })).toEqual(
      DEFAULT_DEVELOPMENT_ORIGINS
    );
  });

  it("requires explicit origins outside development", () => {
    expect(getAllowedOrigins({ nodeEnv: "production" })).toEqual([]);
  });

  it("defaults to development origins when nodeEnv is unset", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;

    try {
      expect(getAllowedOrigins()).toEqual(DEFAULT_DEVELOPMENT_ORIGINS);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("prefers configured origins over defaults", () => {
    expect(
      getAllowedOrigins({
        nodeEnv: "development",
        allowedOrigins: "https://app.example.com,https://admin.example.com",
      })
    ).toEqual(["https://app.example.com", "https://admin.example.com"]);
  });

  it("allows requests with approved origins", () => {
    const callback = jest.fn();
    const corsOptions = createCorsOptions({
      nodeEnv: "production",
      allowedOrigins: "https://app.example.com",
    });

    corsOptions.origin("https://app.example.com", callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("allows requests without an origin header", () => {
    const callback = jest.fn();
    const corsOptions = createCorsOptions({ nodeEnv: "production" });

    corsOptions.origin(undefined, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("rejects requests from unapproved origins", () => {
    const callback = jest.fn();
    const corsOptions = createCorsOptions({
      nodeEnv: "production",
      allowedOrigins: "https://app.example.com",
    });

    corsOptions.origin("https://evil.example.com", callback);

    expect(callback.mock.calls[0][0]).toEqual(expect.any(Error));
    expect(callback.mock.calls[0][0].message).toBe("Not allowed by CORS");
  });
});
