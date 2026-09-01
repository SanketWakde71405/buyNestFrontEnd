export const MIN_ACTIVE_IMAGES = 3;
export const MAX_IMAGES = 5;
export const LOW_STOCK_THRESHOLD = 10;
export const HIGH_STOCK_THRESHOLD = 20;

export function classifyStock(stock) {
  const n = Number(stock);
  if (stock === "" || stock == null || isNaN(n)) return null;
  if (n < LOW_STOCK_THRESHOLD) return { label: "Inactive", tone: "red" };
  if (n < HIGH_STOCK_THRESHOLD) return { label: "Low Stock", tone: "amber" };
  return { label: "Active", tone: "green" };
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const mergeBrandLists = (lists) => {
  const map = new Map();
  lists.flat().forEach((b) => map.set(b._id, b));
  return Array.from(map.values());
};

export function validateProductForm(
  formData,
  { selectedCategoryIds, selectedBrand, images } = {},
) {
  const errors = {};
  if (!formData.title.trim()) errors.title = "Product name is required";
  if (!formData.slug.trim()) errors.slug = "Slug is required";
  if (!formData.description.trim())
    errors.description = "Short description is required";
  if (formData.price === "" || Number(formData.price) < 0)
    errors.price = "Enter a valid selling price";
  if (formData.discountPrice === "" || Number(formData.discountPrice) < 0)
    errors.discountPrice = "Enter a valid discount price";
  if (formData.stock === "" || Number(formData.stock) < 0)
    errors.stock = "Enter a valid stock quantity";
  if (selectedCategoryIds.length === 0)
    errors.category = "Select at least one category";
  if (!selectedBrand) {
    errors.brand =
      selectedCategoryIds.length === 0
        ? "Select a category, then a brand"
        : "Select a brand";
  }
  if (images && images.length < MIN_ACTIVE_IMAGES)
    errors.images = `Add at least ${MIN_ACTIVE_IMAGES} images`;
  return errors;
}

export function getBrandFieldStatus({
  selectedCategoryIds,
  brandsLoading,
  brandsError,
  brands,
}) {
  if (selectedCategoryIds.length === 0) return "no-category";
  if (brandsLoading) return "loading";
  if (brandsError) return "error";
  if (brands.length === 0) return "empty";
  return "ready";
}

export const toneClasses = {
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};
