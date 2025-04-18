import { AIMessage } from "../components/chat/AIChatScreen";

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
          model: "shisa-ai/shisa-v2-llama3.3-70b:free",
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
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return null;
  }
};
