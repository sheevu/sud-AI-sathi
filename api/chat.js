// pages/api/chat.js

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userPrompt, metadata } = req.body;

  try {
    const response = await openai.beta.threads.createAndRun({
      assistant_id: "asst_dkKxFMzOLScKKnXs07SyRtnM", // Replace with your real Agent ID
      thread: {
        messages: [
          {
            role: "user",
            content: userPrompt,
            metadata: metadata || {}
          }
        ],
      },
    });

    res.status(200).json({ reply: response });
  } catch (error) {
    console.error("Error with OpenAI Agent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
