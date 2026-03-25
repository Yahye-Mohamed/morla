import { signAdminToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin@morla.cafe";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "morla1234";
const ADMIN_NAME = process.env.ADMIN_NAME || "Morla Admin";

export const loginAdmin = asyncHandler(async (request, response) => {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    return response.status(400).json({ message: "Username and password are required." });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return response.status(401).json({ message: "Invalid admin credentials." });
  }

  const admin = {
    name: ADMIN_NAME,
    username: ADMIN_USERNAME,
    role: "admin",
  };

  const token = signAdminToken(admin);

  return response.json({
    token,
    admin,
  });
});

export const getCurrentAdmin = asyncHandler(async (request, response) => {
  return response.json({
    admin: {
      name: request.admin?.name || ADMIN_NAME,
      username: request.admin?.username || ADMIN_USERNAME,
      role: request.admin?.role || "admin",
    },
  });
});
