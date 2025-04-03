import React from "react";
import { motion } from "framer-motion";
import Modal from "../common/modal";

interface ConfirmTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipient: string;
  amount: string;
  transferMessage: string;
}

const ConfirmTransferModal: React.FC<ConfirmTransferModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recipient,
  amount,
  transferMessage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận giao dịch">
      <div className="text-black">
        <p>
          <strong>Người nhận:</strong> {recipient}
        </p>
        <p>
          <strong>Số tiền:</strong> {amount} ETH
        </p>
        {transferMessage && (
          <p>
            <strong>Nội dung:</strong> {transferMessage}
          </p>
        )}
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <motion.button
          onClick={onClose}
          className="hover:bg-gray-200 ease-in-out duration-200 cursor-pointer bg-gray-300 px-4 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Hủy
        </motion.button>
        <motion.button
          onClick={onConfirm}
          className="hover:bg-green-400 ease-in-out duration-200 cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Xác nhận
        </motion.button>
      </div>
    </Modal>
  );
};

export default ConfirmTransferModal;
