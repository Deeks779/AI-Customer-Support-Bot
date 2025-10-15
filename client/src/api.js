import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // adjust if deployed
});

export const startSession = () => API.post("/session/start");
export const sendMessage = (sessionId, message) =>
  API.post("/chat", { session_id: sessionId, message });
export const getSummary = (sessionId) => API.get(`/summary/${sessionId}`);
