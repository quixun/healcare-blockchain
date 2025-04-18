import React from "react";
import { motion } from "framer-motion";
import Modal from "../common/modal";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông báo">
      <p>{message}</p>
      <div className="mt-4 flex justify-end">
        <motion.button
          onClick={onClose}
          className="hover:bg-gray-200 ease-in-out duration-200 cursor-pointer bg-gray-300 px-4 py-2 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          Đóng
        </motion.button>
      </div>
    </Modal>
  );
};

export default AlertModal;
