import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import Web3Service from "../../services/web3Service";
import { useAppDispatch } from "../../features/hooks";
import { updateAcount } from "../../features/account/accountSlice";
import { motion, AnimatePresence } from "framer-motion";
import AlertModal from "./AlertModal";
import TransferStatusModal from "./TransferStatusModal";
import ConfirmTransferModal from "./ConfirmTransferModal";
import { useSearchParams } from "react-router-dom";
import { TIP_PRESETS } from "@/constant/tip";

const Transfer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isDoctorTip = searchParams.get("ref") === "DoctorTip"; // Condition check
  
  const { address } = useSelector((state: RootState) => state.account);
  const dispatch = useAppDispatch();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null); // State for preset selection

  const web3 = Web3Service.getInstance().getWeb3();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const encodedTo = searchParams.get("to");
    const reference = searchParams.get("ref");

    if (encodedTo) {
      try {
        const decodedAddress = atob(encodedTo);
        setRecipient(decodedAddress);

        if (reference === "DoctorTip") {
          setTransferMessage("Medical Consultation Tip - Thank you!");
        }
      } catch (e) {
        console.error("Failed to decode recipient address", e);
      }
    }
  }, [searchParams]);

  const handlePresetClick = (val: string) => {
    setAmount(val);
    setActivePreset(val);
  };

  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setActivePreset(null); 
  };

  // ... handleSendClick, handleConfirmSend, and handleTransfer remain the same as your provided code

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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {isDoctorTip ? "Send a Tip" : "Send Crypto"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isDoctorTip ? "Show appreciation for your doctor" : "Transfer ETH securely to any address"}
          </p>
        </div>

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
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Amount Input with Conditional Presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Amount (ETH)
            </label>
            
            {/* ONLY SHOW PRESETS IF IT IS A DOCTOR TIP */}
            {isDoctorTip && (
              <div className="flex gap-2 mb-3">
                {TIP_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetClick(preset.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activePreset === preset.value
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-blue-50"
                    }`}
                  >
                    {preset.value}
                    <span className="block text-[9px] font-normal opacity-80">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={handleManualAmountChange}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendClick}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200"}`}
          >
            {loading ? "Processing..." : isDoctorTip ? "Confirm Tip" : "Confirm Transfer"}
          </motion.button>
        </div>
      </motion.div>

      {/* Modals remain the same */}
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