import { motion } from "framer-motion";
import useFetchRecord from "./utils/useFetchRecord";
import { useState } from "react";
import GrantRevokeAccess from "./GrantRevokeAccess";

export default function RecordOwnershipCheck() {
  const [recordId, setRecordId] = useState<string>("");
  const { record, loading, error, fetchRecord } = useFetchRecord(recordId); // Use the hook

  return (
    <div className="flex flex-col md:flex-row mt-24 justify-center mx-auto gap-6 px-4">
      {/* Left Section - Record Info */}
      <motion.div
        className="p-6 w-full md:w-2/3 bg-white rounded-lg shadow-xl h-auto overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Check Record
        </h1>

        <div className="mb-6 flex flex-col items-center space-y-4">
          <input
            type="text"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="Enter Record ID"
            className="w-full max-w-md p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={fetchRecord}
            disabled={loading || !recordId}
            className="w-full max-w-md p-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition-all"
          >
            {loading ? "Loading..." : "Fetch Record"}
          </button>
        </div>

        {error && <div className="text-red-500 text-center mt-4">{error}</div>}

        {record && !loading && !error && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Record Details
            </h2>
            <div className="text-lg mb-2">
              <p>
                <strong className="font-semibold">Owner:</strong> {record.owner}
              </p>
              <p className="font-semibold text-green-500">
                You are the owner of this record
              </p>
            </div>
            <p className="text-lg mb-4">
              <strong className="font-semibold">Description:</strong>{" "}
              {record.description}
            </p>

            {/* Image Section */}
            <div className="mt-6 border-t border-gray-300 pt-4">
              <h3 className="text-xl font-semibold mb-4">Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {record.cids.map((cid, index) => (
                  <motion.div
                    key={index}
                    className="w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      duration: 0.5,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <img
                      src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}${cid}`}
                      alt={`Record Image ${index}`}
                      className="w-full max-w-40 max-h-64 rounded-lg shadow-md object-cover transition-all duration-300 ease-in-out"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/300")
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Right Section - Grant/Revoke Access */}
      <GrantRevokeAccess recordId={recordId} />
    </div>
  );
}
