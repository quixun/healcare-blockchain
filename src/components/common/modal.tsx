import React from "react";
import { motion } from "framer-motion";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative"
      >
        {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}

        <button
          onClick={onClose}
          className="absolute cursor-pointer ease-in-out duration-200 bg-red-500 py-2 px-4 rounded-md top-4 right-4 text-xl text-white hover:bg-red-400"
        >
          x
        </button>

        <div>{children}</div>
      </motion.div>
    </div>
  );
};

export default Modal;
