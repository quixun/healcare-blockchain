import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { selectProduct } from "../../../features/product/productSlice";
import ProductDetailModal from "../components/product-modal";
import PaymentModal from "../components/payment-modal";

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
};

interface DealsSectionProps {
  title?: string;
  deals: DealItem[];
}

export default function DealsSection({
  title = "Deals Of The Week!",
  deals,
}: DealsSectionProps) {
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

  const visibleDeals = isCarousel
    ? [
        deals[currentIndex],
        deals[(currentIndex + 1) % deals.length],
        deals[(currentIndex + 2) % deals.length],
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
    <section className="py-10">
      <div className="px-4">
        <p className="text-sm text-blue-500 font-semibold">
          BEST VITAMIN DEALS
        </p>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <button className="text-white rounded-xl py-5 px-8 bg-blue-400 shadow-md flex items-center gap-2 hover:bg-blue-500 transition duration-300 ease-in-out">
            VIEW ALL <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visibleDeals.map((deal, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden flex flex-col items-center text-center rounded-2xl shadow-md bg-white cursor-pointer"
              onClick={() => setSelectedDeal(deal)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full bg-white flex flex-col"
              >
                <motion.img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-80 object-cover"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />

                <div className="p-4 text-center flex flex-col gap-2 flex-1">
                  <p className="text-sm text-gray-400">{deal.brand}</p>
                  <h3 className="font-bold text-lg">{deal.name}</h3>

                  <div className="flex justify-center items-center gap-1">
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

                  <div className="text-lg font-semibold text-blue-600">
                    {deal.price.toFixed(2)} ETH
                    {deal.oldPrice && (
                      <span className="ml-2 text-gray-400 line-through text-sm">
                        {deal.oldPrice.toFixed(2)} ETH
                      </span>
                    )}
                  </div>

                  <div className="mt-auto text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit mx-auto">
                    {deal.days} Days Left
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <ProductDetailModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onContinue={handleContinue}
      />

      {/* Payment Modal */}
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
