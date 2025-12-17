import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, XCircle, Plus } from "lucide-react";
import { AIMessage } from "./AIChatScreen";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { create } from "ipfs-http-client";
import Web3Service from "../../services/web3Service";
import Modal from "../common/modal";
import { toast } from "sonner";

type Props = {
  onSendMessage: (messages: AIMessage[]) => void;
  loading: boolean;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChatInput = ({
  onSendMessage,
  loading,
  uploadedImages,
  setUploadedImages,
}: Props) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { address } = useSelector((state: RootState) => state.account);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const checkLogin = async () => {
    if (!address) {
      console.warn("Please login to your wallet.");
      return null;
    }
    return address;
  };

  const handleImageSelect = (url: string) => {
    setIsModalOpen(false);
    setSelectedImage(url);
    setPreview(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      await uploadToIPFS(selectedFile);
    }
  };

  const uploadToIPFS = async (file: File) => {
    try {
      const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });
      const added = await ipfs.add(file);
      await saveToBlockchain(added.path);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
    }
  };

  const saveToBlockchain = async (cid: string) => {
    try {
      const web3 = Web3Service.getInstance().getWeb3();
      const account = await checkLogin();
      if (!account) return;

      const imageData = `IMG:${cid}`;
      await web3.eth.sendTransaction({
        from: account,
        to: account,
        data: web3.utils.asciiToHex(imageData),
      });

      setUploadedImages((prev) => [cid, ...prev]);
      toast.success("Image uploaded and CID saved to blockchain!");
      toggleModal();
    } catch (error) {
      console.error("Error saving CID to blockchain:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    const newMessages: AIMessage[] = [];
    const timestampId = Date.now().toString();

    // 1. Create Text Message
    if (message.trim()) {
      newMessages.push({
        id: timestampId + "-text",
        type: "text",
        text: message,
        role: "user",
      });
    }

    // 2. Create Image Message
    if (selectedImage) {
      newMessages.push({
        id: timestampId + "-img",
        type: "image_url",
        text: "",
        image_url: {
          url: `${import.meta.env.VITE_IPFS_PUBLIC_API_URL}${selectedImage}`,
        },
        role: "user",
      });
    }

    onSendMessage(newMessages);
    setMessage("");
    setSelectedImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col items-start bg-white pb-2"
      >
        {preview && (
          <div className="w-16 h-16 mb-3 relative">
            <img
              src={`${import.meta.env.VITE_IPFS_PUBLIC_API_URL}${preview}`}
              alt="Selected"
              className="w-full h-full object-cover rounded-md shadow-lg"
            />
            <button
              onClick={() => setPreview(null)}
              className="mt-1 bg-white absolute top-0 right-0 cursor-pointer rounded-full shadow-md text-red-500 hover:text-red-700"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center w-full relative">
          <label
            className="absolute left-3 cursor-pointer"
            onClick={toggleModal}
          >
            <ImageIcon
              size={24}
              className="text-gray-500 hover:text-gray-700"
            />
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-12 py-3 rounded-md focus:outline-none focus:ring-0"
          />
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

      {/* Modal for uploaded images */}
      <Modal isOpen={isModalOpen} onClose={toggleModal} title="Select an Image">
        <div className="flex h-[70%] justify-center items-center w-full flex-wrap gap-2 overflow-auto">
          {uploadedImages.map((url, index) => (
            <motion.img
              key={index}
              src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${url}`}
              alt={`Uploaded ${index}`}
              className="object-contain max-h-[150px] max-w-[150px] rounded-md cursor-pointer"
              whileHover={{ scale: 1.1 }}
              onClick={() => handleImageSelect(url)}
            />
          ))}
          <button
            className="w-30 h-30 flex justify-center items-center bg-gray-100 rounded-md border border-dashed cursor-pointer hover:bg-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={32} className="text-gray-500 hover:text-gray-700" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ChatInput;
