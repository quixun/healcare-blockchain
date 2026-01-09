import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { RootState } from "../../../features/store";
import {
  contractAddress,
  MEDICAL_ALL_RECORDS_ABI,
  HISTORY_TRACKING_ABI,
} from "../configs/contract";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(seconds / 86400);
  return `${days}d`;
}

export interface GlobalHistoryItem {
  recordId: string;
  patientName: string;
  doctorAddress: string;
  sharedDate: string;
  duration: string;
  status: "Active" | "Expired";
  rawExpiresAt: number;
}

interface AccessLogRaw {
  doctor: string;
  sharedAt: bigint;
  expiresAt: bigint;
}

const useFetchAllHistory = () => {
  const [history, setHistory] = useState<GlobalHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address } = useSelector((state: RootState) => state.account);

  const fetchAllHistory = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL);
      const signer = await provider.getSigner(address);

      const combinedABI = [...MEDICAL_ALL_RECORDS_ABI, ...HISTORY_TRACKING_ABI];

      const contract = new ethers.Contract(
        contractAddress,
        combinedABI,
        signer
      );

      const result = (await contract.getRecordsByOwner(address)) as [
        string[],
        string[][],
        string[],
        bigint[],
        string[],
        string[],
        string[],
        string[],
        string[]
      ];

      const [ownerRecordIds, , names] = result;

      const historyPromises = ownerRecordIds.map(
        async (recordId: string, index: number) => {
          const patientName = names[index];

          // Explicitly cast the contract response to our Raw type
          const logs = (await contract.getAccessHistory(
            recordId
          )) as AccessLogRaw[];

          return logs.map((log: AccessLogRaw) => {
            const now = Date.now() / 1000;
            const sharedAt = Number(log.sharedAt);
            const expiresAt = Number(log.expiresAt);
            const durationSeconds = expiresAt - sharedAt;

            // Return typed object
            const item: GlobalHistoryItem = {
              recordId: recordId,
              patientName: patientName,
              doctorAddress: log.doctor,
              sharedDate: new Date(sharedAt * 1000).toLocaleString(),
              duration: formatDuration(durationSeconds),
              status: now < expiresAt ? "Active" : "Expired",
              rawExpiresAt: expiresAt,
            };
            return item;
          });
        }
      );

      // Wait for all requests to finish
      const nestedResults = await Promise.all(historyPromises);

      // --- STEP 3: Flatten the array ---
      const flatHistory = nestedResults.flat();

      // Optional: Sort by most recently shared
      flatHistory.sort((a, b) => b.rawExpiresAt - a.rawExpiresAt);

      setHistory(flatHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchAllHistory();
  }, [address, fetchAllHistory]);

  return { history, loading, error, refetch: fetchAllHistory };
};

export default useFetchAllHistory;
