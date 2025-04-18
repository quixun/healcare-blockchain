import React, { useState, useRef, useEffect } from "react";
import { create } from "ipfs-http-client";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
// import Web3Service from "../../services/web3Service";
import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import {
  contractAddress,
  UPLOAD_MEDICAL_RECORDS_ABI,
} from "./configs/contract";
import { motion } from "motion/react";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

const UploadInfoForm: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState(""); // Optional description (currently not stored on-chain)
  const [recordId, setRecordId] = useState("");
  const [loading, setLoading] = useState(false);
  const { address } = useSelector((state: RootState) => state.account);
  // const web3 = Web3Service.getInstance().getWeb3();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Generate a record ID on mount
  useEffect(() => {
    setRecordId(uuidv4());
  }, []);

  const checkLogin = async () => {
    if (!address) {
      alert("Please login to your wallet.");
      return null;
    }
    return address;
  };

  const uploadToIPFS = async () => {
    if (files.length === 0) return alert("Please select files to upload.");
    try {
      setLoading(true);
      const cids: string[] = [];
      for (const file of files) {
        const added = await ipfs.add(file);
        cids.push(added.path);
      }
      await saveToBlockchain(cids);
    } catch (error) {
      console.error("IPFS Upload Error:", error);
      alert("Error uploading to IPFS");
    } finally {
      setLoading(false);
    }
  };

  const saveToBlockchain = async (cids: string[]) => {
    try {
      const account = await checkLogin();
      if (!account) return;

      // Initialize a provider and get the signer (using JsonRpcProvider for Ganache)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner(account);

      const contract = new ethers.Contract(
        contractAddress,
        UPLOAD_MEDICAL_RECORDS_ABI,
        signer
      );

      // Call the contract's uploadRecord function with recordId, array of cids, and description
      const tx = await contract.uploadRecord(recordId, cids, description, {
        gasLimit: 1000000,
      });
      await tx.wait();

      alert(`Medical record saved to blockchain! for acount: ${account}`);
      setFiles([]);
      setDescription("");
      // Generate a new record ID for the next upload
      setRecordId(uuidv4());
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    } catch (error) {
      console.error("Blockchain Error:", error);
      alert("Error saving record to blockchain: " + error);
    }
  };

  return (
    <div className="my-20">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full max-w-lg h-full max-h-[950px] px-9 pt-16 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:sticky top-20 self-start h-fit">
            <h1 className="text-3xl font-bold mb-6">Upload Medical Record</h1>

            {/* Display the generated Record ID */}
            <input
              type="text"
              placeholder="Record ID"
              value={recordId}
              readOnly
              className="border p-2 rounded-lg mb-4 w-full"
            />

            {/* Optional description field */}
            <textarea
              placeholder="Enter Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded-lg mb-4 w-full"
            />

            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="border p-2 rounded-lg mb-4 w-full"
              ref={uploadInputRef}
            />

            <button
              onClick={uploadToIPFS}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Upload and Save"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadInfoForm;
