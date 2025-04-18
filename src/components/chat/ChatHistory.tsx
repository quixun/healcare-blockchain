import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  fetchMessagesFromFirestore,
  deleteConversationFromFirestore,
  ChatMessage,
} from "../../services/chat-service/chat-service";
import { RootState } from "../../features/store";
import { useSelector } from "react-redux";

type ChatHistoryItem = {
  id: string;
  summary: string;
  messages: ChatMessage[];
};

const ChatHistory = ({
  onSelectConversation,
}: {
  onSelectConversation: (messages: ChatMessage[]) => void;
}) => {
  const [conversations, setConversations] = useState<ChatHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useSelector((state: RootState) => state.account);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getWidth = () => {
    if (isOpen) {
      if (screenWidth >= 1024) {
        // lg breakpoint
        return "20%";
      } else if (screenWidth >= 768) {
        // md breakpoint
        return "30%";
      } else {
        // smaller screens
        return "50%";
      }
    } else {
      return "1%";
    }
  };

  const groupMessagesByConversation = useCallback(
    (messages: ChatMessage[]): ChatHistoryItem[] => {
      const grouped: Record<string, ChatHistoryItem> = {};

      messages.forEach((msg) => {
        const conversationId = getConversationId(msg.timestamp);

        if (!grouped[conversationId]) {
          grouped[conversationId] = {
            id: conversationId,
            summary:
              msg.content.type === "text" && msg.content.text
                ? msg.content.text.slice(0, 30) + "..."
                : "Image conversation",
            messages: [],
          };
        }
        grouped[conversationId].messages.push(msg);
      });

      return Object.values(grouped).sort(
        (a, b) => b.messages[0].timestamp - a.messages[0].timestamp
      );
    },
    []
  );

  useEffect(() => {
    if (!address) return;
    const unsubscribe = fetchMessagesFromFirestore(address, (messages) => {
      const grouped = groupMessagesByConversation(messages);
      setConversations(grouped);
    });

    return () => unsubscribe();
  }, [groupMessagesByConversation, address]);

  const handleDeleteConversation = async (conversationId: string) => {
    if (!address) return;
    await deleteConversationFromFirestore(address, conversationId);
  };

  const getConversationId = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}-${Math.floor(date.getTime() / (1000 * 60 * 30))}`;
  };

  const handleNewConversation = async () => {
    if (!address) return;

    const newConversation: ChatHistoryItem = {
      id: `new-${Date.now()}`,
      summary: "New conversation...",
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);

    onSelectConversation([]);
  };

  return (
    <motion.div
      animate={{ width: getWidth() }}
      className="absolute left-0 top-0 bg-white rounded-lg shadow-xl h-full max-w-lg flex flex-col"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-700 duration-200 cursor-pointer ease-in-out text-white p-1 rounded-full shadow-2xl"
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      {isOpen && (
        <div className="p-3 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Lịch sử chat</h2>
            <button
              onClick={handleNewConversation}
              className="bg-blue-500 duration-200 cursor-pointer ease-in-out text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="p-2 rounded-md bg-gray-100 cursor-pointer flex justify-between items-center hover:bg-gray-200 transition"
              >
                <p
                  className="truncate flex-1"
                  onClick={() => onSelectConversation(conv.messages)}
                >
                  {conv.summary}
                </p>
                <button
                  className="text-red-500 hover:text-red-700 p-1 duration-200 cursor-pointer ease-in-out"
                  onClick={() => handleDeleteConversation(conv.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatHistory;
