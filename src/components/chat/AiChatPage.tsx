import { useCallback, useEffect, useState } from "react";
import {
  fetchMessagesFromFirestore,
  ChatMessage,
} from "../../services/chat-service/chat-service";
import AIChatScreen from "./AIChatScreen";
// NOTE: ChatHistory seems to have been removed from FloatingChatContent,
// so I'm removing the import here as well to match your current code.
// import ChatHistory from "./ChatHistory";
import { RootState } from "../../features/store";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, HeartPulse } from "lucide-react"; // Added HeartPulse icon

// ----------------------------------------------------------------------
// 1. NEW: COLORFUL HEADER COMPONENT
// ----------------------------------------------------------------------
const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md rounded-t-xl">
      <div className="flex items-center space-x-3">
        {/* Icon */}
        <HeartPulse size={24} className="text-white" />
        {/* Title */}
        <h3 className="text-lg font-semibold">Health Assistant Chat</h3>
      </div>
      {/* Optional: You could add connection status or another small button here */}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. FloatingChatContent: Integrate the new header
// ----------------------------------------------------------------------
const FloatingChatContent = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    ChatMessage[]
  >([]);
  const { address } = useSelector((state: RootState) => state.account);

  const getConversationId = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}-${Math.floor(date.getTime() / (1000 * 60 * 30))}`;
  };

  const groupMessagesByConversation = useCallback((messages: ChatMessage[]) => {
    const grouped: Record<string, { id: string; messages: ChatMessage[] }> = {};

    messages.forEach((msg) => {
      const conversationId = getConversationId(msg.timestamp);
      if (!grouped[conversationId]) {
        grouped[conversationId] = { id: conversationId, messages: [] };
      }
      grouped[conversationId].messages.push(msg);
    });

    return Object.values(grouped).sort(
      (a, b) => b.messages[0].timestamp - a.messages[0].timestamp
    );
  }, []);

  useEffect(() => {
    if (!address) return;
    const unsubscribe = fetchMessagesFromFirestore(address, (messages) => {
      if (messages.length > 0) {
        const latestConversation = groupMessagesByConversation(messages)[0];
        if (latestConversation) {
          setSelectedConversation(latestConversation.messages);
        }
      }
    });

    return () => unsubscribe();
  }, [groupMessagesByConversation, address]);

  return (
    <div className="z-30 w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
      <ChatHeader />

      <div className="flex-1 overflow-hidden">
        <AIChatScreen initialMessages={selectedConversation} />
      </div>
    </div>
  );
};

const ChatPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useSelector((state: RootState) => state.account);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  if (!address) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 w-full max-w-sm h-[600px] z-[1000] origin-bottom-right"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <FloatingChatContent />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-[1001] p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition duration-300 ease-in-out"
        aria-label={isOpen ? "Close Chat" : "Open Chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </>
  );
};

export default ChatPage;
