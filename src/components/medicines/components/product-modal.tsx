import React from "react";
import { motion } from "framer-motion";
import { DealItem } from "../medicine-list-sections/deals-section";

type Props = {
  deal: DealItem | null;
  onClose: () => void;
  onContinue: () => void;
};

const ProductDetailModal: React.FC<Props> = ({ deal, onClose, onContinue }) => {
  if (!deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-60 object-cover rounded-lg"
        />

        <div className="mt-4 space-y-2 text-center">
          <h2 className="text-xl font-bold">{deal.name}</h2>
          <p className="text-sm text-gray-400">{deal.brand}</p>

          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={
                  i < deal.rating ? "text-yellow-400" : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>

          <p className="text-blue-600 font-semibold text-lg">
            {deal.price.toFixed(2)} ETH{" "}
            {deal.oldPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {deal.oldPrice.toFixed(2)} ETH
              </span>
            )}
          </p>

          <p className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit mx-auto mt-2">
            {deal.days} Days Left
          </p>

          <button
            onClick={onContinue}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Purchase
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;
