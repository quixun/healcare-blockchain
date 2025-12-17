import { AIMessage } from "../components/chat/AIChatScreen";

const SYSTEM_PROMPT = `
You are a specialized Health and Wellness Assistant. 
STRICT RULES:
1. You must ONLY answer questions related to health, medicine, body, exercise, diet, or mental health.
2. If a user asks about a different topic, politely refuse.
`;

export const fetchAIResponse = async (userMessages: AIMessage[]) => {
  try {
    // FIX: Set a reasonable max_tokens limit (e.g., 1024) to prevent exceeding the affordable token count.
    const MAX_RESPONSE_TOKENS = 1024;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          // Note: Reverting to the previous model name or using a known free/cheap model.
          // The model "openai/gpt-5.2-chat" is not a standard OpenAI model name.
          model: "meta-llama/llama-3.1-70b-instruct",
          max_tokens: MAX_RESPONSE_TOKENS,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...userMessages.map((msg) => ({
              role: msg.role,
              content: msg.type === "text" ? msg.text : msg.image_url?.url,
            })),
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        `HTTP error! Status: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return null;
  }
};
