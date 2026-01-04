import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
  Activity,
  FileText,
  Heart,
  Plus,
  Send,
  Stethoscope,
  Thermometer,
  Trash2,
  User,
} from "lucide-react";
import useFetchAllRecords from "./utils/useFetchAllRecords";
import { fetchAndDecryptFiles } from "@/utils/encryption";
import { useParams, useSearchParams } from "react-router-dom";
import ImageSlider from "./components/image-slider";
import GrantRevokeAccess from "./GrantRevokeAccess";
import useFetchSharedMedicalRecords from "./utils/useFetchSharedMedicalRecords";
import useAddRecommendation from "./utils/useAddRecommendation";
import useFetchRecommendations from "./utils/useFetchRecommendations";
import { getAllUsers, UserWithAddress } from "@/services/user-service";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";

type MedicineInput = {
  name: string;
  quantity: string;
  instructions: string;
};

export const RecordDetail = () => {
  const { recordID } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("type");

  const { records: allRecords } = useFetchAllRecords();
  const { records: sharedRecords } = useFetchSharedMedicalRecords();
  const records = query === "shared" ? sharedRecords : allRecords;
  const currentRecord = records.find((rec) => rec.id === recordID);

  const { address: account } = useSelector((state: RootState) => state.account);
  const [users, setUsers] = useState<UserWithAddress[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users", error);
        toast.error("Could not load user list");
      }
    };
    fetchUsers();
  }, []);

  const getDoctorName = (doctorAddress: string) => {
    if (!doctorAddress) return "Unknown Doctor";

    if (account && doctorAddress.toLowerCase() === account.toLowerCase()) {
      return "You";
    }

    const foundUser = users.find(
      (u) => u.address.toLowerCase() === doctorAddress.toLowerCase()
    );

    return foundUser
      ? foundUser.userName
      : `${doctorAddress.slice(0, 6)}...${doctorAddress.slice(-4)}`;
  };

  const {
    recommendations,
    loading: recLoading,
    refetch,
  } = useFetchRecommendations(currentRecord?.id);
  const { addRecommendation, isSubmitting } = useAddRecommendation();

  const [decryptedImageUrls, setDecryptedImageUrls] = useState<{
    [key: string]: string[];
  }>({});

  // --- NEW FORM STATE ---
  const [diagInput, setDiagInput] = useState("");
  const [medInputs, setMedInputs] = useState<MedicineInput[]>([
    { name: "", quantity: "", instructions: "" },
  ]);

  // Image Decryption Logic (Existing)
  useEffect(() => {
    if (!currentRecord) return;
    const decryptImages = async () => {
      const secretKey = import.meta.env.VITE_SECRET_KEY;
      const decryptedFiles = await fetchAndDecryptFiles(
        currentRecord.cids,
        secretKey
      );
      setDecryptedImageUrls((prev) => ({
        ...prev,
        [currentRecord.id]: decryptedFiles,
      }));
    };
    if (currentRecord.cids.length > 0) decryptImages();
  }, [currentRecord]);

  if (!currentRecord || !recordID) return <div>Loading...</div>;

  // --- FORM HANDLERS ---
  const handleAddMedicineRow = () => {
    setMedInputs([...medInputs, { name: "", quantity: "", instructions: "" }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    const newMeds = [...medInputs];
    newMeds.splice(index, 1);
    setMedInputs(newMeds);
  };

  const handleMedicineChange = (
    index: number,
    field: keyof MedicineInput,
    value: string
  ) => {
    const newMeds = [...medInputs];
    newMeds[index][field] = value;
    setMedInputs(newMeds);
  };

  const handleSubmit = async () => {
    // Filter out empty rows
    const validMeds = medInputs.filter((m) => m.name.trim() !== "");

    if (!diagInput || validMeds.length === 0) {
      alert("Please provide a diagnosis and at least one medicine.");
      return;
    }

    const success = await addRecommendation(
      currentRecord.id,
      diagInput,
      validMeds
    );
    if (success) {
      setDiagInput("");
      setMedInputs([{ name: "", quantity: "", instructions: "" }]);
      refetch();
    }
  };

  return (
    <div className="flex gap-10 justify-center w-full">
      <Card className="p-4 rounded-2xl mb-10 shadow-md w-full max-w-xl mt-2">
        <CardContent className="space-y-4">
          <div className="space-y-6">
            {/* 1. Header Section: Patient Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentRecord?.patientName}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentRecord?.patientAge} years old •{" "}
                  {currentRecord?.patientGender}
                </p>
              </div>
            </div>

            {/* 2. Vitals Grid: Separate cards for key metrics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Vitals Readings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Blood Pressure Card */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">
                      Blood Pressure
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentRecord?.vitals.bloodPressure || "--/--"}
                  </span>
                  <span className="text-xs text-gray-500">mmHg</span>
                </div>

                {/* Heart Rate Card */}
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">
                      Heart Rate
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentRecord?.vitals.heartRate || "--"}
                  </span>
                  <span className="text-xs text-gray-500">bpm</span>
                </div>

                {/* Temperature Card */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">
                      Temperature
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {currentRecord?.vitals.temperature || "--"}
                  </span>
                  <span className="text-xs text-gray-500">°C / °F</span>
                </div>
              </div>
            </div>

            {/* 3. Description Section: Distinct text block */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Clinical Description
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {currentRecord?.vitals.description ||
                  "No description provided."}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600 mb-3">
              <Stethoscope className="w-5 h-5" /> Doctor Recommendations
            </h3>

            {recLoading && <p className="text-sm text-gray-400">Loading...</p>}
            {!recLoading && recommendations.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                No recommendations yet.
              </p>
            )}

            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm"
                >
                  {/* Header: Doctor & Date */}
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {getDoctorName(rec.doctor) === "You"
                        ? "You"
                        : `Dr. ${getDoctorName(rec.doctor)}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(rec.timestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Diagnosis */}
                  <div className="mb-3">
                    <span className="font-semibold text-gray-700">
                      Diagnosis:{" "}
                    </span>
                    <span className="text-gray-800">{rec.diagnosis}</span>
                  </div>

                  {/* Medicine List Table */}
                  <div className="bg-white rounded border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-medium">
                        <tr>
                          <th className="p-2">Medicine</th>
                          <th className="p-2">Qty</th>
                          <th className="p-2">Instruction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rec.medicines.map((med, mIdx) => (
                          <tr key={mIdx}>
                            <td className="p-2 font-medium text-blue-600">
                              {med.name}
                            </td>
                            <td className="p-2 text-gray-600">
                              {med.quantity}
                            </td>
                            <td className="p-2 text-gray-600 italic">
                              {med.instructions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {query === "shared" && (
            <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-200">
              <div className="bg-blue-50/80 p-5 rounded-xl border border-blue-100">
                <h4 className="text-md font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4" /> New Prescription
                </h4>

                {/* Diagnosis Input */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                    Diagnosis
                  </label>
                  <textarea
                    className="w-full text-sm p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="e.g. Acute Bronchitis"
                    value={diagInput}
                    onChange={(e) => setDiagInput(e.target.value)}
                  />
                </div>

                {/* Dynamic Medicine Inputs */}
                <div className="space-y-3 mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">
                    Medicines
                  </label>
                  {medInputs.map((med, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        className="flex-1 min-w-[30%] text-sm p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="Name (e.g. Panadol)"
                        value={med.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                      />
                      <input
                        className="w-20 text-sm p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="Qty"
                        value={med.quantity}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                      />
                      <input
                        className="flex-1 text-sm p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                        placeholder="Instruction"
                        value={med.instructions}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "instructions",
                            e.target.value
                          )
                        }
                      />
                      {medInputs.length > 1 && (
                        <button
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleAddMedicineRow}
                    className="text-xs flex items-center gap-1 text-blue-600 font-semibold hover:underline mt-2"
                  >
                    <Plus className="w-3 h-3" /> Add another medicine
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? "Processing..." : "Submit Prescription"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 w-full lg:w-[400px] shrink-0 h-fit sticky top-20 pb-10">
        {/* Image Slider Component */}
        <Card>
          <CardContent className="pt-4">
            <ImageSlider
              images={decryptedImageUrls[currentRecord.id] || []}
              title="Medical Images"
            />
          </CardContent>
        </Card>

        {/* Access Control Component */}
        {query !== "shared" && (
          <GrantRevokeAccess
            recordId={currentRecord.id}
            major={currentRecord?.vitals.diseaseGroup}
          />
        )}
      </div>
    </div>
  );
};
