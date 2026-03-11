const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authorizationHeader = req.get("authorization");

  if (!authorizationHeader) {
    return res.status(401).send({ error: "Access denied. No token provided" });
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return res.status(401).send({ error: "Invalid authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    if (!decoded || !decoded._id) {
      return res.status(401).send({ error: "Invalid token payload" });
    }

    req.user = {
      ...decoded,
      _id: String(decoded._id),
    };

    return next();
  } catch (error) {
    return res.status(401).send({ error: "Invalid or expired token" });
  }
};

module.exports = auth;