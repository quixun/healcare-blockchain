import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ACCESS_CONTROL_ABI } from "./configs/contract";
import { ethers } from "ethers";

type CheckAccessProps = {
  recordId: string;
  userAddress: string;
};

type Record = {
  cids: string[];
  owner: string;
  description: string;
};

const ViewRecordIfAccessGranted = ({
  recordId,
  userAddress,
}: CheckAccessProps) => {
  const [record, setRecord] = useState<Record | null>(null);
  const [accessGranted, setAccessGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(async () => {
    if (!userAddress) return null;
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL);
    const signer = await provider.getSigner(userAddress);
    return new ethers.Contract(userAddress, ACCESS_CONTROL_ABI, signer);
  }, [userAddress]);

  const checkAccess = useCallback(async () => {
    if (!userAddress || !recordId) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) throw new Error("Contract not found");

      const expiryTime = await contract.checkAccessExpiry(
        recordId,
        userAddress
      );

      // If the access has not expired
      if (expiryTime > Math.floor(Date.now() / 1000)) {
        setAccessGranted(true);
      } else {
        setAccessGranted(false);
      }
    } catch (err) {
      setError("Failed to check access");
      console.error("Error checking access:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, recordId, getContract]);

  const fetchRecord = useCallback(async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) throw new Error("Contract not found");

      const [cids, owner, description] = await contract.getRecord(recordId);

      setRecord({ cids, owner, description });
    } catch (err) {
      setError("Failed to fetch record");
      console.error("Error fetching record:", err);
    } finally {
      setLoading(false);
    }
  }, [getContract, recordId]);

  useEffect(() => {
    if (userAddress && recordId) {
      checkAccess(); // Check if the user has access when component mounts or userAddress/recordId changes
    }
  }, [userAddress, recordId, checkAccess]);

  useEffect(() => {
    if (accessGranted && recordId) {
      fetchRecord(); // Fetch the record if access is granted
    }
  }, [accessGranted, fetchRecord, recordId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center mt-6">
      {accessGranted && record ? (
        <motion.div
          className="w-full p-6 bg-white rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Record Details
          </h1>

          <p className="text-xl font-semibold mb-4">
            <strong>Description: </strong>
            {record.description}
          </p>

          <div className="mt-6 border-t border-gray-300 pt-4">
            <h3 className="text-xl font-semibold mb-4">Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {record.cids.map((cid: string, index: number) => (
                <motion.div
                  key={index}
                  className="w-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    duration: 0.5,
                  }}
                >
                  <img
                    src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}${cid}`}
                    alt={`Record Image ${index}`}
                    className="w-full max-w-40 max-h-64 rounded-lg shadow-md object-cover transition-all duration-300 ease-in-out"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/300")
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-red-500 text-xl">
          {accessGranted
            ? "Record not found or you don't have access."
            : "Access is not granted or has expired."}
        </div>
      )}
    </div>
  );
};

export default ViewRecordIfAccessGranted;
