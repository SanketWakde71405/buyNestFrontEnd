import React, { useRef, useState } from "react";

// Icons
import { HiOutlinePhoto } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";
import { IoCloudUploadOutline, IoCheckmarkCircle } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Services
import BrandApi from "../../../../services/BrandApi.js";

// Constants
const MAX_SIZE_KB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
];

// Util functions
function formatKB(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

function BrandLogoUpload({
  brandId,
  value,
  onFileSelect,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  error: externalError,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [localError, setLocalError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const error = externalError || localError;

  const uploadLogo = async (file) => {
    if (!brandId) {
      setLocalError("Missing brand — please go back and try again");
      onUploadError?.("Missing brand — please go back and try again");
      return;
    }

    setUploading(true);
    setUploaded(false);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("brandId", brandId);

      const data = await BrandApi.updateBrandLogo(formData);

      setUploaded(true);
      onUploadSuccess?.(data);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Upload failed — please try again";
      setLocalError(message);
      onUploadError?.(message);
    } finally {
      setUploading(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    setLocalError("");
    setUploaded(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Please upload a JPG, PNG or SVG file");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(
        `File is ${formatKB(file.size)} — max size is ${MAX_SIZE_KB}KB`,
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect?.(file);
    uploadLogo(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-gray-200">
        Brand Logo <span className="text-red-500">*</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`flex items-center gap-4 rounded-lg border border-dashed bg:slate-200/60 dark:bg-slate-900/60 p-4 transition-colors ${
          error ? "border-red-500/60" : "border-slate-700"
        }`}
      >
        {/* Thumbnail / placeholder */}
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-transparent dark:bg-slate-800">
          {preview ? (
            <img
              src={preview}
              alt="Brand logo preview"
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <HiOutlinePhoto className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          {uploading ? (
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-900">
              <AiOutlineLoading3Quarters className="h-2.5 w-2.5 animate-spin text-white" />
            </div>
          ) : uploaded ? (
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 ring-2 ring-slate-900">
              <IoCheckmarkCircle className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 ring-2 ring-slate-900">
              <FaPlus className="h-2 w-2 text-white" />
            </div>
          )}
        </div>

        {/* Copy + action */}
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
              Upload your brand logo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG or SVG. Max size {MAX_SIZE_KB}KB.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-fit items-center gap-2 rounded-md border border-violet-600/50 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IoCloudUploadOutline className="h-3.5 w-3.5" />
            {uploading
              ? "Uploading..."
              : uploaded
                ? "Change File"
                : "Choose File"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default BrandLogoUpload;
