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

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.resolve(__dirname, "../public");

// Serve static files with explicit extensions
app.use(express.static(publicPath, {
  extensions: ['html', 'js', 'css'],
  index: false
}));

app.use("/api", routes);

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ message: "Not found" });
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error", error: err.message, stack: process.env.NODE_ENV === "production" ? null : err.stack });
});

export default app;
