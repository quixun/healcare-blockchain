import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";
import ProductDetailModal from "../../components/product-modal";
import { useFetchProducts } from "./use-fetch-product";
import { useNavigate } from "react-router-dom";
import { SoldOutModal } from "../../medicine-list-sections/popular-medicine-section";

type Product = {
  id: number;
  owner: string;
  brand: string;
  name: string;
  imageCID: string;
  currentPrice: string;
  oldPrice: string;
  rating: number;
  createdAt: number;
  daysOnSale: number;
  isSold: boolean;
  isOnSale: boolean;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const calculateDaysRemaining = (
  createdAt: number,
  daysOnSale: number
): number => {
  const now = Math.floor(Date.now() / 1000);
  const saleEndsAt = createdAt + daysOnSale * 24 * 60 * 60;
  const remainingSeconds = Math.max(0, saleEndsAt - now);
  const remainingDays = Math.ceil(remainingSeconds / (24 * 60 * 60));
  return remainingDays;
};

const calculateDiscount = (currentPrice: string, oldPrice: string): number => {
  const current = Number(currentPrice);
  const old = Number(oldPrice);
  if (!old || old <= current) return 0;
  const discount = ((old - current) / old) * 100;
  return Math.round(discount);
};

export default function ProductList() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { address } = useSelector((state: RootState) => state.account);
  const { products, loading, error } = useFetchProducts();
  const navigate = useNavigate();
  const [soldOutMessage, setSoldOutMessage] = useState<string | null>(null);

  const handleCardClick = (product: Product) => {
    console.log(product.owner);

    if (product.isSold) {
      setSoldOutMessage(
        "This product is out of stock, please choose another product."
      );
      return;
    }

    if (product.owner === address) navigate(`/update-product/${product.id}`);

    setSelectedProduct(product);
  };

  const handleContinue = () => {
    if (!selectedProduct) return;
    navigate(`/buy-product/${selectedProduct?.id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  if (!address)
    return (
      <div className="text-center text-gray-500 py-10">
        Please connect your wallet to view products
      </div>
    );

  if (products.length === 0)
    return (
      <div className="text-center text-gray-500 py-10">
        There are no products available
      </div>
    );

  return (
    <motion.section
      className="max-w-[90%] w-full my-10 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Market Products</h2>
        <p className="text-blue-500 font-semibold text-sm md:text-base uppercase">
          always cheaper price
        </p>
      </div>

      <div className="flex  h-full flex-wrap gap-6">
        {products.map((product) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white min-h-[435px] rounded-2xl pb-5 shadow hover:shadow-lg w-full cursor-pointer h-full sm:w-[45%] md:w-[22%] relative"
            onClick={() => handleCardClick(product)}
          >
            {product.isSold && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1 rounded">
                Sold out
              </span>
            )}
            {product.isOnSale && product.oldPrice && !product.isSold && (
              <span className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Save {calculateDiscount(product.currentPrice, product.oldPrice)}
                %
              </span>
            )}

            {product.isSold && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs px-2 py-1 rounded">
                Sold out
              </span>
            )}

            <img
              src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${
                product.imageCID
              }`}
              alt={product.name}
              className="mx-auto h-[291px] rounded-t-lg w-full object-contain mb-4"
            />

            <div className="flex justify-center mb-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < product.rating ? "text-yellow-400" : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
            </div>

            <h3 className="text-center font-semibold text-base mb-1">
              {product.name}
            </h3>

            <div className="text-center">
              <span className="text-blue-500 font-bold text-lg">
                {product.currentPrice} ETH
              </span>
              {product.oldPrice && (
                <span className="text-gray-400 line-through ml-2">
                  {product.oldPrice} ETH
                </span>
              )}
            </div>
            {product.isOnSale && (
              <div className="mt-4 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit mx-auto">
                {calculateDaysRemaining(
                  product.createdAt,
                  Number(product.daysOnSale)
                )}{" "}
                Days Left
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <ProductDetailModal
        deal={
          selectedProduct
            ? {
                id: selectedProduct.id,
                image: `${import.meta.env.VITE_IPFS_GATEWAY_URL}/${
                  selectedProduct.imageCID
                }`,
                brand: selectedProduct.brand,
                name: selectedProduct.name,
                price: Number(selectedProduct.currentPrice),
                oldPrice: selectedProduct.oldPrice
                  ? Number(selectedProduct.oldPrice)
                  : undefined,
                rating: selectedProduct.rating,
                days: calculateDaysRemaining(
                  selectedProduct.createdAt,
                  Number(selectedProduct.daysOnSale)
                ),
                isSoldOut: selectedProduct.isSold,
                isOnSale: selectedProduct.isOnSale,
              }
            : null
        }
        onClose={() => setSelectedProduct(null)}
        onContinue={handleContinue}
      />

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
