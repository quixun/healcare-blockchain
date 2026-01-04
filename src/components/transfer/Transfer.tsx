import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import Web3Service from "../../services/web3Service";
import { useAppDispatch } from "../../features/hooks";
import { updateAcount } from "../../features/account/accountSlice";
import { motion, AnimatePresence } from "framer-motion";
import AlertModal from "./AlertModal";
import TransferStatusModal from "./TransferStatusModal";
import ConfirmTransferModal from "./ConfirmTransferModal";

const Transfer: React.FC = () => {
  const { address } = useSelector((state: RootState) => state.account);
  const dispatch = useAppDispatch();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const web3 = Web3Service.getInstance().getWeb3();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendClick = () => {
    if (!recipient) {
      setAlertMessage("Please enter receiver address.");
      setIsAlertModalOpen(true);
      return;
    }
    if (!amount) {
      setAlertMessage("Please enter amount of money.");
      setIsAlertModalOpen(true);
      return;
    }
    if (transferMessage === "") {
      setAlertMessage("Please enter transfer info.");
      setIsAlertModalOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsConfirmModalOpen(false);
    await handleTransfer();
    setIsStatusModalOpen(true);
  };

  const handleTransfer = async () => {
    try {
      if (!address) {
        setMessage("Please login.");
        setIsSuccess(false);
        return;
      }
      if (!web3.utils.isAddress(recipient)) {
        setMessage("Invalid recipient address.");
        setIsSuccess(false);
        return;
      }
      if (!/^\d*\.?\d+$/.test(amount) || parseFloat(amount) <= 0) {
        setMessage("Invalid amount of money.");
        setIsSuccess(false);
        return;
      }

      setLoading(true);
      setMessage("");

      const encodedMessage = web3.utils.utf8ToHex(transferMessage);

      await web3.eth.sendTransaction({
        from: address,
        to: recipient,
        value: web3.utils.toWei(amount, "ether"),
        data: encodedMessage,
      });

      const balance = await web3.eth.getBalance(address);
      const nonce = await web3.eth.getTransactionCount(address);

      dispatch(
        updateAcount({
          balance: web3.utils.fromWei(balance, "ether"),
          nonce: nonce.toString(),
        })
      );

      setMessage("Transfer successful");
      setIsSuccess(true);
      setRecipient("");
      setAmount("");
      setTransferMessage("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage("Transfer failed: " + (error.message || "Unknown error"));
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Send Crypto
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Transfer ETH securely to any address
          </p>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {message && !isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Recipient Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Recipient Address
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                ETH
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Note / Reference
            </label>
            <textarea
              rows={2}
              placeholder="What's this for?"
              value={transferMessage}
              onChange={(e) => setTransferMessage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendClick}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm Transfer"
            )}
          </motion.button>
        </div>

        {/* Footer Info */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Transaction fees (Gas) will be calculated by your wallet provider.
        </p>
      </motion.div>

      {/* Modals */}
      <ConfirmTransferModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSend}
        recipient={recipient}
        amount={amount}
        transferMessage={transferMessage}
      />
      <TransferStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        isSuccess={isSuccess}
        message={message}
      />
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        message={alertMessage}
      />
    </div>
  );
};

export default Transfer;
