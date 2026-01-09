import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function ImageSlider({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const total = images.length;

  if (total === 0) return null;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  return (
    <div className="">
      <h4 className="text-2xl font-semibold mb-2">{title}</h4>
      <div
        className="relative w-full h-90 flex items-center justify-center overflow-hidden rounded-lg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute w-full h-full flex items-center justify-center"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={images[index]}
              alt={`${title} ${index + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              onError={(e) => (e.currentTarget.src = "")}
            />
          </motion.div>
        </AnimatePresence>

        {total > 1 && hovered && (
          <>
            <button
              type="button" // 👈 ADD THIS to prevent form submission
              onClick={prev}
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-gray-700 text-white py-1 px-2 rounded-full"
            >
              ◀
            </button>
            <button
              type="button" // 👈 ADD THIS to prevent form submission
              onClick={next}
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-gray-700 text-white py-1 px-2 rounded-full"
            >
              ▶
            </button>
          </>
        )}
      </div>
    </div>
  );
}