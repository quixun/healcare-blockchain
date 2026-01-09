import { useState } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { contractAddress, ADD_RECOMMENDATION_ABI } from "../configs/contract";
import { RootState } from "../../../features/store";
import { Medicine } from "./useFetchRecommendations";

const useAddRecommendation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useSelector((state: RootState) => state.account);

  const addRecommendation = async (
    recordId: string,
    diagnosis: string,
    medicines: Medicine[]
  ) => {
    if (!address) {
      alert("Please connect your wallet");
      return false;
    }

    try {
      setIsSubmitting(true);
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL);
      const signer = await provider.getSigner(address);
      const contract = new ethers.Contract(
        contractAddress,
        ADD_RECOMMENDATION_ABI,
        signer
      );

      const medNames = medicines.map((m) => m.name);
      const medQuantities = medicines.map((m) => m.quantity);
      const medInstructions = medicines.map((m) => m.instructions);

      const tx = await contract.addRecommendation(
        recordId,
        diagnosis,
        medNames,
        medQuantities,
        medInstructions
      );
      
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error adding recommendation:", error);
      alert("Failed to add recommendation. Check console for details.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addRecommendation, isSubmitting };
};

export default useAddRecommendation;