import { useCallback, useEffect, useState } from "react";
import {
  fetchMessagesFromFirestore,
  ChatMessage,
} from "../../services/chat-service/chat-service";
import AIChatScreen from "./AIChatScreen";
import ChatHistory from "./ChatHistory";
import { RootState } from "../../features/store";
import { useSelector } from "react-redux";
import { motion } from "motion/react";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    ChatMessage[]
  >([]);
  const { address } = useSelector((state: RootState) => state.account);

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
    ); // Sort by latest timestamp
  }, []);

  useEffect(() => {
    if (!address) return;
    const unsubscribe = fetchMessagesFromFirestore(address, (messages) => {
      if (messages.length > 0) {
        const latestConversation = groupMessagesByConversation(messages)[0]; // Get latest conversation
        if (latestConversation) {
          setSelectedConversation(latestConversation.messages);
        }
      }
    });

    return () => unsubscribe();
  }, [groupMessagesByConversation, address]);

  const getConversationId = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}-${Math.floor(date.getTime() / (1000 * 60 * 30))}`;
  };

  return (
    <div className="">
      <div className="flex-1 h-screen flex justify-center items-center relative">
        <motion.div
          className="z-30 w-full h-full flex rounded-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ChatHistory onSelectConversation={setSelectedConversation} />
          <AIChatScreen initialMessages={selectedConversation} />
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
