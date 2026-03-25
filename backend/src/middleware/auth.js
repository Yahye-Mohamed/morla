import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "morla-cafe-admin-secret";

export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: "Authentication required." });
  }

  try {
    request.admin = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Token is invalid or expired." });
  }
}
