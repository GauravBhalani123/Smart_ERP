import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE, apiRequest } from "../../lib/api";

const languages = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Gujarati", value: "gu" },
];

export default function FloatingAssistant() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);
  const [useWhisper, setUseWhisper] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const audioChunksRef = useRef([]);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  const synth = useMemo(() => window.speechSynthesis, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!token) return;
    apiRequest("/ai/chat/history", { token })
      .then((res) => {
        if (res[0]) {
          setConversationId(res[0].id);
          setMessages(res[0].messages.map((m) => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content })));
        }
      })
      .catch(() => {});
  }, [token]);

  async function sendPrompt(promptText) {
    if (!promptText.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: promptText }]);
    setInput("");
    try {
      const result = await apiRequest("/ai/chat", {
        method: "POST",
        token,
        body: { prompt: promptText, language, conversationId },
      });
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
      if (voiceEnabled) {
        const utterance = new SpeechSynthesisUtterance(result.answer);
        synth.speak(utterance);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    if (useWhisper) {
      startWhisperRecording();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === "hi" ? "hi-IN" : language === "gu" ? "gu-IN" : "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendPrompt(transcript);
    };
    recognition.start();
  }

  function stopVoiceInput() {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch {}

    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {}

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch {}

    recorderRef.current = null;
    setListening(false);
  }

  async function startWhisperRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstart = () => setListening(true);
      recorder.onstop = async () => {
        setListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");
        formData.append("language", language);
        try {
          const response = await fetch(`${API_BASE}/ai/voice/transcribe`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Whisper transcription failed");
          setInput(data.text);
          sendPrompt(data.text);
        } catch (error) {
          setMessages((prev) => [...prev, { role: "assistant", content: `Voice error: ${error.message}` }]);
        } finally {
          try {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
          } catch {}
          recorderRef.current = null;
        }
      };
      recorder.start();
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Microphone permission denied or unsupported." }]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500"
      >
        AI Assistant
      </button>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass fixed bottom-24 right-6 z-40 flex h-[70vh] w-[360px] flex-col rounded-xl p-3 max-sm:left-4 max-sm:right-4 max-sm:w-auto"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold">ERP AI Copilot</h4>
            <div className="flex items-center gap-2">
              <select className="rounded bg-slate-900 px-2 py-1 text-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <button className="rounded bg-slate-800 px-2 py-1 text-[10px]" onClick={() => setUseWhisper((v) => !v)}>
                {useWhisper ? "Whisper" : "Browser STT"}
              </button>
              <button 
                className={`rounded px-1.5 py-1 ${voiceEnabled ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`} 
                onClick={() => setVoiceEnabled((v) => !v)}
                title={voiceEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto rounded bg-slate-900/50 p-2 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`max-w-[92%] rounded px-3 py-2 ${m.role === "user" ? "ml-auto bg-indigo-600/70" : "bg-slate-700/70"}`}>
                {m.content}
              </div>
            ))}
            {loading ? <div className="text-xs text-slate-300">AI is typing...</div> : null}
            <div ref={endRef} />
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt(input)}
              className="flex-1 rounded bg-slate-900 p-2 text-sm"
              placeholder="Ask inventory, sales, invoice questions..."
            />
            <button onClick={() => sendPrompt(input)} className="rounded bg-indigo-600 px-3 text-sm">Send</button>
            {listening ? (
              <button onClick={stopVoiceInput} className="rounded bg-rose-600 px-3 text-sm hover:bg-rose-500">
                Stop
              </button>
            ) : (
              <button onClick={startVoiceInput} className="rounded bg-slate-700 px-3 text-sm hover:bg-slate-600">
                Mic
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </>
  );
}
