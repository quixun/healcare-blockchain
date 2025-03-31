import { AIMessage } from "./AIChatScreen";

type Props = {
  messages: { role: "user" | "ai"; content: AIMessage }[];
};

const ChatMessages = ({ messages }: Props) => {
  return (
    <div className="space-y-3">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`p-2 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-500 text-white text-right"
                : "bg-gray-200"
            }`}
          >
            {msg.content.type === "text" && <p>{msg.content.text}</p>}
            {msg.content.type === "image_url" && msg.content.image_url?.url && (
              <img
                src={msg.content.image_url.url}
                alt="Sent"
                className="w-24 h-24 rounded-lg mt-1"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
