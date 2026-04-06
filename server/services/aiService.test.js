const {
  AiServiceUnavailableError,
  buildPrompt,
  getFallbackGuidance,
  getGuidance,
  isSafeHttpUrl,
  looksLikeStructuredOutput,
  normalizeGuidance,
  parseModelContent,
} = require("./aiService");

describe("aiService", () => {
  it("buildPrompt includes task title and exact response schema", () => {
    const prompt = buildPrompt({
      todoTitle: "plan a trip to Montreal",
      userMessage: "I only have a weekend",
    });

    expect(prompt).toMatch(/plan a trip to Montreal/);
    expect(prompt).toMatch(/I only have a weekend/);
    expect(prompt).toMatch(/"steps":\["string"\]/);
    expect(prompt).toMatch(/Never invent URLs/);
    expect(prompt).toMatch(/Do not confuse similarly named products/);
  });

  it("normalizeGuidance returns the expected schema for partial payloads", () => {
    const guidance = normalizeGuidance(
      {
        message: "Start with the visa requirements.",
        links: [
          {
            linkTitle: "Travel site",
            url: "https://example.com",
            description: "Helpful checklist",
          },
          {
            linkTitle: "",
            url: "https://invalid.example.com",
            description: "Should be removed",
          },
        ],
        steps: "Check passport expiration",
      },
      { todoTitle: "plan travel" }
    );

    expect(guidance).toEqual({
      message: "Start with the visa requirements.",
      links: [
        {
          linkTitle: "Travel site",
          url: "https://example.com",
          description: "Helpful checklist",
        },
      ],
      googleSearch: "plan travel",
      steps: ["Check passport expiration"],
    });
  });

  it("normalizeGuidance safely normalizes legacy raw response payloads", () => {
    const guidance = normalizeGuidance(
      {
        message: "Use the official docs first.",
        links: [
          {
            linkTitle: "Docs",
            url: "https://example.com/docs",
            description: "Official docs",
          },
        ],
        googleSearch: "learn docs",
        steps: ["Open the docs", "Follow the quickstart"],
        generatedAt: "2026-04-03T10:00:00.000Z",
      },
      { todoTitle: "learn docs" }
    );

    expect(guidance).toEqual({
      message: "Use the official docs first.",
      links: [
        {
          linkTitle: "Docs",
          url: "https://example.com/docs",
          description: "Official docs",
        },
      ],
      googleSearch: "learn docs",
      steps: ["Open the docs", "Follow the quickstart"],
    });
  });

  it("normalizeGuidance preserves legacy OpenAI choices content", () => {
    const guidance = normalizeGuidance(
      {
        choices: [
          {
            message: {
              content: "Use your saved checklist and update due dates.",
            },
          },
        ],
      },
      { todoTitle: "plan week" }
    );

    expect(guidance).toEqual({
      message: "Use your saved checklist and update due dates.",
      links: [],
      googleSearch: "plan week",
      steps: ["Use your saved checklist and update due dates."],
    });
  });

  it("normalizeGuidance drops unsafe link protocols", () => {
    const guidance = normalizeGuidance({
      message: "Use a trusted resource.",
      links: [
        {
          linkTitle: "Safe",
          url: "https://example.com",
          description: "Allowed",
        },
        {
          linkTitle: "Unsafe",
          url: "javascript:alert(1)",
          description: "Should be removed",
        },
      ],
    });

    expect(guidance.links).toEqual([
      {
        linkTitle: "Safe",
        url: "https://example.com",
        description: "Allowed",
      },
    ]);
  });

  it("isSafeHttpUrl rejects localhost and private network destinations", () => {
    expect(isSafeHttpUrl("http://localhost:3000/docs")).toBe(false);
    expect(isSafeHttpUrl("http://127.0.0.1/metadata")).toBe(false);
    expect(isSafeHttpUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isSafeHttpUrl("https://192.168.1.10/internal")).toBe(false);
    expect(isSafeHttpUrl("https://example.com/docs")).toBe(true);
  });

  it("parseModelContent strips code fences and trailing commas", () => {
    const guidance = parseModelContent(
      '```json\n{"message":"Do this","links":[],"googleSearch":"test","steps":["one",],}\n```',
      { todoTitle: "test task" }
    );

    expect(guidance).toEqual({
      message: "Do this",
      links: [],
      googleSearch: "test",
      steps: ["one"],
    });
  });

  it("parseModelContent falls back safely for invalid model output", () => {
    const guidance = parseModelContent("not valid json", {
      todoTitle: "replace bike tire",
      userMessage: "with basic tools",
    });

    expect(guidance).toEqual({
      message: "not valid json",
      links: [],
      googleSearch: "replace bike tire",
      steps: [],
    });
  });

  it("parseModelContent does not leak broken json-like output into the fallback message", () => {
    const guidance = parseModelContent(
      '{"message":"Start here","links":[{"linkTitle":"Broken",json "url":"https://example.com"}]}',
      {
        todoTitle: "learn cursor",
        userMessage: "",
      }
    );

    expect(guidance).toEqual({
      message:
        "Guidance could not be generated in the expected format. Please try again.",
      links: [],
      googleSearch: "learn cursor",
      steps: [],
    });
  });

  it("looksLikeStructuredOutput detects broken json-like content", () => {
    expect(looksLikeStructuredOutput('{"message":"hello"}')).toBe(true);
    expect(looksLikeStructuredOutput('"message": "hello"')).toBe(true);
    expect(looksLikeStructuredOutput("Start with the docs")).toBe(false);
  });

  it("getFallbackGuidance prefers todo title for google search", () => {
    const guidance = getFallbackGuidance({
      todoTitle: "assemble desk",
      userMessage: "with one person",
    });

    expect(guidance).toEqual({
      message:
        "Guidance could not be generated in the expected format. Please try again.",
      links: [],
      googleSearch: "assemble desk",
      steps: [],
    });
  });

  it("getGuidance throws when the OpenAI API key is missing", async () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(
      getGuidance({
        todoTitle: "assemble desk",
        userMessage: "with one person",
      })
    ).rejects.toEqual(
      expect.objectContaining({
        message:
          "AI guidance is temporarily unavailable. Please try again in a moment.",
      })
    );

    await expect(
      getGuidance({
        todoTitle: "assemble desk",
        userMessage: "with one person",
      })
    ).rejects.toBeInstanceOf(AiServiceUnavailableError);

    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  });
});
