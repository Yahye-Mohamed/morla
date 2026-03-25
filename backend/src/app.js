import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler, notFound } from "./middleware/error.js";
import routes from "./routes/index.js";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(helmet());
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (request, response) => {
  response.json({
    status: "ok",
    app: "Morla Cafe API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
