import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import useFetchAllRecords from "./utils/useFetchAllRecords";

export default function UserRecordsList() {
  const { records } = useFetchAllRecords();

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;
  const totalPages = Math.ceil(records.length / recordsPerPage);

  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="my-20">
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full px-9 pt-16 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl font-semibold text-center text-gray-800 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            My Medical Records
          </motion.h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              {paginatedRecords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {paginatedRecords.map((record, index) => (
                    <motion.div
                      key={`${currentPage}-${index}`}
                      className="p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        duration: 0.9,
                      }}
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {record.description}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Owner:</strong> {record.owner}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Record ID:</strong> {record.id}
                      </p>
                      <ImageSlider images={record.cids} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No records found.</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 cursor-pointer bg-gray-300 text-gray-700 rounded-md mx-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 disabled:hover:bg-gray-300 duration-300 ease-in-out"
            >
              Prev
            </button>
            <span className="text-gray-700 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 cursor-pointer bg-gray-300 text-gray-700 rounded-md mx-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 disabled:hover:bg-gray-300 duration-300 ease-in-out"
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const nextImage = () => setIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div
      className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}${images[index]}`}
          alt={`Record Image ${index}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onError={(e) =>
            (e.currentTarget.src = "https://via.placeholder.com/300")
          }
        />
      </AnimatePresence>

      {images.length > 1 && hovered && (
        <>
          <motion.button
            onClick={prevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-700 text-white py-2 px-3 rounded-full shadow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            ◀
          </motion.button>

          <motion.button
            onClick={nextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-700 text-white py-2 px-3 rounded-full shadow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            ▶
          </motion.button>
        </>
      )}
    </div>
  );
}
