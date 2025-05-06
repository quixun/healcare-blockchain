import { useState } from "react";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { contractAddress, ACCESS_CONTROL_ABI } from "./configs/contract";
import { motion } from "motion/react";

const GrantRevokeAccess = ({ recordId }: { recordId: string }) => {
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const { address: account } = useSelector((state: RootState) => state.account);

  const getContract = async () => {
    if (!account) return null;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    const signer = await provider.getSigner(account);
    return new ethers.Contract(contractAddress, ACCESS_CONTROL_ABI, signer);
  };

  const grantAccess = async () => {
    if (!address || !duration)
      return alert("Please enter address and duration");

    const durationInSeconds = parseInt(duration, 10);
    if (isNaN(durationInSeconds) || durationInSeconds <= 0)
      return alert("Invalid duration");

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) throw new Error("Contract not found");

      const tx = await contract.grantAccess(
        recordId,
        address,
        durationInSeconds
      );
      await tx.wait();
      alert(`Access granted to ${address} for ${durationInSeconds} seconds`);
    } catch (error) {
      console.error("Error granting access:", error);
      if (error === "CALL_EXCEPTION") {
        alert("Transaction reverted. Please check contract conditions.");
      } else {
        alert("Failed to grant access");
      }
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async () => {
    if (!address) return alert("Please enter an address");

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) throw new Error("Contract not found");

      const tx = await contract.revokeAccess(recordId, address);
      await tx.wait();
      alert(`Access revoked for ${address}`);
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-4 border rounded-lg shadow-md"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-2">Manage Record Access</h2>
      <input
        type="text"
        placeholder="Enter address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="number"
        placeholder="Enter duration (seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={grantAccess}
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded w-full"
        >
          {loading ? "Granting..." : "Grant Access"}
        </button>
        <button
          onClick={revokeAccess}
          disabled={loading}
          className="bg-red-500 text-white p-2 rounded w-full"
        >
          {loading ? "Revoking..." : "Revoke Access"}
        </button>
      </div>
    </motion.div>
  );
};

export default GrantRevokeAccess;
