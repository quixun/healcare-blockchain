import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, XCircle } from "lucide-react";
import { AIMessage } from "./AIChatScreen";

type Props = {
  onSendMessage: (messages: AIMessage[]) => void;
  loading: boolean;
};

const ChatInput = ({ onSendMessage, loading }: Props) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    if (!message.trim() && !image) return;

    const newMessages: AIMessage[] = [];

    if (message.trim()) {
      newMessages.push({ type: "text", text: message });
    }
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      await new Promise((resolve) => {
        reader.onload = () => {
          if (typeof reader.result === "string") {
            newMessages.push({
              type: "image_url",
              image_url: { url: reader.result },
            });
          }
          resolve(true);
        };
      });
    }

    onSendMessage(newMessages);
    setMessage("");
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="border border-gray-300 py-4 px-4 fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lvh bg-white flex items-center shadow-2xl rounded-lg">
      {/* Image Preview */}
      {preview && (
        <div className="absolute top-[-60px] left-5 w-12 h-12">
          <img
            src={preview}
            alt="Selected"
            className="w-full h-full object-cover rounded-md shadow-lg"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-white rounded-full shadow-md"
          >
            <XCircle size={20} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-center w-full relative">
        {/* Image Upload Icon */}
        <label className="absolute left-3 cursor-pointer">
          <ImageIcon size={24} className="text-gray-500 hover:text-gray-700" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        {/* Input Field */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full pl-12 pr-12 p-2 rounded-md focus:outline-none focus:ring-0"
        />

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={loading}
          className="absolute right-3 p-1 text-blue-500 hover:text-blue-600 disabled:text-gray-400"
        >
          <Send size={24} />
        </motion.button>
      </div>
    </form>
  );
};

export default ChatInput;
