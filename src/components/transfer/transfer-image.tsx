import React, { useState, useEffect, useCallback, useRef } from "react";
import { create } from "ipfs-http-client";
import { useSelector } from "react-redux";
import { RootState } from "../../features/store";
import Web3Service from "../../services/web3Service";

const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });

const ImageUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { address } = useSelector((state: RootState) => state.account);
  const web3 = Web3Service.getInstance().getWeb3();
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 2;
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = uploadedImages.slice(
    indexOfFirstImage,
    indexOfLastImage
  );
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(uploadedImages.length / imagesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const checkLogin = async () => {
    if (!address) {
      alert("Please login to your wallet.");
      return null;
    }
    return address;
  };

  const uploadToIPFS = async () => {
    if (!file) return alert("Please select an image.");

    try {
      setLoading(true);
      const added = await ipfs.add(file);

      await saveToBlockchain(added.path);
    } catch (error) {
      console.error("IPFS Upload Error:", error);
      alert("Error uploading to IPFS");
    } finally {
      setLoading(false);
    }
  };

  const saveToBlockchain = async (cid: string) => {
    try {
      const account = await checkLogin();
      if (!account) return;

      const imageData = `IMG:${cid}`;

      await web3.eth.sendTransaction({
        from: account,
        to: account,
        data: web3.utils.asciiToHex(imageData),
      });

      alert("Image CID saved to blockchain!");
      setUploadedImages((prev) => [cid, ...prev]);

      if (uploadInputRef.current) uploadInputRef.current.value = "";
    } catch (error) {
      console.error("Blockchain Error:", error);
      alert("Error saving CID to blockchain");
    }
  };

  const fetchUploadedImages = useCallback(async () => {
    try {
      if (!address) return;

      const latestBlock = await web3.eth.getBlockNumber();
      const images: string[] = [];

      for (
        let i = latestBlock;
        i >= Math.max(Number(latestBlock) - 100, 0);
        i--
      ) {
        const block = await web3.eth.getBlock(i, true);

        block.transactions.forEach((tx) => {
          if (
            typeof tx === "object" &&
            tx.from?.toLowerCase() === address.toLowerCase() &&
            tx.input !== "0x"
          ) {
            try {
              if (!tx.input) return;
              const decodedInput = web3.utils.hexToUtf8(tx.input);

              if (decodedInput.startsWith("IMG:")) {
                const cid = decodedInput.replace("IMG:", "");
                images.push(cid);
              }
            } catch (error) {
              console.error("Error decoding transaction input:", error);
            }
          }
        });
      }

      setUploadedImages(images);
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  }, [address, web3.eth, web3.utils]);

  useEffect(() => {
    fetchUploadedImages();
  }, [fetchUploadedImages]);

  return (
    <div className="p-8 grid grid-cols-1 mt-20 md:grid-cols-2 gap-8 h-screen overflow-y-hidden">
      <div className="md:sticky top-20 self-start h-fit">
        <h1 className="text-3xl font-bold mb-6">Upload Image to Blockchain</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
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
      <div className="overflow-y-auto max-h-[calc(100vh-5rem)] pr-4">
        <h2 className="text-2xl font-bold mb-4">Uploaded Images</h2>
        <div className="space-y-4">
          {currentImages.length > 0 ? (
            currentImages.map((image, index) => (
              <div key={index} className="border p-4 items-center flex flex-col rounded-lg overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${image}`}
                  alt="Uploaded"
                  className="object-contain rounded-lg mb-2"
                  style={{
                    maxWidth: "600px",
                    maxHeight: "400px",
                    width: "100%",
                    height: "auto",
                  }}
                />
                <a
                  href={`${import.meta.env.VITE_IPFS_GATEWAY_URL}/${image}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {image}
                </a>
              </div>
            ))
          ) : (
            <p>No images uploaded yet.</p>
          )}
        </div>

        {uploadedImages.length > imagesPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadPage;
