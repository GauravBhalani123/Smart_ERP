import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  whisperApiKey: process.env.WHISPER_API_KEY || "",
  whisperApiUrl: process.env.WHISPER_API_URL || "https://api.openai.com/v1/audio/transcriptions",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required.");
}
