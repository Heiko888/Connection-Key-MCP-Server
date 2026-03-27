import express from "express";
import axios from "axios";
import { config } from "../config.js";

const router = express.Router();
const READING_WORKER_URL = config.readingAgent.url;
const TIMEOUT = config.readingAgent.timeout || 300000;

// Proxy alle /api/live-reading/* Requests an den reading-worker
router.all("*", async (req, res) => {
  const targetUrl = `${READING_WORKER_URL}/api/live-reading${req.path}`;
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: TIMEOUT,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ success: false, error: "Reading-Worker nicht erreichbar", detail: err.message });
    }
  }
});

export default router;
