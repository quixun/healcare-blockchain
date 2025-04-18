import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  id: number;
  imageForDesk: string;
  imageForMobile: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  speciality: string;
};

const items: Item[] = [
  {
    id: 1,
    imageForDesk: "/images/medicines/s11.webp",
    imageForMobile: "/images/medicines/s11-mobile.webp",
    titleLine1: "Formulas For",
    titleLine2: "Your Health.",
    description:
      "Vitamins chosen Nutrition Experts with ongoing support. All starting from $1/day.",
    speciality: "Nutrition",
  },
  {
    id: 2,
    imageForDesk: "/images/medicines/s12.webp",
    imageForMobile: "/images/medicines/s12-mobile.webp",
    titleLine1: "Nourish Body",
    titleLine2: "Supplements.",
    description:
      "Vitamins chosen Nutrition Experts with ongoing support. All starting from $1/day.",
    speciality: "Exclusive",
  },
  {
    id: 3,
    imageForDesk: "/images/medicines/s13.webp",
    imageForMobile: "/images/medicines/s13-mobile.webp",
    titleLine1: "Support Your",
    titleLine2: "Health & Vitality.",
    description:
      "Vitamins chosen Nutrition Experts with ongoing support. All starting from $1/day.",
    speciality: "Daily Wellness",
  },
];

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const currentItem = items[currentIndex];
  const isTextLeft = currentItem.id !== 2;

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-[600px] bg-white overflow-hidden flex items-center justify-center">
      <div className="relative w-full group">
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black text-white rounded-full hover:scale-110 transition opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black text-white rounded-full hover:scale-110 transition opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="relative w-full bg-gray-50 flex flex-col lg:justify-center lg:items-center lg:h-[500px]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={currentItem.imageForMobile}
              alt="Supplement Mobile"
              className="w-full max-h-[400px] object-contain block lg:hidden"
            />

            <img
              src={currentItem.imageForDesk}
              alt="Supplement Desktop"
              className="w-full h-full object-contain hidden lg:block"
            />

            <div
              className={`w-full lg:max-w-2xl px-6 md:px-12 mt-6 lg:mt-0 space-y-4
                text-center
                lg:text-left lg:absolute lg:top-1/2 lg:-translate-y-1/2
                ${isTextLeft ? "lg:left-12" : "lg:right-12 lg:text-right"}
              `}
            >
              <p className="text-blue-400 text-lg tracking-widest uppercase">
                {currentItem.speciality}
              </p>
              <h2 className="text-3xl xl:text-7xl font-bold text-black drop-shadow-lg leading-tight">
                <span className="block">{currentItem.titleLine1}</span>
                <span className="block">{currentItem.titleLine2}</span>
              </h2>

              <p
                className={`text-lg text-gray-700 drop-shadow-md max-w-md 
                  mx-auto 
                  lg:mx-0 
                  ${isTextLeft ? "lg:ml-0" : "lg:mr-0 lg:ml-auto"}
                `}
              >
                {currentItem.description}
              </p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
                Shop Now →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 hidden md:flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentIndex ? "bg-black scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
