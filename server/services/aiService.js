const axios = require("axios");
const dns = require("node:dns").promises;
const net = require("node:net");

const DEFAULT_GUIDANCE_MESSAGE =
  "Guidance could not be generated in the expected format. Please try again.";
const AI_UNAVAILABLE_MESSAGE =
  "AI guidance is temporarily unavailable. Please try again in a moment.";

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isSafeHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const parsedUrl = new URL(value.trim());
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
      return false;
    }

    if (isPrivateOrLocalIp(hostname)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const ipv4ToLong = (ip) =>
  ip.split(".").reduce((accumulator, segment) => accumulator * 256 + Number(segment), 0);

const isPrivateIpv4 = (ip) => {
  const normalizedIp = ip.trim();
  const ipAsLong = ipv4ToLong(normalizedIp);
  const rangeStart = (value) => ipv4ToLong(value.split("/")[0]);
  const rangeMask = (cidr) => Number(cidr.split("/")[1]);
  const inRange = (cidr) => {
    const mask = rangeMask(cidr);
    const shift = 32 - mask;
    return (ipAsLong >>> shift) === (rangeStart(cidr) >>> shift);
  };

  return [
    "0.0.0.0/8",
    "10.0.0.0/8",
    "100.64.0.0/10",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "172.16.0.0/12",
    "192.0.0.0/24",
    "192.0.2.0/24",
    "192.168.0.0/16",
    "198.18.0.0/15",
    "198.51.100.0/24",
    "203.0.113.0/24",
    "224.0.0.0/4",
    "240.0.0.0/4",
  ].some(inRange);
};

const isPrivateIpv6 = (ip) => {
  const normalizedIp = ip.toLowerCase();

  if (normalizedIp === "::" || normalizedIp === "::1") {
    return true;
  }

  if (normalizedIp.startsWith("fc") || normalizedIp.startsWith("fd")) {
    return true;
  }

  if (normalizedIp.startsWith("fe8") || normalizedIp.startsWith("fe9")) {
    return true;
  }

  if (normalizedIp.startsWith("fea") || normalizedIp.startsWith("feb")) {
    return true;
  }

  if (normalizedIp.startsWith("ff")) {
    return true;
  }

  if (normalizedIp.startsWith("::ffff:")) {
    const mappedIpv4 = normalizedIp.slice(7);
    return net.isIP(mappedIpv4) === 4 && isPrivateIpv4(mappedIpv4);
  }

  return false;
};

const isPrivateOrLocalIp = (host) => {
  const ipVersion = net.isIP(host);
  if (ipVersion === 4) {
    return isPrivateIpv4(host);
  }

  if (ipVersion === 6) {
    return isPrivateIpv6(host);
  }

  return false;
};

const resolvesToPublicIp = async (hostname) => {
  try {
    const dnsResults = await dns.lookup(hostname, { all: true, verbatim: true });
    if (!dnsResults.length) {
      return false;
    }

    return dnsResults.every((result) => !isPrivateOrLocalIp(result.address));
  } catch (error) {
    return false;
  }
};

const looksLikeStructuredOutput = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();

  return (
    trimmedValue.startsWith("{") ||
    trimmedValue.startsWith("[") ||
    /"message"\s*:|"links"\s*:|"steps"\s*:/.test(trimmedValue)
  );
};

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

  if (!linkTitle || !isSafeHttpUrl(url)) {
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

const getLegacyChoiceMessage = (payload) => {
  if (!Array.isArray(payload.choices) || !payload.choices.length) {
    return "";
  }

  const firstChoice = payload.choices[0];
  if (!isPlainObject(firstChoice) || !isPlainObject(firstChoice.message)) {
    return "";
  }

  return typeof firstChoice.message.content === "string"
    ? firstChoice.message.content.trim()
    : "";
};

const normalizeGuidance = (payload, context = {}) => {
  if (!isPlainObject(payload)) {
    return getFallbackGuidance(context);
  }

  const message =
    (typeof payload.message === "string" ? payload.message.trim() : "") ||
    getLegacyChoiceMessage(payload);
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

const verifyUrlExists = async (url) => {
  if (!isSafeHttpUrl(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const isPublicHost = await resolvesToPublicIp(parsedUrl.hostname);
    if (!isPublicHost) {
      return false;
    }

    const response = await axios.get(url, {
      timeout: 4000,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    return response.status >= 200 && response.status < 400;
  } catch (error) {
    return false;
  }
};

const verifyGuidanceLinks = async (guidance) => {
  if (!isPlainObject(guidance) || !Array.isArray(guidance.links) || !guidance.links.length) {
    return guidance;
  }

  const verificationResults = await Promise.all(
    guidance.links.map(async (link) => ({
      link,
      isVerified: await verifyUrlExists(link.url),
    }))
  );

  return {
    ...guidance,
    links: verificationResults
      .filter((result) => result.isVerified)
      .map((result) => result.link),
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
      if (looksLikeStructuredOutput(normalizedContent)) {
        return getFallbackGuidance(context);
      }

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
    "Only include links you are highly confident are real, directly relevant, and publicly accessible.",
    "Prefer official product documentation or established documentation sources.",
    "Never invent URLs, domains, slugs, or pages. If you are not sure a link is real, return an empty links array.",
    "Do not confuse similarly named products, languages, or concepts. If the task is ambiguous, explain the ambiguity briefly and use googleSearch instead of guessing links.",
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

class AiServiceUnavailableError extends Error {
  constructor(message = AI_UNAVAILABLE_MESSAGE, options = {}) {
    super(message);
    this.name = "AiServiceUnavailableError";
    this.statusCode = options.statusCode || 503;
  }
}

const getGuidance = async ({ todoTitle = "", userMessage = "" }) => {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not configured");
    throw new AiServiceUnavailableError();
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
        timeout: 15000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    const guidance = parseModelContent(content, {
      todoTitle,
      userMessage,
    });

    return verifyGuidanceLinks(guidance);
  } catch (error) {
    console.error("AI guidance request failed:", getAiErrorMessage(error));

    throw new AiServiceUnavailableError();
  }
};

module.exports = {
  AiServiceUnavailableError,
  buildPrompt,
  getGuidance,
  normalizeGuidance,
  parseModelContent,
  getFallbackGuidance,
  looksLikeStructuredOutput,
  isSafeHttpUrl,
};
