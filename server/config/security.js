const DEFAULT_DEVELOPMENT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const parseAllowedOrigins = (value) => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getAllowedOrigins = ({
  nodeEnv = process.env.NODE_ENV,
  allowedOrigins = process.env.CORS_ALLOWED_ORIGINS,
} = {}) => {
  const configuredOrigins = parseAllowedOrigins(allowedOrigins);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return nodeEnv === "development" ? DEFAULT_DEVELOPMENT_ORIGINS : [];
};

const createCorsOriginHandler = (allowedOrigins) => (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Not allowed by CORS"));
};

const createCorsOptions = (options = {}) => {
  const allowedOrigins = getAllowedOrigins(options);

  return {
    origin: createCorsOriginHandler(allowedOrigins),
    optionsSuccessStatus: 200,
  };
};

module.exports = {
  DEFAULT_DEVELOPMENT_ORIGINS,
  createCorsOptions,
  getAllowedOrigins,
  parseAllowedOrigins,
};
