import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";

export async function transcribeAudio(buffer, filename = "voice.webm", language = "en") {
  if (!env.whisperApiKey) {
    throw new Error("WHISPER_API_KEY is not configured");
  }

  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("language", language);
  form.append("file", buffer, filename);

  const response = await axios.post(env.whisperApiUrl, form, {
    headers: {
      Authorization: `Bearer ${env.whisperApiKey}`,
      ...form.getHeaders(),
    },
    maxBodyLength: Infinity,
  });

  return response.data?.text || "";
}
