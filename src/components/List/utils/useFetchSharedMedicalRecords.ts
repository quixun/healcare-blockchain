import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import {
  ACCESS_CONTROL_ABI,
  contractAddress,
  MEDICAL_RECORDS_ABI,
} from "../configs/contract";
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
  };
  remainingTime: string;
  expiryTime: number; // ← raw expiry timestamp
};

const useFetchSharedMedicalRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useSelector((state: RootState) => state.account);

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getContract = useCallback(async () => {
    if (!address) return null;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(address);
    return new ethers.Contract(contractAddress, ACCESS_CONTROL_ABI, signer);
  }, [address]);

  const revokeExpiredAccess = useCallback(
    async (recordId: string, userAddress: string) => {
      try {
        const contract = await getContract();
        if (contract) {
          const tx = await contract.revokeAccess(recordId, userAddress);
          await tx.wait();
          console.log(
            `Revoked expired access for ${userAddress} on ${recordId}`
          );
        }
      } catch (err) {
        console.warn(`Failed to auto-revoke for ${userAddress}:`, err);
      }
    },
    [getContract]
  );

  const fetchRecords = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner(address);
      const mainC = new ethers.Contract(
        contractAddress,
        MEDICAL_RECORDS_ABI,
        signer
      );
      const aclC = new ethers.Contract(
        contractAddress,
        ACCESS_CONTROL_ABI,
        signer
      );

      // 1) fetch all shared-with-me data in one call
      const [
        sharedIds,
        cidsList,
        names,
        ages,
        genders,
        bps,
        hrs,
        temps,
        owners,
      ] = await mainC.getRecordsSharedWithMe(address);

      const now = Math.floor(Date.now() / 1000);

      // 2) build each record, pulling expiry once
      const recs = await Promise.all(
        sharedIds.map(async (id: string, i: number) => {
          // get expiry
          const rawExpiry = await aclC.checkAccessExpiry(id, address);
          const expiry = Number(rawExpiry);
          const seconds = expiry - now;

          return {
            id,
            cids: cidsList[i] || [],
            owner: owners[i] || "",
            patientName: names[i] || "",
            patientAge: Number(ages[i] || 0),
            patientGender: genders[i] || "",
            vitals: {
              bloodPressure: bps[i] || "",
              heartRate: hrs[i] || "",
              temperature: temps[i] || "",
            },
            expiryTime: expiry,
            remainingTime: formatRemainingTime(seconds),
          };
        })
      );

      setRecords(recs);
      setError(null);
    } catch (e) {
      setError(`Error interacting with contract ${e}`);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (address) {
      const iv = setInterval(async () => {
        setRecords((prev) => {
          const now = Math.floor(Date.now() / 1000);

          const updated = prev.filter((r) => {
            const secs = r.expiryTime - now;

            if (secs <= 0 && r.remainingTime !== "Expired") {
              // Trigger async revoke but don’t wait for it here
              revokeExpiredAccess(r.id, address);
            }

            // Keep only unexpired records
            return secs > 0;
          });

          return updated.map((r) => {
            const secs = r.expiryTime - now;
            return {
              ...r,
              remainingTime: formatRemainingTime(secs),
            };
          });
        });
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [address, revokeExpiredAccess]);

  return { records, loading, error, fetchRecords };
};

export default useFetchSharedMedicalRecords;
