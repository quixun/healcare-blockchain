import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { contractAddress, MEDICAL_ALL_RECORDS_ABI } from "../configs/contract";
import { RootState } from "../../../features/store";

export type Record = {
  id: string;
  cids: string[];
  owner: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    diseaseGroup: string;
    description: string;
  };
};

const useFetchAllMedicalRecords = () => {
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

      const [
        ownerRecordIds,
        cidsList,
        names,
        ages,
        genders,
        bloodPressures,
        heartRates,
        temperatures,
        diseaseGroups,
        descriptions,
        owners,
      ] = await contract.getRecordsByOwner(address);

      // Process each record and map the data
      const userRecords = cidsList.map((cids: string[], index: number) => {
        const recordId = ownerRecordIds[index] || "";
        const patientName = names[index] || "";
        const patientAge = ages[index] || 0;
        const patientGender = genders[index] || "";
        const bloodPressure = bloodPressures[index] || "";
        const heartRate = heartRates[index] || "";
        const temperature = temperatures[index] || "";
        const diseaseGroup = diseaseGroups[index] || "";
        const description = descriptions[index] || "";

        return {
          id: recordId,
          cids,
          owner: owners[index] || "",
          patientName,
          patientAge,
          patientGender,
          vitals: {
            bloodPressure,
            heartRate,
            temperature,
            diseaseGroup,
            description,
          },
        };
      });

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

export default useFetchAllMedicalRecords;
