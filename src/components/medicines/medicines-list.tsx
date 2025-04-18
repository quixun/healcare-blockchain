import { motion } from "motion/react";
import ProductCarousel from "./components/product-carousel";
import DealsSection from "./medicine-list-sections/deals-section";
import SalesBanner from "./medicine-list-sections/sales-banner";
import PopularMedicines from "./medicine-list-sections/popular-medicine-section";
import ClientStoriesSection from "./medicine-list-sections/story-client-section";
import GeneralSection from "./medicine-list-sections/general-section";

const dealItem = [
  {
    image: "/images/medicines/Omega-3-Fish-Oil.webp",
    brand: "Soft Toys",
    name: "Omega-3 Fish Oil",
    price: 12,
    oldPrice: 20,
    rating: 4,
    days: 27,
  },
  {
    image: "/images/medicines/Red-Ginseng-Royal.webp",
    brand: "Vitazeen",
    name: "Red Ginseng Royal",
    price: 10,
    oldPrice: 40,
    rating: 5,
    days: 44,
  },
  {
    image: "/images/medicines/Test-Up-Men-Over-40.webp",
    brand: "Vitazeen",
    name: "Test Up Men Over 40",
    price: 20,
    oldPrice: 50,
    rating: 5,
    days: 1,
  },
];

export default function MedicinesList() {
  return (
    <div className="mt-10">
      <ProductCarousel />
      <div className="flex-1 flex flex-col justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full h-full px-9 pt-16 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <DealsSection deals={dealItem} />
        </motion.div>
        <div className="w-full px-5">
          <SalesBanner />
        </div>
        <PopularMedicines />
        <ClientStoriesSection />
        <GeneralSection />
      </div>
    </div>
  );
}
