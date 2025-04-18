import { motion } from "framer-motion";

export default function SalesBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden bg-gray-50 shadow-md flex flex-col md:flex-row w-full max-w-full my-10"
    >
      <div className="flex-1 flex flex-col justify-center items-center text-center px-10 py-12 bg-gray-50">
        <p className="uppercase text-sm text-gray-500 tracking-widest mb-2">
          Online Purchase
        </p>
        <h2 className="text-5xl font-bold text-black">
          30<span className="text-4xl align-top">%</span>{" "}
          <span className="tracking-widest">OFF</span>
        </h2>
      </div>

      <div className="flex-1 relative w-full h-64 md:h-auto">
        <img
          src="/images/medicines/banner-vitamin.webp"
          alt="Vitamin C Sale"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-start pl-6">
          <h1 className="text-white text-6xl font-light opacity-20 rotate-90 md:rotate-0 md:text-[6rem] tracking-wider">
            Vitazen
          </h1>
        </div>
      </div>
    </motion.div>
  );
}
