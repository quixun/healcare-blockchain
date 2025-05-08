import { useState } from "react";
import Web3 from "web3";
import { create } from "ipfs-http-client";
import { ABI_UPDATE_PRODUCT, contractAddress } from "../config";
import Web3Service from "@/services/web3Service";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

export function useUpdateProduct(account: string | null) {
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [error, setError] = useState<string | null>(null);

  const updateProduct = async (
    id: number,
    brand: string,
    name: string,
    existingImageCID: string,
    currentPriceEth: string,
    oldPriceEth: string,
    rating: number,
    file?: File
  ) => {
    if (
      !account ||
      !brand ||
      !name ||
      !currentPriceEth ||
      rating < 0 ||
      rating > 5
    ) {
      setError("Missing or invalid fields");
      return { success: false };
    }

    setLoading(true);
    try {
      const web3: Web3 = Web3Service.getInstance().getWeb3();
      const contract = new web3.eth.Contract(
        ABI_UPDATE_PRODUCT,
        contractAddress
      );

      let imageCID = existingImageCID;

      if (file) {
        const added = await ipfs.add(file);
        imageCID = added.cid.toString();
        setCid(imageCID);
      }

      const currentPriceWei = web3.utils.toWei(currentPriceEth, "ether");
      const oldPriceWei = web3.utils.toWei(oldPriceEth, "ether");

      await contract.methods
        .updateProductInfo(
          id,
          brand,
          name,
          imageCID,
          currentPriceWei,
          oldPriceWei,
          rating
        )
        .send({ from: account, gas: "1000000" });

      setError(null);
      return { success: true, cid: imageCID };
    } catch (err) {
      console.error(err);
      setError("Update failed");
      const revertMessage =
        err instanceof Error && err.message?.includes("revert")
          ? err.message.split("revert")[1]?.trim()
          : "Update failed";

      setError(revertMessage);
      return { success: false, error: revertMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateProduct, loading, cid, error };
}
