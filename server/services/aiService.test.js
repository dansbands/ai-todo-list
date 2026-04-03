const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AiServiceUnavailableError,
  buildPrompt,
  getFallbackGuidance,
  getGuidance,
  isSafeHttpUrl,
  normalizeGuidance,
  parseModelContent,
  looksLikeStructuredOutput,
} = require("./aiService");

test("buildPrompt includes task title and exact response schema", () => {
  const prompt = buildPrompt({
    todoTitle: "plan a trip to Montreal",
    userMessage: "I only have a weekend",
  });

  assert.match(prompt, /plan a trip to Montreal/);
  assert.match(prompt, /I only have a weekend/);
  assert.match(
    prompt,
    /"steps":\["string"\]/
  );
  assert.match(prompt, /Never invent URLs/);
  assert.match(prompt, /Do not confuse similarly named products/);
});

test("normalizeGuidance returns the expected schema for partial payloads", () => {
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

  assert.deepEqual(guidance, {
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

test("normalizeGuidance safely normalizes legacy raw response payloads", () => {
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

  assert.deepEqual(guidance, {
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

test("normalizeGuidance drops unsafe link protocols", () => {
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

  assert.deepEqual(guidance.links, [
    {
      linkTitle: "Safe",
      url: "https://example.com",
      description: "Allowed",
    },
  ]);
});

test("isSafeHttpUrl rejects localhost and private network destinations", () => {
  assert.equal(isSafeHttpUrl("http://localhost:3000/docs"), false);
  assert.equal(isSafeHttpUrl("http://127.0.0.1/metadata"), false);
  assert.equal(isSafeHttpUrl("http://169.254.169.254/latest/meta-data"), false);
  assert.equal(isSafeHttpUrl("https://192.168.1.10/internal"), false);
  assert.equal(isSafeHttpUrl("https://example.com/docs"), true);
});

test("parseModelContent strips code fences and trailing commas", () => {
  const guidance = parseModelContent(
    '```json\n{"message":"Do this","links":[],"googleSearch":"test","steps":["one",],}\n```',
    { todoTitle: "test task" }
  );

  assert.deepEqual(guidance, {
    message: "Do this",
    links: [],
    googleSearch: "test",
    steps: ["one"],
  });
});

test("parseModelContent falls back safely for invalid model output", () => {
  const guidance = parseModelContent("not valid json", {
    todoTitle: "replace bike tire",
    userMessage: "with basic tools",
  });

  assert.deepEqual(guidance, {
    message: "not valid json",
    links: [],
    googleSearch: "replace bike tire",
    steps: [],
  });
});

test("parseModelContent does not leak broken json-like output into the fallback message", () => {
  const guidance = parseModelContent(
    '{"message":"Start here","links":[{"linkTitle":"Broken",json "url":"https://example.com"}]}',
    {
      todoTitle: "learn cursor",
      userMessage: "",
    }
  );

  assert.deepEqual(guidance, {
    message:
      "Guidance could not be generated in the expected format. Please try again.",
    links: [],
    googleSearch: "learn cursor",
    steps: [],
  });
});

test("looksLikeStructuredOutput detects broken json-like content", () => {
  assert.equal(looksLikeStructuredOutput('{"message":"hello"}'), true);
  assert.equal(looksLikeStructuredOutput('"message": "hello"'), true);
  assert.equal(looksLikeStructuredOutput("Start with the docs"), false);
});

test("getFallbackGuidance prefers todo title for google search", () => {
  const guidance = getFallbackGuidance({
    todoTitle: "assemble desk",
    userMessage: "with one person",
  });

  assert.deepEqual(guidance, {
    message:
      "Guidance could not be generated in the expected format. Please try again.",
    links: [],
    googleSearch: "assemble desk",
    steps: [],
  });
});

test("getGuidance throws when the OpenAI API key is missing", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  await assert.rejects(
    getGuidance({
      todoTitle: "assemble desk",
      userMessage: "with one person",
    }),
    (error) =>
      error instanceof AiServiceUnavailableError &&
      error.message ===
        "AI guidance is temporarily unavailable. Please try again in a moment."
  );

  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalApiKey;
  }
});
