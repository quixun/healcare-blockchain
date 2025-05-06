import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import Web3Service from "../../services/web3Service";
import { useAppDispatch } from "../../features/hooks";
import { updateAcount } from "../../features/account/accountSlice";
import { motion } from "framer-motion";
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
      setAlertMessage("Please enter reciever address.");
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

      setMessage("Transfer successfully");
      setIsSuccess(true);
      setRecipient("");
      setAmount("");
      setTransferMessage("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Transfer faild because: " + error.message);
      } else {
        setMessage("Transfer faild");
      }
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full max-w-lg h-full max-h-[950px] px-9 pt-16 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-black text-center mb-4">
            Transfer Money
          </h2>
          {message && (
            <motion.p
              className="text-red-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.p>
          )}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <label className="block font-medium text-black">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
          </motion.div>
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <label className="block font-medium text-black">
              Money (ETH):
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
          </motion.div>
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <label className="block font-medium text-black">
              Transfer Information:
            </label>
            <input
              type="text"
              value={transferMessage}
              onChange={(e) => setTransferMessage(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
          </motion.div>
          <motion.button
            onClick={handleSendClick}
            disabled={loading}
            className="w-full ease-in-out duration-200 cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {loading ? "Đang gửi..." : "Gửi tiền"}
          </motion.button>

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
        </motion.div>
      </div>
    </div>
  );
};

export default Transfer;
