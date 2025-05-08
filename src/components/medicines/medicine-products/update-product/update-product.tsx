"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateProduct } from "./use-update-product";
import { useSelector } from "react-redux";
import { RootState } from "@/features/store";
import { useFetchProducts } from "../get-product/use-fetch-product";

export default function UpdateProduct() {
  const { productID } = useParams();
  const [form, setForm] = useState({
    id: 1,
    brand: "",
    name: "",
    currentPrice: "",
    oldPrice: "",
    rating: 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [existingImageCID, setExistingImageCID] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { address } = useSelector((state: RootState) => state.account);
  const {
    products,
    loading: fetchLoading,
    error: fetchError,
  } = useFetchProducts();
  const {
    updateProduct,
    loading: updateLoading,
    error: updateError,
  } = useUpdateProduct(address);

  useEffect(() => {
    if (products.length > 0 && productID) {
      const currentProduct = products.find((p) => p.id === Number(productID));
      if (currentProduct) {
        if (currentProduct.isSold) {
          setError("Product is already sold");
        }
        setForm({
          id: currentProduct.id,
          brand: currentProduct.brand,
          name: currentProduct.name,
          currentPrice: currentProduct.currentPrice,
          oldPrice: currentProduct.oldPrice,
          rating: currentProduct.rating,
        });
        setExistingImageCID(currentProduct.imageCID);
      }
    }
  }, [products, productID, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateProduct(
      form.id,
      form.brand,
      form.name,
      existingImageCID,
      form.currentPrice,
      form.oldPrice,
      Number(form.rating),
      file || undefined
    );

    if (result?.success) {
      alert("Product updated successfully");
      navigate("/services/medicines");
    } else {
      alert(result.error || "Update failed");
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center text-red-500 py-10">Error: {fetchError}</div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col px-4 py-8 mt-10">
      <h1 className="text-4xl font-bold mb-6">Update Product</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10"
      >
        <div className="relative space-y-2 w-full">
          <label className="absolute top-10 left-10 block text-sm font-medium text-white bg-green-400 px-4 py-2 rounded-md shadow-md">
            Current Product Image
          </label>
          <div className="px-4 py-2 rounded">
            <img
              src={`${
                import.meta.env.VITE_IPFS_GATEWAY_URL
              }/${existingImageCID}`}
              alt={form.name}
              className="mx-auto h-full rounded-t-lg w-full object-contain mb-4 border border-gray-200 shadow-md"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Current Price
            </label>
            <input
              type="text"
              name="currentPrice"
              value={form.currentPrice}
              onChange={handleChange}
              placeholder="Enter current price"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Old Price
            </label>
            <input
              type="text"
              name="oldPrice"
              value={form.oldPrice}
              onChange={handleChange}
              placeholder="Enter old price"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rating (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={form.rating}
              onChange={(e) => {
                const value = Math.min(
                  5,
                  Math.max(0, Math.round(Number(e.target.value)))
                );
                setForm((prev) => ({
                  ...prev,
                  rating: value,
                }));
              }}
              placeholder="Enter rating"
              min="0"
              max="5"
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Update Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded"
            />
            <p className="text-sm text-gray-500">
              Leave empty to keep current image
            </p>
          </div>
          {updateError && <p className="text-red-600 text-sm">{updateError}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={updateLoading || error !== ""}
            className="w-full bg-blue-600 max-w-60 mx-auto text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {updateLoading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
