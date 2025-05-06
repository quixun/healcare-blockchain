import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import Web3Service from "../../../services/web3Service";
import { updateAcount } from "../../../features/account/accountSlice";
import { RootState } from "../../../features/store";
import { CheckCircle, XCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  product: {
    name: string;
    price: number;
    image: string;
  };
}

const DEFAULT_ADDRESS = "0x1bA1c06B0fF8e52d837dCE7e76Fc17c4d3B5DADe";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function PaymentModal({
  isOpen,
  onClose,
  onSend,
  product,
}: PaymentModalProps) {
  const web3 = Web3Service.getInstance().getWeb3();
  const { address } = useSelector((state: RootState) => state.account);
  const [recipient, setRecipient] = useState<string>(DEFAULT_ADDRESS);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const dispatch = useDispatch();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient(DEFAULT_ADDRESS);
      setDeliveryAddress("");
      setLoading(false);
      setMessage(null);
      setShowResult(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!address) {
      setMessage({ text: "Bạn chưa đăng nhập.", isError: true });
      setShowResult(true);
      return;
    }
    if (!web3.utils.isAddress(recipient)) {
      setMessage({ text: "Địa chỉ ví nhập không hợp lệ.", isError: true });
      setShowResult(true);
      return;
    }
    if (!deliveryAddress.trim()) {
      setMessage({ text: "Vui lòng nhập địa chỉ giao hàng.", isError: true });
      setShowResult(true);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const data = web3.utils.utf8ToHex(
        `Thanh toán ${product.price} ETH cho sản phẩm "${product.name}"`
      );

      await web3.eth.sendTransaction({
        from: address,
        to: recipient,
        value: web3.utils.toWei(product.price.toString(), "ether"),
        data,
      });

      const balance = await web3.eth.getBalance(address);
      const nonce = await web3.eth.getTransactionCount(address);
      dispatch(
        updateAcount({
          balance: web3.utils.fromWei(balance, "ether"),
          nonce: nonce.toString(),
        })
      );

      setMessage({ text: "Chuyển tiền thành công!", isError: false });
    } catch (err: unknown) {
      setMessage({
        text: "Giao dịch thất bại: " + (err || "Lỗi không xác định."),
        isError: true,
      });
    } finally {
      setLoading(false);
      setShowResult(true);
    }
  };

  const handleResultClose = () => {
    if (message) {
      if (message.isError) {
        // On error, go back to form
        setShowResult(false);
      } else {
        // On success, notify parent and close modal
        onSend();
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
            variants={modalVariants}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              aria-label="Close modal"
            >
              ✕
            </button>

            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key="form"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded mb-4"
                    variants={contentVariants}
                  />
                  <motion.h2
                    className="text-xl font-bold text-center mb-4"
                    variants={contentVariants}
                  >
                    Confirm Payment
                  </motion.h2>

                  <motion.div className="space-y-4" variants={contentVariants}>
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount Of ETH</p>
                      <p className="text-blue-600 font-semibold">
                        {product.price} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <input
                        type="text"
                        value={recipient}
                        readOnly
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full font-mono text-sm bg-gray-100 pointer-events-none select-none p-2 rounded"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Address</p>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        className="w-full text-sm bg-gray-100 p-2 rounded"
                        placeholder="Nhập địa chỉ nhận hàng"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    onClick={handleTransfer}
                    disabled={loading}
                    className={
                      `mt-6 w-full py-3 rounded-lg transition ` +
                      (loading
                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                        : "bg-blue-500 hover:bg-blue-600 text-white")
                    }
                    variants={contentVariants}
                  >
                    {loading ? "Handling..." : "Pay"}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  className="flex flex-col items-center justify-center py-8"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {message && (
                    <>
                      <motion.div className="mb-4" variants={contentVariants}>
                        {message.isError ? (
                          <XCircle size={48} className="text-red-600" />
                        ) : (
                          <CheckCircle size={48} className="text-green-600" />
                        )}
                      </motion.div>
                      <motion.p
                        className={
                          `text-center mb-6 ` +
                          (message.isError ? "text-red-600" : "text-green-600")
                        }
                        variants={contentVariants}
                      >
                        {message.text}
                      </motion.p>
                      <motion.button
                        onClick={handleResultClose}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        variants={contentVariants}
                      >
                        OK
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
