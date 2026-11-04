export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.CLIENT_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "CLIENT_KEY is missing from Vercel Environment Variables." });
  }

  try {
    const { prompt, history, role, roleInfo } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt is required." });
    }

    const MODEL = "gemini-3.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    const systemPrompt = [
      "You are BIO-BOT 9000, a friendly, upbeat robot guide on a website called 'The DNA of Career Exploration'.",
      "Your audience is high school students in North Jersey exploring biotechnology careers.",
      "The site has four steps: Amino Acid Quiz, CRISPR Simulation, Industry Training (soft skills), and a Certification.",
      "Topics you help with: biotech careers, education paths, salaries, lab skills, CRISPR, DNA, New Jersey's biotech industry, and how to use this site.",
      "If asked something unrelated, answer briefly and steer back to biotech or career exploration.",
      "Be accurate. If you are not sure about something, say so instead of guessing.",
      "FORMAT RULES (very important): reply in plain text only. Never use asterisks, markdown, bullet symbols, headings, or backticks.",
      "Write in short conversational sentences, 2 to 4 sentences total unless the student asks for more detail. If you must list things, use a simple sentence like 'First..., then..., finally...'.",
      role ? `The student's matched career role is ${role}. ${roleInfo || ""}` : "The student has not taken the quiz yet; you can suggest it."
    ].join("\n");

    // Build multi-turn conversation (Gemini needs alternating roles starting with 'user')
    const contents = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (!turn || typeof turn.text !== "string") continue;
        const r = turn.role === "model" ? "model" : "user";
        if (contents.length === 0 && r !== "user") continue;
        if (contents.length && contents[contents.length - 1].role === r) continue;
        contents.push({ role: r, parts: [{ text: turn.text.slice(0, 1500) }] });
      }
      if (contents.length && contents[contents.length - 1].role === "user") contents.pop();
    }
    contents.push({ role: "user", parts: [{ text: prompt.slice(0, 600) }] });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API request failed."
      });
    }

    let botReply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!botReply) {
      console.error("Empty Gemini response:", data);
      return res.status(502).json({ error: "Gemini returned an empty response." });
    }

    // Backup: strip any markdown the model still sneaks in
    botReply = botReply
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/^\s*[*\-]\s+/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*`]/g, "")
      .trim();

    return res.status(200).json({ text: botReply, model: MODEL });

  } catch (error) {
    console.error("BIO-BOT server error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
}
