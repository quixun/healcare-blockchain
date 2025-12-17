import React, { useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { v4 as uuidv4 } from "uuid";
import {
  contractAddress,
  UPLOAD_MEDICAL_RECORDS_ABI,
} from "./configs/contract";
import { motion } from "framer-motion";
import { encryptFileContent } from "../../utils/encryption";
import { toast } from "sonner";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

type MedicalRecordForm = {
  name: string;
  age: number;
  gender: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
};

const UploadInfoForm: React.FC = () => {
  const { control, handleSubmit, reset } = useForm<MedicalRecordForm>();
  const [files, setFiles] = useState<File[]>([]);
  const [recordId, setRecordId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { address } = useSelector((state: RootState) => state.account);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecordId(uuidv4());
  }, []);

  const checkLogin = async () => {
    if (!address) {
      toast.warning("Please connect your wallet.");
      return null;
    }
    return address;
  };

  const onSubmit = async (data: MedicalRecordForm) => {
    if (files.length === 0) {
      return toast.warning("Please select at least one file to upload.");
    }

    try {
      setLoading(true);
      setStatus("Encrypting and uploading files to IPFS...");
      const cids: string[] = [];

      for (const file of files) {
        const encryptedContent = await encryptFileContent(
          file,
          import.meta.env.VITE_SECRET_KEY
        );
        const encryptedBlob = new Blob([encryptedContent], {
          type: "text/plain",
        });
        const added = await ipfs.add(encryptedBlob);
        cids.push(added.path);
      }

      const account = await checkLogin();
      if (!account) return;

      setStatus("Sending transaction to the blockchain...");
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const signer = await provider.getSigner(account);
      const contract = new ethers.Contract(
        contractAddress,
        UPLOAD_MEDICAL_RECORDS_ABI,
        signer
      );

      const tx = await contract.uploadRecord(
        recordId,
        cids,
        data.name,
        data.age,
        data.gender,
        data.bloodPressure,
        data.heartRate,
        data.temperature,
        { gasLimit: 1000000 }
      );

      await tx.wait();

      toast.success("Medical record successfully uploaded!");
      reset();
      setFiles([]);
      setRecordId(uuidv4());
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      setStatus("✅ Upload complete!");
    } catch (error) {
      console.error("Upload Error:", error);
      setStatus("❌ Failed to upload. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    name: keyof MedicalRecordForm,
    label: string,
    type: string = "text"
  ) => (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">{label}</label>
          {name === "gender" ? (
            <select {...field} className="border p-2 rounded" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <input
              {...field}
              type={type}
              placeholder={label}
              className="border p-2 rounded"
              required
            />
          )}
        </div>
      )}
    />
  );

  return (
    <div className="my-20">
      <div className="flex justify-center">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6">Upload Medical Record</h2>

          <div className="mb-4 text-gray-600">
            <span className="font-semibold">Record ID:</span> {recordId}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Container */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Patient Info</h3>
                <div className="grid grid-cols-1 gap-4">
                  {renderField("name", "Full Name")}
                  {renderField("age", "Age", "number")}
                  {renderField("gender", "Gender")}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Vitals</h3>
                <div className="grid grid-cols-1 gap-4">
                  {renderField("bloodPressure", "Blood Pressure")}
                  {renderField("heartRate", "Heart Rate")}
                  {renderField("temperature", "Temperature")}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mt-8">
              <label className="block font-semibold mb-2">
                Upload Supporting Files (PDF, Image)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                ref={uploadInputRef}
                className="border p-2 rounded w-full"
              />
              {files.length > 0 && (
                <ul className="text-sm mt-2 text-gray-600 list-disc pl-5">
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {status && <p className="mt-4 text-blue-700">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Submit Record"}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default UploadInfoForm;
