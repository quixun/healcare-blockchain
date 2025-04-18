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

export type AIMessage = {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
};

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
                const cid = decodedInput.replace("IMG:", "");
                images.push(cid);
              }
            } catch (error) {
              console.error("Error decoding transaction input:", error);
            }
          }
        });
      }

      setUploadedImages(images);
      return images;
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
      return [];
    }
  }, [address, web3.eth, web3.utils]);

  useEffect(() => {
    const fetchUploadedImage = async () => {
      try {
        const images = await fetchUploadedImages();
        setUploadedImages(images);
      } catch (error) {
        console.error("Error fetching uploaded images:", error);
      }
    };

    fetchUploadedImage();
  }, [fetchUploadedImages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = async (newMessages: AIMessage[]) => {
    if (!address) return;
    const userMessages: ChatMessage[] = newMessages.map((msg) => ({
      role: "user",
      content: msg,
      timestamp: Date.now(),
      userAddress: address,
    }));

    setMessages((prev) => [...prev, ...userMessages]);

    // Store user messages in Firestore
    userMessages.forEach(async (message) => {
      await addMessageToFirestore(message);
    });

    setLoading(true);
    setError(false);

    try {
      const aiResponse = await fetchAIResponse(newMessages);
      const aiContent =
        aiResponse?.choices?.[0]?.message?.content || "No response received.";

      const aiMessage: ChatMessage = {
        role: "ai",
        content: { type: "text", text: aiContent },
        timestamp: Date.now(),
        userAddress: address,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Store AI response in Firestore
      await addMessageToFirestore(aiMessage);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-4 bg-white w-[90%] max-w-lvh rounded-lg flex flex-col">
      <div className="overflow-y-auto scrollbar-hide max-h-[85%] flex-1 space-y-3 pt-0 px-2">
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
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
