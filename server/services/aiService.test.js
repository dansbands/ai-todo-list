const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildPrompt,
  getFallbackGuidance,
  normalizeGuidance,
  parseModelContent,
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
