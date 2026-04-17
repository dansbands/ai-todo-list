import jwt from "jsonwebtoken";

const getAuthorizationToken = (request) => {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    return { error: "Access denied. No token provided" };
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return { error: "Invalid authorization header" };
  }

  return { token };
};

export const getAuthUser = (request) => {
  const tokenResult = getAuthorizationToken(request);

  if (tokenResult.error) {
    return { error: tokenResult.error };
  }

  try {
    const decoded = jwt.verify(tokenResult.token, process.env.JWT_PRIVATE_KEY);

    if (!decoded || !decoded._id) {
      return { error: "Invalid token payload" };
    }

    return {
      user: {
        ...decoded,
        _id: String(decoded._id),
      },
    };
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
};

export const getOptionalUserFromAuthorization = (request) => {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    if (!decoded || !decoded._id) {
      return null;
    }

    return {
      ...decoded,
      _id: String(decoded._id),
    };
  } catch (error) {
    return null;
  }
};
