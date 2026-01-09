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
import { DISEASE_GROUPS } from "@/constant/major";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ImageSlider from "./components/image-slider";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

type MedicalRecordForm = {
  name: string;
  age: number;
  gender: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  diseaseGroup: string;
  description: string;
};

const UploadInfoForm: React.FC = () => {
  const { control, handleSubmit, reset } = useForm<MedicalRecordForm>();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [recordId, setRecordId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const { address } = useSelector((state: RootState) => state.account);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecordId(uuidv4());
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrls([]);
      return;
    }

    // 1. Filter only image files for the slider
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // 2. Create Object URLs
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);

    // 3. Cleanup function: Revoke URLs to avoid memory leaks
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

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
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL
      );
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
        data.diseaseGroup,
        data.description,
        { gasLimit: 1000000 }
      );

      await tx.wait();

      toast.success("Medical record successfully uploaded!");
      navigate(`/services/record/details/${recordId}`);
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
    placeholder: string = "",
    type: string = "text"
  ) => (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({
        field: { onChange, value, ...field },
        fieldState: { error },
      }) => (
        <div className="flex flex-col">
          <label className="mb-1 font-semibold text-sm text-gray-700">
            {label}
          </label>
          {name === "gender" ? (
            <Select onValueChange={onChange} defaultValue={String(value)}>
              <SelectTrigger className="w-full border p-2 rounded">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <input
              {...field}
              value={value}
              type={type}
              min={0}
              placeholder={
                placeholder || (name === "heartRate" ? "__-__" : label)
              }
              className={`border p-2 rounded transition-colors ${
                error
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              onChange={(e) => {
                let val = e.target.value;

                // --- HEART RATE MASK (00-00) ---
                if (name === "heartRate") {
                  // 1. Remove everything except digits
                  const digits = val.replace(/\D/g, "");

                  // 2. Limit to 4 digits total
                  const limited = digits.substring(0, 4);

                  // 3. Apply the mask: XX-XX
                  if (limited.length <= 2) {
                    val = limited;
                  } else {
                    val = `${limited.substring(0, 2)}-${limited.substring(2)}`;
                  }
                }

                // --- BLOOD PRESSURE MASK (000/00) ---
                if (name === "bloodPressure") {
                  const digits = val.replace(/\D/g, ""); // Remove non-digits
                  if (digits.length <= 3) {
                    val = digits;
                  } else {
                    // Automatically places slash after 3rd digit
                    val = `${digits.slice(0, 3)}/${digits.slice(3, 6)}`;
                  }
                }

                // --- TEMPERATURE LOGIC ---
                if (name === "temperature") {
                  val = val.replace(/[^0-9.]/g, "");
                  const parts = val.split(".");
                  if (parts.length > 2) val = parts[0] + "." + parts[1];
                  if (parseFloat(val) > 70) val = "70";
                }

                onChange(val);
              }}
            />
          )}
          {error && (
            <span className="text-red-500 text-xs mt-1">{error.message}</span>
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
                  {renderField("age", "Age", "Age", "number")}
                  {renderField("gender", "Gender")}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Vitals</h3>
                <div className="grid grid-cols-1 gap-4">
                  {renderField(
                    "bloodPressure",
                    "Blood Pressure",
                    "Blood Pressure"
                  )}
                  {renderField("heartRate", "Heart Rate (bpm)", "Heart Rate")}
                  {renderField("temperature", "Temperature", "Temperature")}
                  <Controller
                    name="diseaseGroup"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <div className="flex flex-col">
                        <label className="mb-1 font-semibold">
                          Specialty Required (Disease Group)
                        </label>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full border p-2 rounded">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {DISEASE_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />

                  {/* Description Textarea */}
                  <Controller
                    name="description"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <div className="flex flex-col">
                        <label className="mb-1 font-semibold">
                          Detailed Description / Symptoms
                        </label>
                        <textarea
                          {...field}
                          className="border p-2 rounded h-32"
                          placeholder="Describe the medical condition in detail..."
                          required
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Attachments
              </h3>

              {/* 1. Upload Box */}
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
                <label className="cursor-pointer block">
                  <div className="mb-2">
                    <span className="text-4xl">📂</span>
                  </div>
                  <span className="text-blue-600 font-medium hover:underline">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: JPG, PNG, PDF
                  </p>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    ref={uploadInputRef}
                    className="hidden"
                  />
                </label>
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-2">
                  <ImageSlider images={previewUrls} title={""} />
                </div>
              )}

              {files.length > 0 && (
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm mt-2">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">
                      Selected Files ({files.length})
                    </h4>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {files.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-xl">
                            {file.type.includes("image") ? "🖼️" : "📄"}
                          </span>
                          <span
                            className="truncate max-w-[200px] text-gray-700 font-medium"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
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
