import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { selectProduct } from "../../../features/product/productSlice";
import ProductDetailModal from "../components/product-modal";
import PaymentModal from "../components/payment-modal";
import { ShoppingCart } from "lucide-react"; // Using lucide-react for icons

export type DealItem = {
  id: number;
  image: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  days: number;
  isSoldOut?: boolean;
  isOnSale?: boolean;
  quantity?: number;
};

interface DealsSectionProps {
  // Keeping title here but it's replaced by the header design
  title?: string;
  deals: DealItem[];
}

// -----------------------------------------------------------
// NEW: Deal Card Component with Flash Sale Styling
// -----------------------------------------------------------
interface DealCardProps {
  deal: DealItem;
  onClick: () => void;
}

const DealCard = ({ deal, onClick }: DealCardProps) => {
  // Fallback price logic if deal.price is ETH format string
  const formattedPrice =
    typeof deal.price === "number" ? deal.price.toFixed(3) : deal.price;
  const formattedOldPrice =
    typeof deal.oldPrice === "number"
      ? deal.oldPrice.toFixed(3)
      : deal.oldPrice;
  const discount = deal.oldPrice
    ? Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100)
    : 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="relative overflow-hidden flex flex-col rounded-2xl shadow-xl bg-white border border-gray-100 cursor-pointer group"
      onClick={onClick}
    >
      {/* Discount Badge (Top Right) */}
      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
        - {discount}%
      </div>

      {/* Image Container */}
      <div className="p-4 bg-gray-50 flex justify-center items-center h-56">
        <motion.img
          src={deal.image}
          alt={deal.name}
          className="max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col gap-2 flex-1 text-left">
        {/* Name/Description */}
        <h3 className="font-semibold text-gray-700 text-sm line-clamp-2 min-h-[40px]">
          {deal.name}
        </h3>

        {/* Price and Old Price */}
        <div className="flex items-baseline mt-auto">
          <span className="text-lg font-bold text-red-600 mr-2">
            {formattedPrice}₫
          </span>
          {deal.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formattedOldPrice}₫
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Countdown Banner (Mimicking the small timer below the price) */}
          <div className="text-xs bg-red-100 text-red-600 font-medium px-2 py-1 rounded-md text-center">
            Ưu đãi giá sốc
          </div>

          {/* Buy Button */}
          <button className="flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            <ShoppingCart size={18} />
            Chọn mua
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function DealsSection({ deals }: DealsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isCarousel = deals.length > 3;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manage selection & payment modal state
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);
  const [paymentProduct, setPaymentProduct] = useState<DealItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const dispatch = useDispatch();

  // Auto-advance carousel
  useEffect(() => {
    if (isCarousel) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [deals.length, isCarousel]);

  // Adjusting visible deals to loop correctly for a carousel
  const visibleDeals = isCarousel
    ? [
        deals[currentIndex],
        deals[(currentIndex + 1) % deals.length],
        deals[(currentIndex + 2) % deals.length],
        deals[(currentIndex + 3) % deals.length], // Adjusted for 4 visible items if needed, or back to 3
      ]
    : deals;

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
    <section className="bg-gray-50 pb-10">
      {/* 1. Colorful Flash Sale Header (Mimicking the image banner) */}
      <div className="bg-blue-500 py-10 pt-8 rounded-b-3xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-80 rounded-b-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-6xl font-extrabold text-white tracking-tight"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            Flash sale GIÁ TỐT
          </motion.h2>
          <button className="mt-4 bg-red-600 text-white text-lg font-bold py-2 px-8 rounded-full shadow-lg hover:bg-red-700 transition">
            XEM NGAY
          </button>
        </div>
      </div>

      {/* 2. Countdown Timer Bar (Simulated) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex justify-start items-center space-x-4 mb-6">
          <div className="p-2 border-b-4 border-red-500 text-sm font-semibold text-red-600">
            08:00 - 22:00, 14/12
            <p className="text-xs font-normal">Đang diễn ra</p>
          </div>
          <div className="p-2 text-sm font-semibold text-gray-500">
            08:00 - 22:00, 15/12
            <p className="text-xs font-normal">Sắp diễn ra</p>
          </div>
        </div>

        {/* Countdown Visual */}
        <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg shadow-inner w-fit">
          <span className="text-red-600 font-bold">Kết thúc sau:</span>
          <div className="flex space-x-2 text-white font-bold">
            <span className="bg-red-600 p-1 rounded">05</span>
            <span className="text-red-600">:</span>
            <span className="bg-red-600 p-1 rounded">35</span>
            <span className="text-red-600">:</span>
            <span className="bg-red-600 p-1 rounded">50</span>
          </div>
        </div>
      </div>

      {/* 3. Product Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleDeals.map((deal, idx) => (
            <DealCard
              key={deal.id || idx}
              deal={deal}
              onClick={() => setSelectedDeal(deal)}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            Xem tất cả
          </a>
        </div>
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
    </section>
  );
}
