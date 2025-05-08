import React, { useState } from "react";
import { create } from "ipfs-http-client";
import { Upload } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";
import { v4 } from "uuid";
import { ethers } from "ethers";
import { ABI_UPLOAD_PRODUCT, contractAddress } from "../config";
import Web3Service from "@/services/web3Service";
import { useNavigate } from "react-router-dom";
import Modal from "../../../common/modal";

type Product = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  days?: number;
  isSoldOut?: boolean;
  isOnSale?: boolean;
};

const UploadProduct: React.FC = () => {
  const { address } = useSelector((state: RootState) => state.account);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState<Omit<Product, "">>({
    id: v4(),
    image: "",
    brand: "",
    name: "",
    price: 0,
    oldPrice: 0,
    rating: 0,
    days: undefined,
    isSoldOut: false,
    isOnSale: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    brand?: string;
    price?: string;
    oldPrice?: string;
    days?: string;
    image?: string;
    rating?: string;
  }>({});
  const [showReview, setShowReview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "oldPrice") {
      const oldPriceValue = Number(value);
      setFormData((prev) => ({
        ...prev,
        oldPrice: oldPriceValue,
        isOnSale: oldPriceValue > 0,
        days: oldPriceValue > 0 ? prev.days ?? 0 : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "days" ? Number(value) : value,
      }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileToUpload(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    // Validate brand
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    } else if (formData.brand.length < 2) {
      newErrors.brand = "Brand must be at least 2 characters";
    }

    // Validate price
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Validate old price if provided
    if (formData.oldPrice !== undefined && formData.oldPrice > 0) {
      if (formData.oldPrice <= formData.price) {
        newErrors.oldPrice = "Old price must be greater than current price";
      }
    }

    // Validate days if on sale
    if (formData.oldPrice !== undefined && formData.oldPrice > 0) {
      if (!formData.days || formData.days < 1) {
        newErrors.days = "Sale duration must be at least 1 day";
      }
    }

    // Validate image
    if (!imageFile) {
      newErrors.image = "Product image is required";
    }

    // Validate rating
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowReview(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      if (fileToUpload === null) return [];
      if (!address) return [];

      const imageCid = await uploadToIPFS(fileToUpload);

      const web3 = Web3Service.getInstance().getWeb3();

      // Setup the provider and signer
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_PUBLIC_GARNACHO_RPC_URL
      );
      const signer = await provider.getSigner(address);
      const contract = new ethers.Contract(
        contractAddress,
        ABI_UPLOAD_PRODUCT,
        signer
      );
      // Call the smart contract to upload the product
      const tx = await contract.uploadProduct(
        formData.name,
        imageCid,
        formData.brand,
        web3.utils.toWei(formData.price, "ether"),
        web3.utils.toWei(formData.oldPrice || 0, "ether"),
        Number(formData.rating || 0),
        formData.days || 0,
        formData.isOnSale,
        { gasLimit: 1000000 }
      );

      // Wait for the transaction to be mined
      await tx.wait();

      setShowSuccessModal(true);
      setShowReview(false);

      // Reset form state after successful submission
      setFormData({
        id: v4(),
        image: "",
        brand: "",
        name: "",
        price: 0,
        oldPrice: undefined,
        rating: 0,
        days: undefined,
        isSoldOut: false,
        isOnSale: false,
      });
      setImageFile(null);
      setPreviewUrl("");
      setErrors({});

    } catch (error) {
      console.error("Error submitting product:", error);
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const ipfs = create({ url: import.meta.env.VITE_IPFS_API_URL });
      const added = await ipfs.add(file);
      return added.path; // Get the CID of the uploaded file
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {showReview ? "Review Your Product" : "Upload New Product"}
      </h2>

      {!showReview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 ${
                errors.image ? "border-red-500" : "border-gray-200"
              }`}
              onClick={() => document.getElementById("imageInput")?.click()}
            >
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-48 mx-auto"
                />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload size={48} className="text-blue-500" />
                  <span className="text-gray-600">
                    Click to upload product image
                  </span>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                minLength={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                minLength={2}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={(e) => {
                  const value = Math.min(
                    5,
                    Math.max(0, Math.round(Number(e.target.value)))
                  );
                  setFormData((prev) => ({
                    ...prev,
                    rating: value,
                  }));
                }}
                required
                min={0}
                max={5}
                step={1}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rating ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min={1}
                  step={1}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Old Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice ?? ""}
                  onChange={handleInputChange}
                  min={1}
                  step={1}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.oldPrice ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.oldPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.oldPrice}</p>
              )}
            </div>

            {formData.oldPrice !== undefined && formData.oldPrice > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Duration (Days) *
                </label>
                <input
                  type="number"
                  name="days"
                  value={formData.days ?? ""}
                  onChange={handleInputChange}
                  required
                  min={1}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.days ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.days && (
                  <p className="mt-1 text-sm text-red-600">{errors.days}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Review Product"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Review Section */}
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  Product Image
                </h4>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Product Preview"
                    className="max-w-[200px] rounded-lg"
                  />
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Product Name</h4>
                <p className="text-gray-600">{formData.name}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Product Id</h4>
                <p className="text-gray-600">{formData.id}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Brand</h4>
                <p className="text-gray-600">{formData.brand}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Current Price</h4>
                <p className="text-gray-600">${formData.price.toFixed(2)}</p>
              </div>

              {formData.oldPrice && formData.oldPrice > 0 && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-700">Old Price</h4>
                    <p className="text-gray-600">
                      ${formData.oldPrice.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Sale Duration</h4>
                    <p className="text-gray-600">{formData.days} days</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Discount</h4>
                    <p className="text-green-600">
                      {((1 - formData.price / formData.oldPrice) * 100).toFixed(
                        1
                      )}
                      % off
                    </p>
                  </div>
                </>
              )}

              <div className="cursor-default">
                <h4 className="font-medium text-gray-700">Initial Rating</h4>

                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Edit Product
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Uploading..." : "Confirm & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="text-center">
          <p className="text-lg mb-4">Product uploaded successfully!</p>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate("/services/medicines");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Medicines
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UploadProduct;
