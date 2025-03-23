// pages/api/chat.js

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userPrompt, metadata } = req.body;

  if (!userPrompt || !process.env.OPENAI_API_KEY) {
    return res.status(400).json({ error: "Missing prompt or API key" });
  }

  try {
    // 1. Create thread
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: userPrompt,
          metadata: metadata || {},
        },
      ],
    });

    // 2. Run assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_dkKxFMzOLScKKnXs07SyRtnM", // replace with your real ID
    });

    // 3. Wait for run to complete
    let status = run.status;
    let completedRun = run;
    while (status !== "completed" && status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      completedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = completedRun.status;
    }

    if (status === "failed") {
      return res.status(500).json({ error: "Run failed" });
    }

    // 4. Get messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((m) => m.role === "assistant");

    res.status(200).json({ reply: lastMessage?.content?.[0]?.text?.value || "No reply" });
  } catch (err) {
    console.error("Error with OpenAI Agent:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
