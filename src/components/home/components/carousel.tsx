import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type imageForSlide = {
  src: string;
  text: string;
};

const images: imageForSlide[] = [
  { src: "/images/carousel-1.jpg", text: "Cardiology" },
  { src: "/images/carousel-2.jpg", text: "Neurology" },
  { src: "/images/carousel-3.jpg", text: "Pulmonology" },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative basis-full order-1 lg:order-2 max-w-full lg:basis-1/2 lg:max-w-1/2 w-full lg:h-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute w-full h-full min-h-[80vh]"
        >
          <img
            src={images[index].src}
            alt={`Slide ${index}`}
            className="w-full h-full object-cover"
          />
          <h1 className="absolute inset-0 flex items-center justify-center bg-transparent text-white text-3xl md:text-6xl lg:text-7xl font-black leading-5">
            {images[index].text}
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
