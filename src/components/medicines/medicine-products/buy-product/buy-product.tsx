import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/features/store";
import { motion } from "framer-motion";
import { useFetchProducts } from "../get-product/use-fetch-product";
import Web3Service from "@/services/web3Service";
import { ABI_BUY_PRODUCT, contractAddress } from "../config";
import { updateAcount } from "@/features/account/accountSlice";
import { useState } from "react";
import { toast } from "sonner";
export default function BuyProduct() {
  const { productID } = useParams();
  const { address } = useSelector((state: RootState) => state.account);
  const [buying, setBuying] = useState(false);
  const { products, loading, error } = useFetchProducts();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const product = products?.find((p) => p.id === Number(productID));

  const handleBuy = async () => {
    if (!product || !address) return;

    if (product.owner === address) {
      navigate(`/update-product/${product.id}`);
      return;
    }

    const web3 = Web3Service.getInstance().getWeb3();
    const contract = new web3.eth.Contract(ABI_BUY_PRODUCT, contractAddress);

    try {
      setBuying(true);
      // Send transaction to smart contract
      await contract.methods.buyProduct(product.id).send({
        from: address,
        value: web3.utils.toWei(product.currentPrice, "ether"),
      });

      // Transfer payment to seller
      await web3.eth.sendTransaction({
        from: address,
        to: product.owner,
        value: web3.utils.toWei(product.currentPrice, "ether"),
        data: web3.utils.utf8ToHex(
          `${product.owner} have bought ${product.name}`
        ),
      });

      // ✅ Update balance and nonce
      const balance = await web3.eth.getBalance(address);
      const nonce = await web3.eth.getTransactionCount(address);
      dispatch(
        updateAcount({
          balance: web3.utils.fromWei(balance, "ether"),
          nonce: nonce.toString(),
        })
      );

      toast.success("You have successfully bought the product");
      navigate("/services/medicines");
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${
                product.imageCID
              }`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-4">Brand: {product.brand}</p>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-600">({product.rating})</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.currentPrice}
                </span>
                {product.oldPrice && (
                  <span className="ml-2 text-xl text-gray-500 line-through">
                    ${product.oldPrice}
                  </span>
                )}
              </div>
              {product.isOnSale && (
                <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded mt-2">
                  On Sale! {product.daysOnSale} days remaining
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Owner:{" "}
                {product.owner === address
                  ? "You're the owner"
                  : product.owner.slice(0, 6) + "..." + product.owner.slice(-4)}
              </p>
              <p className="text-gray-700">
                Status: {product.isSold ? "Sold Out" : "Available"}
              </p>
            </div>

            <button
              onClick={handleBuy}
              disabled={product.isSold || buying}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${
                product.isSold
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {buying ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : product.isSold ? (
                "Sold Out"
              ) : product.owner === address ? (
                "Update Product"
              ) : (
                "Buy Now"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
