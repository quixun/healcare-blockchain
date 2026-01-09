import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAIResponse } from "../../services/ai-chat-bot";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import {
  addMessageToFirestore,
  ChatMessage,
} from "../../services/chat-service/chat-service";
import { RootState } from "../../features/store";
import { useSelector } from "react-redux";
import Web3Service from "../../services/web3Service";

// FIX 1: Change "image" to "image_url" to match ChatMessage type
export interface AIMessage {
  id: string;
  text: string;
  type: "text" | "image_url";
  image_url?: { url: string };
  role: "user" | "assistant";
}

const AIChatScreen = ({
  initialMessages,
}: {
  initialMessages: ChatMessage[];
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { address } = useSelector((state: RootState) => state.account);
  const web3 = Web3Service.getInstance().getWeb3();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // ... (fetchUploadedImages and useEffects remain the same) ...
  const fetchUploadedImages = useCallback(async (): Promise<string[]> => {
    try {
      if (!address) return [];
      const latestBlock = await web3.eth.getBlockNumber();
      const images: string[] = [];

      for (
        let i = latestBlock;
        i >= Math.max(Number(latestBlock) - 100, 0);
        i--
      ) {
        const block = await web3.eth.getBlock(i, true);
        block.transactions.forEach((tx) => {
          if (
            typeof tx === "object" &&
            tx.from?.toLowerCase() === address.toLowerCase() &&
            tx.input !== "0x"
          ) {
            try {
              if (!tx.input) return;
              const decodedInput = web3.utils.hexToUtf8(tx.input);
              if (decodedInput.startsWith("IMG:")) {
                images.push(decodedInput.replace("IMG:", ""));
              }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              /* ignore */
            }
          }
        });
      }
      setUploadedImages(images);
      return images;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [address, web3.eth, web3.utils]);

  useEffect(() => {
    fetchUploadedImages();
  }, [fetchUploadedImages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = async (newMessages: AIMessage[]) => {
    if (!address) return;

    // Type is now compatible here
    const userMessages: ChatMessage[] = newMessages.map((msg) => ({
      role: "user",
      content: msg,
      timestamp: Date.now(),
      userAddress: address,
    }));

    setMessages((prev) => [...prev, ...userMessages]);
    userMessages.forEach((msg) => addMessageToFirestore(msg));

    setLoading(true);
    setError(false);

    try {
      const aiResponse = await fetchAIResponse(newMessages);
      const aiContentText =
        aiResponse?.choices?.[0]?.message?.content || "No response received.";

      const aiResponseContent: AIMessage = {
        id: Date.now().toString(),
        text: aiContentText,
        type: "text",
        role: "assistant",
      };

      const aiMessage: ChatMessage = {
        role: "ai",
        content: aiResponseContent,
        timestamp: Date.now(),
        userAddress: address,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await addMessageToFirestore(aiMessage);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2 bg-white w-full max-w-lvh rounded-lg flex flex-col h-full">
      <div className="overflow-y-auto scrollbar-hide flex-1 space-y-3 pt-0 border-b border-gray-200">
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
        {loading && <p className="text-gray-500 pl-2">AI is typing...</p>}
      </div>
      {error && (
        <div className="p-2 text-red-500 text-sm flex items-center">
          <p>Error fetching response.</p>
          <button
            onClick={() => handleSendMessage([])}
            className="ml-2 text-blue-500"
          >
            Retry
          </button>
        </div>
      )}
      <ChatInput
        onSendMessage={handleSendMessage}
        loading={loading}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
      />
    </div>
  );
};

export default AIChatScreen;
