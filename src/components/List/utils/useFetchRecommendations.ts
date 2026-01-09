import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { contractAddress, GET_RECOMMENDATIONS_ABI } from "../configs/contract";
import { RootState } from "../../../features/store";

// Define types locally (or import them if you moved them to a types file)
export type Medicine = {
  name: string;
  quantity: string;
  instructions: string;
};

export type Recommendation = {
  doctor: string;
  timestamp: number;
  diagnosis: string;
  medicines: Medicine[];
};

const useFetchRecommendations = (recordId: string | undefined) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useSelector((state: RootState) => state.account);

  const fetchRecommendations = useCallback(async () => {
    if (!address || !recordId) return;

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL);
      const signer = await provider.getSigner(address);

      const contract = new ethers.Contract(
        contractAddress,
        GET_RECOMMENDATIONS_ABI,
        signer
      );

      const data = await contract.getRecommendations(recordId);

      const formattedData = data.map((item: Recommendation) => ({
        doctor: item.doctor,
        timestamp: Number(item.timestamp),
        diagnosis: item.diagnosis,
        medicines: item.medicines.map((med: Medicine) => ({
          name: med.name,
          quantity: med.quantity,
          instructions: med.instructions,
        })),
      }));

      setRecommendations(formattedData);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  }, [address, recordId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, refetch: fetchRecommendations };
};

export default useFetchRecommendations;
