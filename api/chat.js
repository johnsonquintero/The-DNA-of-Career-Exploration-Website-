export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  // Keep your API key on the server
  const apiKey = process.env.CLIENT_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "CLIENT_KEY is missing from Vercel Environment Variables."
    });
  }

  try {
    const { prompt, systemPrompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "A valid prompt is required."
      });
    }

    // YOUR MODEL: GEMINI 3.5 FLASH-LITE
    const MODEL = "gemini-3.5-flash-lite";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: systemPrompt ||
                "You are BIO-BOT 9000, a friendly biotechnology career guide."
            }
          ]
        },

        contents: [
          {
            role: "user",
            parts: [
              { text: prompt }
            ]
          }
        ],

        generationConfig: {
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    // Show actual Gemini errors instead of hiding them
    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API request failed."
      });
    }

    const botReply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    if (!botReply) {
      console.error("Empty Gemini response:", data);

      return res.status(502).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      text: botReply,
      model: MODEL
    });

  } catch (error) {
    console.error("BIO-BOT server error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error."
    });
  }
}