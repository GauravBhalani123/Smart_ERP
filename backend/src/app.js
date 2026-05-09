import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no Origin header)
      if (!origin) return callback(null, true);

      // Allow configured origin
      if (origin === env.clientOrigin) return callback(null, true);

      // Dev-friendly: allow any localhost port (Vite often changes ports)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
