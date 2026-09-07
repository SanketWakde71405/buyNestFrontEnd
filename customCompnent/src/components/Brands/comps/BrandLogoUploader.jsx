import { IoCloudUploadOutline } from "react-icons/io5";
import { IoFolderOpenOutline } from "react-icons/io5";

import ButtonIcon from "../../ButtonIcon";
import { MAX_LOGO_SIZE_MB, ACCEPTED_LOGO_TYPES } from "../../../utils/constants.js";

const SIZE_STYLES = {
  lg: {
    container: "gap-3 py-10 px-4",
    iconWrap: "p-3",
    iconSize: 26,
    label: "text-sm",
    browseIconSize: 18,
  },
  sm: {
    container: "gap-2 py-6 px-3 text-center",
    iconWrap: "p-2.5",
    iconSize: 22,
    label: "text-xs",
    browseIconSize: 16,
  },
};

/**
 * Drag-and-drop / browse dropzone for uploading a brand logo.
 *
 * This component only renders the dropzone + its error message — it does
 * not own any state. The parent still tracks `dragActive`, holds the
 * `fileInputRef`, and decides what happens on drop/pick/validation, since
 * that varies between the "create" and "edit" flows (e.g. edit also has
 * to reconcile an existing logo).
 *
 * @param {"lg"|"sm"} size - visual scale; "lg" for the create-brand form,
 *   "sm" for the more compact edit-brand layout.
 * @param {boolean} dragActive - whether a file is currently being dragged over.
 * @param {(e: DragEvent) => void} onDragOver
 * @param {(e: DragEvent) => void} onDragLeave
 * @param {(e: DragEvent) => void} onDrop
 * @param {React.RefObject<HTMLInputElement>} fileInputRef
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onFileChange
 * @param {string} [logoError] - validation error to show below the dropzone.
 * @param {string} [dropLabel] - primary instruction text inside the dropzone.
 */

export default function BrandLogoUploader({
  size = "lg",
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  onFileChange,
  logoError,
  dropLabel = "Drag and drop your file here",
}) {
  const s = SIZE_STYLES[size] ?? SIZE_STYLES.lg;

  return (
    <>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${s.container} ${
          dragActive
            ? "border-indigo-400 bg-indigo-50 dark:bg-slate-800"
            : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950"
        }`}
      >
        <div
          className={`rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 ${s.iconWrap}`}
        >
          <IoCloudUploadOutline size={s.iconSize} />
        </div>
        <span className={`${s.label} text-zinc-700 dark:text-gray-300`}>
          {dropLabel}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">or</span>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_LOGO_TYPES.join(",")}
          className="hidden"
          onChange={onFileChange}
        />
        <ButtonIcon
          type="button"
          icon={<IoFolderOpenOutline size={s.browseIconSize} />}
          text="Browse Files"
          onClick={(e) => {
            // Guard against ButtonIcon rendering a plain <button> without
            // forwarding `type` — inside a <form>, an untyped button
            // defaults to type="submit" and would submit the form the
            // instant this is clicked.
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        />

        <span className="text-xs text-gray-400 dark:text-gray-500">
          JPG, PNG or WebP. Max size {MAX_LOGO_SIZE_MB}MB.
        </span>
      </div>
      {logoError && <span className="text-xs text-red-500">{logoError}</span>}
    </>
  );
}
