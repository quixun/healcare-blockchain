import { useState } from "react";
import { fetchAIResponse } from "../../services/ai-chat-bot";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export type AIMessage = {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
};

const AIChatScreen = () => {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: AIMessage }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSendMessage = async (newMessages: AIMessage[]) => {
    setMessages((prev) => [
      ...prev,
      ...newMessages.map((msg) => ({ role: "user" as const, content: msg })),
    ]);

    setLoading(true);
    setError(false);

    try {
      const aiResponse = await fetchAIResponse(newMessages);
      const aiContent =
        aiResponse?.choices?.[0]?.message?.content || "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "ai" as const, content: { type: "text", text: aiContent } },
      ]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4 mt-24 bg-white w-[90%] max-w-lvh rounded-lg flex flex-col">
      <div className="overflow-y-auto scrollbar-hide max-h-screen flex-1 space-y-3 p-2">
        <ChatMessages messages={messages} />
        {loading && <p className="text-gray-500">AI is typing...</p>}
      </div>
      {error && (
        <div className="p-2 text-red-500 text-sm flex items-center">
          <p>Error fetching response.</p>
          <button
            onClick={() => handleSendMessage([])}
            className="ml-2 text-blue-500 flex items-center"
          >
            Retry
          </button>
        </div>
      )}
      <ChatInput onSendMessage={handleSendMessage} loading={loading} />
      <footer>
        © 2023 [Your Company Name]. All rights reserved. Privacy Policy | Terms
        of Service | Contact Us
      </footer>
    </div>
  );
};

export default AIChatScreen;
