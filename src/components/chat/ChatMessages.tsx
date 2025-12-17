import { AIMessage } from "./AIChatScreen";
import { ChatMessage } from "../../services/chat-service/chat-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  // Use the ChatMessage type imported from your service
  messages: ChatMessage[];
};

const ChatMessages = ({ messages }: Props) => {
  return (
    <div className="space-y-3 px-2">
      {messages.map((msg, index) => {
        // Access content safely
        const content = msg.content as AIMessage;

        // Handle "No response" text
        const contentText =
          content.type === "text" && content.text === "No response received."
            ? "Tôi không thể trả lời câu hỏi này"
            : content.text;

        const isUser = msg.role === "user";

        return (
          <div
            key={index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${
                isUser ? "bg-blue-500 text-white text-right" : "bg-gray-200"
              }`}
            >
              {content.type === "text" && (
                <div
                  className={`prose prose-sm ${
                    isUser ? "text-white" : "text-black"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {contentText}
                  </ReactMarkdown>
                </div>
              )}

              {/* Check for image type. Note: ChatInput uses type="image" or "image_url" logic */}
              {(content.type === ("image" as unknown) ||
                content.type === ("image_url" as unknown)) &&
                content.image_url?.url && (
                  <img
                    src={content.image_url.url}
                    alt="Sent"
                    className="w-24 h-24 rounded-lg mt-1 object-cover"
                  />
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
