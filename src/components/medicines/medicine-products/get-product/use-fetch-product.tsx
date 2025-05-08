import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI_GET_ALL_PRODUCTS, contractAddress } from "../config";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";
import Web3Service from "@/services/web3Service";

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

export const useFetchProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useSelector((state: RootState) => state.account);

  const fetchProducts = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const web3 = Web3Service.getInstance().getWeb3();
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ABI_GET_ALL_PRODUCTS,
        signer
      );

      // Fetch the total count of products
      const count = await contract.productCount();

      const fetchedProducts: Product[] = [];
      for (let i = 1; i <= count; i++) {
        const data = await contract.getProduct(i);

        const formattedProduct: Product = {
          id: Number(data[0]),
          owner: data[1],
          brand: data[2],
          name: data[3],
          imageCID: data[4],
          currentPrice: web3.utils.fromWei(data[5], "ether"),
          oldPrice: web3.utils.fromWei(data[6], "ether"),
          rating: Number(data[7]),
          daysOnSale: Number(data[8]),
          createdAt: Number(data[9]),
          isSold: data[10],
          isOnSale: data[11],
        };

        fetchedProducts.push(formattedProduct);
      }

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong: " + err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchProducts();
    }
  }, [address, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
