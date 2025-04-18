import { useState } from "react";
import { motion } from "framer-motion";

export default function FindRecordPage() {
  const [recordId, setRecordId] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/records/${recordId}`);
      if (!response.ok) throw new Error("Record not found");
      const data = await response.json();
      setRecord(data);
    } catch (err) {
      setError(err.message);
      setRecord(null);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center mt-24 px-4">
      <motion.div
        className="p-6 w-full max-w-xl bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Find Medical Record
        </h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="Enter Record ID"
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={fetchRecord}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {record && (
          <motion.div
            className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2">{record.description}</h3>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Owner:</strong> {record.owner}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Record ID:</strong> {record.id}
            </p>
            {record.cids.length > 0 && <ImageSlider images={record.cids} />}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
