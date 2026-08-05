import React, { useRef, useState } from "react";

// Icons
import { HiOutlinePhoto } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";
import { IoCloudUploadOutline } from "react-icons/io5";

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

function StoreLogoUpload({ value, onFileSelect, error: externalError }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [localError, setLocalError] = useState("");

  const error = externalError || localError;

  const validateAndSetFile = (file) => {
    if (!file) return;

    setLocalError("");

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
        Store Logo <span className="text-red-500">*</span>
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
              alt="Store logo preview"
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <HiOutlinePhoto className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 ring-2 ring-slate-900">
            <FaPlus className="h-2 w-2 text-white" />
          </div>
        </div>

        {/* Copy + action */}
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
              Upload your store logo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG or SVG. Max size {MAX_SIZE_KB}KB.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-fit items-center gap-2 rounded-md border border-violet-600/50 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-600/10"
          >
            <IoCloudUploadOutline className="h-3.5 w-3.5" />
            Choose File
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

export default StoreLogoUpload;
