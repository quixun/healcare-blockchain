import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { selectProduct } from "../../../features/product/productSlice";
import ProductDetailModal from "../components/product-modal";
import PaymentModal from "../components/payment-modal";
import { DealItem } from "./deals-section";

const products: DealItem[] = [
  {
    id: 1,
    name: "Red Ginseng Royal",
    brand: "Herbal Care",
    price: 10,
    image: "/images/medicines/Red-Ginseng-Royal.webp",
    rating: 4.5,
    days: 7,
  },
  {
    id: 2,
    name: "Test Up Men Over 40",
    brand: "Vitality Lab",
    price: 20,
    oldPrice: 30,
    image: "/images/medicines/Test-Up-Men-Over-40.webp",
    isSoldOut: true,
    rating: 4.0,
    days: 10,
  },
  {
    id: 3,
    name: "Lutein 40MG Rapid",
    brand: "Eye Health",
    price: 16,
    oldPrice: 20,
    image: "/images/medicines/Lutein-40MG-Rapid.webp",
    isOnSale: true,
    rating: 4.2,
    days: 5,
  },
  {
    id: 4,
    name: "Advanced Collagen",
    brand: "Beauty Boost",
    price: 23,
    image: "/images/medicines/Advanced-Collagen.webp",
    rating: 4.7,
    days: 12,
  },
  {
    id: 5,
    name: "Casein Protein Vanilla",
    brand: "Pro Nutrition",
    price: 10,
    image: "/images/medicines/Casein-Protein-Vanilla.webp",
    rating: 4.3,
    days: 8,
  },
  {
    id: 6,
    name: "Original Ginger Chews",
    brand: "Spice Treats",
    price: 15,
    oldPrice: 65,
    image: "/images/medicines/Original Ginger Chews.webp",
    isSoldOut: true,
    rating: 3.8,
    days: 6,
  },
  {
    id: 7,
    name: "PE Whey Protein",
    brand: "Pure Energy",
    price: 30,
    oldPrice: 60,
    image: "/images/medicines/PE Whey Protein.webp",
    isOnSale: true,
    rating: 4.6,
    days: 14,
  },
  {
    id: 8,
    name: "Vitamin B12 Bones",
    brand: "Bone Boosters",
    price: 12,
    image: "/images/medicines/Vitamin B12 Bones.webp",
    rating: 4.1,
    days: 9,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const SoldOutModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
      >
        <h3 className="text-lg font-semibold text-center mb-4">Inform</h3>
        <p className="text-center mb-6">{message}</p>
        <button
          onClick={onClose}
          className="block mx-auto cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          OK
        </button>
      </motion.div>
    </div>
  );
}

export default function PopularMedicines() {
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
  const [paymentProduct, setPaymentProduct] = useState<DealItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [soldOutMessage, setSoldOutMessage] = useState<string | null>(null);

  const dispatch = useDispatch();

  const handleCardClick = (product: DealItem) => {
    if (product.isSoldOut) {
      setSoldOutMessage(
        "This product is out of stock, please choose another product."
      );
    } else {
      setSelectedDeal(product);
    }
  };

  const handleContinue = () => {
    if (!selectedDeal) return;
    dispatch(
      selectProduct({ name: selectedDeal.name, price: selectedDeal.price })
    );
    setPaymentProduct(selectedDeal);
    setSelectedDeal(null);
    setIsPaymentOpen(true);
  };

  const handleSend = () => {
    setIsPaymentOpen(false);
  };

  return (
    <motion.section
      className="max-w-[90%] w-full my-10 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Popular Products</h2>
        <p className="text-blue-500 font-semibold text-sm md:text-base">
          BUY ONE, GET ONE 50% OFF
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {products.map((product) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl pb-10 shadow hover:shadow-lg w-full cursor-pointer h-full sm:w-[45%] md:w-[22%] relative"
            onClick={() => handleCardClick(product)}
          >
            {product.isSoldOut && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1 rounded">
                Sold out
              </span>
            )}
            {product.isOnSale && (
              <span className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Save 50%
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
              className="mx-auto h-full rounded-t-lg w-full object-contain mb-4"
            />

            <div className="flex justify-center mb-2 text-yellow-400">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span key={i}>★</span>
                ))}
            </div>

            <h3 className="text-center font-semibold text-base mb-1">
              {product.name}
            </h3>

            <div className="text-center">
              <span className="text-blue-500 font-bold text-lg">
                {product.price.toFixed(0)} ETH
              </span>
              {product.oldPrice && (
                <span className="text-gray-400 line-through ml-2">
                  {product.oldPrice.toFixed(0)} ETH
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <ProductDetailModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onContinue={handleContinue}
      />

      {paymentProduct && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSend={handleSend}
          product={{
            name: paymentProduct.name,
            price: paymentProduct.price,
            image: paymentProduct.image,
          }}
        />
      )}

      {/* Sold-out Notification */}
      {soldOutMessage && (
        <SoldOutModal
          message={soldOutMessage}
          onClose={() => setSoldOutMessage(null)}
        />
      )}
    </motion.section>
  );
}
