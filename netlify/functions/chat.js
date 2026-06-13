// netlify/functions/chat.js
// Relais sécurisé vers l'API Anthropic avec prompt caching

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages, system } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: [
          {
            type: "text",
            text: system,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages: messages,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Erreur chat.js :", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur serveur" }),
    };
  }
};
