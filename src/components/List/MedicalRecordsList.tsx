import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useFetchAllRecords from "./utils/useFetchAllRecords";
import { useNavigate } from "react-router";
import { fetchAndDecryptFiles } from "@/utils/encryption";
import SubHeader from "@/layouts/sub-header/sub-header";
import SharedRecord from "./components/shared-record";

function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const total = images.length;

  if (total === 0) return null;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  return (
    <div className="">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <div
        className="relative w-full h-70 flex items-center justify-center overflow-hidden rounded-lg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${title} ${index + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onError={(e) => (e.currentTarget.src = "")}
          />
        </AnimatePresence>

        {total > 1 && hovered && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 left-2 cursor-pointer -translate-y-1/2 bg-gray-700 text-white py-1 px-2 rounded-full"
            >
              ◀
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-2 cursor-pointer -translate-y-1/2 bg-gray-700 text-white py-1 px-2 rounded-full"
            >
              ▶
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UserRecordsList() {
  const { records } = useFetchAllRecords();
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const paginated = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const [decryptedImageUrls, setDecryptedImageUrls] = useState<{
    [key: string]: string[];
  }>({});

  useEffect(() => {
    const decryptImages = async () => {
      const secretKey = import.meta.env.VITE_SECRET_KEY;

      const newDecryptedImageUrls: { [key: string]: string[] } = {};

      for (const rec of records) {
        const decryptedFiles = await fetchAndDecryptFiles(rec.cids, secretKey);
        newDecryptedImageUrls[rec.id] = decryptedFiles;
      }

      setDecryptedImageUrls(newDecryptedImageUrls);
    };

    if (records.length > 0) {
      decryptImages();
    }
  }, [records]);

  const navigate = useNavigate();

  return (
    <div className="my-10">
      <SubHeader
        title="Medical Records"
        path="records"
        imageUrl="/images/banner3.jpg"
      />
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full px-9 pt-16 my-10 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl font-semibold text-center text-gray-800 mb-16"
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
              {paginated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {paginated.map((rec) => {
                    const imageUrls = decryptedImageUrls[rec.id];

                    return (
                      <motion.div
                        key={`${rec.id}-${rec.cids}`}
                        className="p-4 bg-gray-100 rounded-lg shadow-md flex flex-col justify-between h-full md:h-[550px]"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          duration: 0.9,
                        }}
                      >
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {rec.patientName}
                        </h3>
                        <div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            <strong>Owner:</strong> {rec.patientName}
                          </p>
                          <p className="text-sm text-gray-600 mb-4 truncate">
                            <strong>Record ID:</strong> {rec.id}
                          </p>
                        </div>

                        {imageUrls?.length > 0 ? (
                          <>
                            <ImageSlider
                              images={imageUrls}
                              title="Medical Images"
                            />
                            <button
                              onClick={() =>
                                navigate(`/services/record/details/${rec.id}`)
                              }
                              className="mt-4 px-3 py-1 cursor-pointer max-w-[40%] bg-blue-600 text-white text-sm mx-auto rounded hover:bg-blue-700 transition"
                            >
                              View Details
                            </button>
                          </>
                        ) : (
                          <p className="text-center text-gray-500">
                            No images available.
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500">No records found.</p>
              )}
            </motion.div>
          </AnimatePresence>

          {totalPages !== 1 && (
            <div className="flex justify-center items-center mt-16">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 cursor-pointer disabled:cursor-not-allowed bg-gray-300 text-gray-700 rounded-md mx-2 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-700 font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-300 cursor-pointer disabled:cursor-not-allowed text-gray-700 rounded-md mx-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>
      <div className="flex-1 flex justify-center items-center relative">
        <motion.div
          className="relative z-30 w-full px-9 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl font-semibold text-center text-gray-800 my-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            The Medical Records Shared With Me
          </motion.h1>
          <SharedRecord />
        </motion.div>
      </div>
    </div>
  );
}
