import { useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoImagesOutline,
} from "react-icons/io5";

/**
 * Pure display component — takes the product's `images` array and title,
 * and handles its own slide index internally. No editing affordances;
 * this is the read-only counterpart to the image manager in
 * EditProductOutlet.
 */
export default function ProductImageSlider({ images = [], title = "Product" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIndex] : null;

  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-violet-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
        {images.length > 0 && (
          <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            <IoImagesOutline size={13} />
            {images.length} {images.length === 1 ? "Image" : "Images"}
          </span>
        )}

        {hasImages ? (
          <img
            src={activeImage}
            alt={`${title} — image ${activeIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
            <IoImagesOutline size={32} />
            <p className="text-xs">No images uploaded</p>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm ring-1 ring-black/5 transition-colors hover:text-indigo-600 dark:bg-slate-900 dark:text-gray-300 dark:ring-white/10"
            >
              <IoChevronBack size={16} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm ring-1 ring-black/5 transition-colors hover:text-indigo-600 dark:bg-slate-900 dark:text-gray-300 dark:ring-white/10"
            >
              <IoChevronForward size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, index) => (
            <button
              type="button"
              key={url + index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex
                  ? "border-indigo-500"
                  : "border-transparent ring-1 ring-violet-100 dark:ring-slate-800"
              }`}
            >
              <img
                src={url}
                alt={`${title} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
