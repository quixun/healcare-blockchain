import { useState } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { contractAddress, MEDICAL_RECORDS_ABI } from "../configs/contract";
import { RootState } from "../../../features/store";

export type Record = {
  cids: string[];
  owner: string;
  description: string;
}

const useFetchRecordById = (recordId: string) => {
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useSelector((state: RootState) => state.account);

  const fetchRecord = async () => {
    if (!address) return [];
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner(address);

      const contract = new ethers.Contract(
        contractAddress,
        MEDICAL_RECORDS_ABI,
        signer
      );

      const [recordCids, owner, description] = await contract.getRecord(
        recordId.trim()
      );

      if (recordCids.length === 0) {
        throw new Error("No record found for the provided record ID.");
      }

      if (owner !== address) {
        setRecord(null);
        setError("You are not the owner of this record.");
      } else {
        setRecord({ cids: recordCids, owner, description });
        setError(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error interacting with contract"
      );
    } finally {
      setLoading(false);
    }
  };

  return { record, loading, error, fetchRecord };
};

export default useFetchRecordById;
