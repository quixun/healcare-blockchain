import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { contractAddress, MEDICAL_ALL_RECORDS_ABI } from "../configs/contract";
import { RootState } from "../../../features/store";

export type Record = {
  id: string;
  cids: string[];
  owner: string;
  description: string;
};

const useFetchAllRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useSelector((state: RootState) => state.account);

  const fetchRecords = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner(address);
      const contract = new ethers.Contract(
        contractAddress,
        MEDICAL_ALL_RECORDS_ABI,
        signer
      );

      const [recordIds, allCids, descriptions] =
        await contract.getRecordsByOwner(address);

      const userRecords = recordIds.map((id: string, index: number) => ({
        id,
        cids: allCids[index],
        owner: address,
        description: descriptions[index],
      }));

      setRecords(userRecords);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error interacting with contract"
      );
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchRecords();
  }, [address, fetchRecords]);

  return { records, loading, error, fetchRecords };
};

export default useFetchAllRecords;
