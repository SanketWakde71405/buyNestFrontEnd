import CategoryApi from "../services/CategoryApi.js";

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatCurrency = (value) =>
  value == null
    ? "—"
    : `₹ ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const collectCategoriesRecursively = async (categories) => {
  const results = [];
  await Promise.all(
    (categories || []).map(async (category) => {
      results.push(category);
      let subCategories = [];
      try {
        subCategories = await CategoryApi.getSubCategories(category?._id);
      } catch (err) {
        subCategories = [];
      }
      if (subCategories && subCategories.length > 0) {
        const nested = await collectCategoriesRecursively(subCategories);
        results.push(...nested);
      }
    }),
  );
  return results;
};
