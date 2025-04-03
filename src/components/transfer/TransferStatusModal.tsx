import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../common/modal";
import { CheckCircle, XCircle } from "lucide-react";

interface TransferStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  message: string;
}

const TransferStatusModal: React.FC<TransferStatusModalProps> = ({
  isOpen,
  onClose,
  isSuccess,
  message,
}) => {
  const animationVariants = {
    initial: { x: "-100vw", opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    exit: { x: "100vw", opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={isSuccess ? "Giao dịch thành công" : "Giao dịch thất bại"}
        >
          <motion.div
            key="status-modal"
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center text-lg font-medium"
          >
            {isSuccess ? (
              <>
                <CheckCircle className="text-green-600 w-16 h-16 mt-2" />
                <p className="text-green-600">{message}</p>
              </>
            ) : (
              <>
                <XCircle className="text-red-600 w-16 h-16 mb-2" />
                <p className="text-red-600">{message}</p>
              </>
            )}
          </motion.div>
          <div className="mt-4 flex justify-end">
            <motion.button
              onClick={onClose}
              className="hover:bg-gray-200 ease-in-out duration-200 cursor-pointer bg-gray-300 px-4 py-2 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Đóng
            </motion.button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default TransferStatusModal;
