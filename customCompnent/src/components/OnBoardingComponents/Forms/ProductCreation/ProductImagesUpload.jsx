import React, { useRef, useState } from "react";

// Icons
import {
  IoCloudUploadOutline,
  IoImageOutline,
  IoCheckmarkCircle,
  IoTrashOutline,
} from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Services
import ProductApi from "../../../../services/ProductApi.js";

// Constants
const MIN_IMAGES = 3;
const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const GUIDELINES = [
  `Upload at least ${MIN_IMAGES} images (you can upload up to ${MAX_IMAGES})`,
  "First image will be your product thumbnail",
  "Use high-quality, clear & well-lit images",
  "Recommended size: 1000x1000px or more",
  "Supported formats: JPG, PNG, WEBP",
  `Maximum file size: ${MAX_SIZE_MB}MB per image`,
];

function ProductImagesUpload({ productId, onBack, onNext }) {
  const inputRef = useRef(null);

  // `images` — confirmed URLs already saved on the product (server truth).
  // `pendingFiles` — freshly selected files staged locally, not yet sent
  // to the server. They only leave this state once the batch upload
  // succeeds and the server echoes back the merged image list.
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [finalProductData, setFinalProductData] = useState(null);

  const totalCount = images.length + pendingFiles.length;
  const hasUnsavedFiles = pendingFiles.length > 0;
  const canUpload = totalCount >= MIN_IMAGES && hasUnsavedFiles && !uploading;
  const canGoNext =
    images.length >= MIN_IMAGES && !hasUnsavedFiles && !uploading;

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setError("");

    const remainingSlots = MAX_IMAGES - totalCount;
    if (remainingSlots <= 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    const accepted = [];
    for (const file of files) {
      if (accepted.length >= remainingSlots) break;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload JPG, PNG or WEBP files only");
        continue;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError(`Each image must be under ${MAX_SIZE_MB}MB`);
        continue;
      }

      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (!accepted.length) return;

    // Just stage locally — no API call here. Upload happens explicitly
    // once the user clicks "Upload Images" below.
    setPendingFiles((prev) => [...prev, ...accepted]);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  // Removing an already-uploaded (server-confirmed) image.
  const handleRemoveImage = (url) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  // Removing a locally-staged file that hasn't been uploaded yet.
  const handleRemovePending = (id) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== id));
  };

  const handleUpload = async () => {
    if (!productId) {
      setError("Missing product — please go back and try again");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      images.forEach((url) => formData.append("existingImages", url));
      pendingFiles.forEach(({ file }) => formData.append("images", file));

      const response = await ProductApi.addProductImages(formData);
      const product = response?.data || response;
      setFinalProductData(product);
      setImages(product?.images || images);
      setPendingFiles([]);
    } catch (err) {
      setError(err?.message || "Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (images.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }
    if (hasUnsavedFiles) {
      setError("Please upload your selected images before continuing");
      return;
    }
    onNext?.(finalProductData);
  };

  const thumbnails = [
    ...images.map((url) => ({ type: "uploaded", url })),
    ...pendingFiles.map((pf) => ({ type: "pending", ...pf })),
  ];
  const placeholderSlots = Math.max(MAX_IMAGES - thumbnails.length, 0);

  return (
    <div className="flex flex-col items-stretch my-3 flex-1 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-zinc-800 text-lg text-start font-semibold dark:text-gray-200">
          Upload Product Images
        </span>
        <span className="text-gray-500 text-sm text-start font-medium dark:text-gray-400">
          Upload high-quality images of your product. You need to upload at
          least {MIN_IMAGES} images.
        </span>
      </div>

      <div className="flex flex-col gap-3 my-3">
        <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
          Product Images
        </span>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-violet-300 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-900/60 px-4 py-8 text-center"
        >
          <IoCloudUploadOutline className="h-8 w-8 text-violet-500" />
          <p className="text-sm text-zinc-700 dark:text-gray-300">
            Drag &amp; drop images here or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              click to browse
            </button>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(
              ", ",
            )}{" "}
            up to {MAX_SIZE_MB}MB each
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || totalCount >= MAX_IMAGES}
            className="mt-1 flex items-center gap-2 rounded-md border border-violet-600/50 px-3 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-600/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-violet-400"
          >
            <IoCloudUploadOutline className="h-3.5 w-3.5" />
            Choose Files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* Guidelines */}
        <div className="flex flex-col gap-1.5 rounded-lg bg-violet-50 dark:bg-slate-900/60 px-3 py-3">
          <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
            Image Guidelines
          </span>
          <ul className="flex flex-col gap-1">
            {GUIDELINES.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-gray-400"
              >
                <IoCheckmarkCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Thumbnails */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">
            Images ({totalCount} / {MAX_IMAGES})
          </span>
          {totalCount < MIN_IMAGES && (
            <span className="text-xs font-medium text-red-500">
              Minimum {MIN_IMAGES} images required
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((thumb, index) => (
            <div
              key={thumb.type === "uploaded" ? thumb.url : thumb.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800"
            >
              <span className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold text-white">
                {index + 1}
              </span>

              <img
                src={thumb.type === "uploaded" ? thumb.url : thumb.previewUrl}
                alt={`Product ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {thumb.type === "pending" && uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-white" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    thumb.type === "uploaded"
                      ? handleRemoveImage(thumb.url)
                      : handleRemovePending(thumb.id)
                  }
                  disabled={uploading}
                  aria-label="Remove image"
                  className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/90"
                >
                  <IoTrashOutline className="h-3 w-3" />
                </button>
              )}

              {thumb.type === "pending" && (
                <span className="absolute bottom-1.5 left-1.5 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                  Not uploaded
                </span>
              )}
            </div>
          ))}

          {Array.from({ length: placeholderSlots }).map((_, i) => (
            <button
              key={`placeholder-${i}`}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-violet-400 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-gray-500"
            >
              <IoImageOutline className="h-5 w-5" />
              <span className="text-[10px] font-medium">Add image</span>
            </button>
          ))}
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}

        {/* Explicit upload action — only appears once there's something
            unsaved to upload and the minimum count is met. */}
        {hasUnsavedFiles && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload}
            className="flex items-center justify-center gap-2 rounded-lg border border-violet-600 px-4 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-600/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-violet-400"
          >
            {uploading ? (
              <>
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <IoCloudUploadOutline className="h-4 w-4" />
                <span>
                  Upload {pendingFiles.length}{" "}
                  {pendingFiles.length === 1 ? "Image" : "Images"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={uploading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-slate-700 dark:text-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>Add your first product</span>
          <IoIosArrowRoundForward size={18} />
        </button>
      </div>
    </div>
  );
}

export default ProductImagesUpload;
