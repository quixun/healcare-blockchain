import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sophia Martinez",
    role: "Verified Buyer",
    rating: 5,
    quote:
      "Excellent service and top-notch supplements. The loyalty rewards is a great bonus. Will definitely keep ordering!",
  },
  {
    name: "Emma Richardson",
    role: "Verified Buyer",
    rating: 5,
    quote:
      "Vitazen supplements have been a game-changer for me! I feel more energized and healthier than ever. Highly recommend!",
  },
  {
    name: "Olivor Brown",
    role: "Verified Buyer",
    rating: 4,
    quote:
      "Fast shipping and great customer support. The products are high-quality. Wish there were more flavor options.",
  },
  {
    name: "Jessica Lane",
    role: "Verified Buyer",
    rating: 5,
    quote:
      "Amazing results! The customer support was also super friendly and helpful.",
  },
  {
    name: "Michael Chen",
    role: "Verified Buyer",
    rating: 4,
    quote:
      "Quality is top-tier, delivery was fast, just wished for more bundle offers.",
  },
];

// Constants
const CARD_WIDTH = 320; // px, matches Tailwind w-80
const GAP = 24; // px, matches Tailwind gap-6

export default function ClientStoriesSection() {
  // Active (highlighted) testimonial index
  const [activeIndex, setActiveIndex] = useState(0);

  // Number of cards visible based on screen width
  const [visibleCards, setVisibleCards] = useState(3);

  // Update visibleCards on resize
  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w < 768) setVisibleCards(1);
      else if (w < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  // Calculate sliding parameters
  const maxSlideIndex = testimonials.length - visibleCards;
  const centerOffset = Math.floor(visibleCards / 2);
  const rawOffset = activeIndex - centerOffset;
  const slideIndex = Math.max(0, Math.min(rawOffset, maxSlideIndex));

  // Navigation handlers
  const next = () =>
    setActiveIndex((prev) => Math.min(prev + 1, testimonials.length - 1));
  const prev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section
      className="w-full bg-gray-50 py-16 px-4 overflow-hidden"
      id="client-stories"
    >
      <div className="max-w-7xl mx-auto relative">
        <p className="text-sm text-blue-500 font-semibold uppercase mb-2">
          Client Stories
        </p>
        <h2 className="text-4xl font-bold text-gray-900 mb-10">
          Trusted by Thousands of <br /> Satisfied Customers.
        </h2>

        <div>
          {/* Arrow controls */}
          <div className="absolute top-40 md:top-12 right-0 flex gap-2 z-10">
            <button
              onClick={prev}
              className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={activeIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 md:w-8 md:h-8" />
            </button>
            <button
              onClick={next}
              className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={activeIndex === testimonials.length - 1}
            >
              <ChevronRight className="w-4 h-4 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Slider container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: -slideIndex * (CARD_WIDTH + GAP) }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((t, i) => {
                const isActive = i === activeIndex;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: isActive ? 1 : 0.4,
                      scale: isActive ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-80 bg-white p-6 rounded-xl shadow-md flex-shrink-0"
                  >
                    <p className="text-gray-700 mb-4">"{t.quote}"</p>
                    <div className="flex items-center space-x-1 text-blue-500 mb-2">
                      {[...Array(t.rating)].map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                      {[...Array(5 - t.rating)].map((_, idx) => (
                        <span key={idx} className="text-gray-300">
                          ★
                        </span>
                      ))}
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">
                      {t.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="text-blue-500 w-4 h-4 mr-1" />{" "}
                      {t.role}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
