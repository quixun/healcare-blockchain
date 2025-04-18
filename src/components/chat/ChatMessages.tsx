import { AIMessage } from "./AIChatScreen";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 

type Props = {
  messages: { role: "user" | "ai"; content: AIMessage }[];
};

const ChatMessages = ({ messages }: Props) => {
  return (
    <div className="space-y-3">
      {messages.map((msg, index) => {
        const contentText =
          msg.content.type === "text" &&
          msg.content.text === "No response received."
            ? "Tôi không thể trả lời câu hỏi này"
            : msg.content.text;

        return (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-500 text-white text-right"
                  : "bg-gray-200"
              }`}
            >
              {msg.content.type === "text" && (
                <div className="prose prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {contentText}
                  </ReactMarkdown>
                </div>
              )}
              {msg.content.type === "image_url" &&
                msg.content.image_url?.url && (
                  <img
                    src={msg.content.image_url.url}
                    alt="Sent"
                    className="w-24 h-24 rounded-lg mt-1"
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
