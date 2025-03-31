import { AIMessage } from "../components/chat/chat-ai";

export const fetchAIResponse = async (userMessages: AIMessage[]) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-2024-11-20",
          max_tokens: 500,
          messages: userMessages.map((msg) => ({
            role: "user",
            content: msg.type === "text" ? msg.text : msg.image_url?.url,
          })),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
};
