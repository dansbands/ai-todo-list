const axios = require("axios");

const DEFAULT_GUIDANCE_MESSAGE =
  "Guidance could not be generated in the expected format. Please try again.";
const AI_UNAVAILABLE_MESSAGE =
  "AI guidance is temporarily unavailable. Please try again in a moment.";

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getFallbackGuidance = ({ todoTitle = "", userMessage = "", rawContent = "" } = {}) => ({
  message:
    typeof rawContent === "string" && rawContent.trim()
      ? rawContent.trim()
      : DEFAULT_GUIDANCE_MESSAGE,
  links: [],
  googleSearch:
    typeof todoTitle === "string" && todoTitle.trim()
      ? todoTitle.trim()
      : typeof userMessage === "string"
        ? userMessage.trim()
        : "",
  steps: [],
});

const normalizeLink = (link) => {
  if (!isPlainObject(link)) {
    return null;
  }

  const linkTitle = typeof link.linkTitle === "string" ? link.linkTitle.trim() : "";
  const url = typeof link.url === "string" ? link.url.trim() : "";
  const description =
    typeof link.description === "string" ? link.description.trim() : "";

  if (!linkTitle || !url) {
    return null;
  }

  return {
    linkTitle,
    url,
    description,
  };
};

const normalizeSteps = (steps, message) => {
  if (Array.isArray(steps)) {
    return steps
      .filter((step) => typeof step === "string")
      .map((step) => step.trim())
      .filter(Boolean);
  }

  if (typeof steps === "string" && steps.trim()) {
    return [steps.trim()];
  }

  if (typeof message === "string") {
    return message
      .split(/\n|\d+\.\s+|•\s+|\-\s+/)
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  return [];
};

const normalizeGuidance = (payload, context = {}) => {
  if (!isPlainObject(payload)) {
    return getFallbackGuidance(context);
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const links = Array.isArray(payload.links)
    ? payload.links.map(normalizeLink).filter(Boolean)
    : [];
  const googleSearch =
    typeof payload.googleSearch === "string" ? payload.googleSearch.trim() : "";
  const steps = normalizeSteps(payload.steps, message);

  return {
    message: message || DEFAULT_GUIDANCE_MESSAGE,
    links,
    googleSearch:
      googleSearch ||
      (typeof context.todoTitle === "string" ? context.todoTitle.trim() : "") ||
      (typeof context.userMessage === "string" ? context.userMessage.trim() : ""),
    steps,
  };
};

const parseModelContent = (content, context) => {
  if (!content || typeof content !== "string") {
    return getFallbackGuidance(context);
  }

  const normalizedContent = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return normalizeGuidance(JSON.parse(normalizedContent), {
      ...context,
      rawContent: normalizedContent,
    });
  } catch (error) {
    try {
      return normalizeGuidance(
        JSON.parse(normalizedContent.replace(/,\s*([}\]])/g, "$1")),
        {
          ...context,
          rawContent: normalizedContent,
        }
      );
    } catch (parseError) {
      return getFallbackGuidance({
        ...context,
        rawContent: normalizedContent,
      });
    }
  }
};

const buildPrompt = ({ todoTitle = "", userMessage = "" }) => {
  const trimmedTitle = typeof todoTitle === "string" ? todoTitle.trim() : "";
  const trimmedUserMessage =
    typeof userMessage === "string" ? userMessage.trim() : "";
  const subject = trimmedTitle || trimmedUserMessage;

  return [
    `You are helping a user complete this task: ${subject || "their task"}.`,
    trimmedUserMessage
      ? `Additional user context: ${trimmedUserMessage}`
      : "Provide practical guidance based on the task title.",
    "Return only valid JSON with this exact shape:",
    '{"message":"string","links":[{"linkTitle":"string","url":"string","description":"string"}],"googleSearch":"string","steps":["string"]}',
    "Do not include markdown code fences, comments, or trailing commas.",
    "Keep links relevant and steps actionable.",
  ].join(" ");
};

const getAiErrorMessage = (error) => {
  if (typeof error?.response?.data?.error?.message === "string") {
    return error.response.data.error.message;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Unknown AI service error";
};

const getGuidance = async ({ todoTitle = "", userMessage = "" }) => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not configured");
    return getFallbackGuidance({
      todoTitle,
      userMessage,
      rawContent: AI_UNAVAILABLE_MESSAGE,
    });
  }

  const prompt = buildPrompt({ todoTitle, userMessage });

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    return parseModelContent(content, {
      todoTitle,
      userMessage,
    });
  } catch (error) {
    console.error("AI guidance request failed:", getAiErrorMessage(error));

    return getFallbackGuidance({
      todoTitle,
      userMessage,
      rawContent: AI_UNAVAILABLE_MESSAGE,
    });
  }
};

module.exports = {
  buildPrompt,
  getGuidance,
  normalizeGuidance,
  parseModelContent,
  getFallbackGuidance,
};