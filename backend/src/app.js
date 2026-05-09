import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", routes);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ message: "Not found" });
  const indexPath = path.join(__dirname, "../public/index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("FAILED TO SEND INDEX.HTML:", err);
      res.status(500).json({ message: "Frontend not found. Please check build logs.", path: indexPath });
    }
  });
});

app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error", error: err.message, stack: process.env.NODE_ENV === "production" ? null : err.stack });
});

export default app;
