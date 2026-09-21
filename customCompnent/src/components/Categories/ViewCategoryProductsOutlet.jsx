import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Icons
import { IoChevronForward } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { IoGridOutline } from "react-icons/io5";
import { IoListOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { IoRefreshOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoStorefrontOutline } from "react-icons/io5";

// Services
import ProductApi from "../../services/ProductApi.js";
import CategoryApi from "../../services/CategoryApi.js";

// Components
import ButtonIcon from "../ButtonIcon";
import Dropdown from "../Dropdown";
import SearchBar from "../SearchBar";
import InputBox from "../InputBox";
import Pagination from "../Pagination";


// Utils
import { formatCurrency,formatDate } from "../../utils/commonFunctions.js";

// Constants
import { STATUS_OPTIONS,STOCK_OPTIONS } from "../../utils/constants.js";
const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  "Newest First",
  "Oldest First",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
];

const DEFAULT_FILTERS = {
  search: "",
  brand: "All Brands",
  status: "All Status",
  stock: "All",
  minPrice: "",
  maxPrice: "",
};

const getPrice = (product) => product.discountPrice ?? product.price ?? 0;

function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case "Oldest First":
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "Price: Low to High":
      sorted.sort((a, b) => getPrice(a) - getPrice(b));
      break;
    case "Price: High to Low":
      sorted.sort((a, b) => getPrice(b) - getPrice(a));
      break;
    case "Highest Rated":
      sorted.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
      break;
    case "Newest First":
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return sorted;
}

function applyFilters(products, filters) {
  const term = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    if (term) {
      const haystack =
        `${product.title} ${product.brand?.name || ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (
      filters.brand !== "All Brands" &&
      product.brand?.name !== filters.brand
    ) {
      return false;
    }

    if (filters.status !== "All Status") {
      const wantsActive = filters.status === "Active";
      if (Boolean(product.isActive) !== wantsActive) return false;
    }

    if (filters.stock !== "All" && product.stockStatus !== filters.stock) {
      return false;
    }

    const price = getPrice(product);
    if (filters.minPrice !== "" && price < Number(filters.minPrice))
      return false;
    if (filters.maxPrice !== "" && price > Number(filters.maxPrice))
      return false;

    return true;
  });
}

function StatusBadge({ active }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
        active
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900"
          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StatCard({ icon, iconBackground, value, label }) {
  return (
    <div className="flex-1 min-w-[160px] flex flex-col items-center gap-3 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 py-8 px-4 text-center">
      <span
        className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBackground}`}
      >
        {icon}
      </span>
      <span className="text-xl font-bold text-zinc-800 dark:text-gray-100">
        {value}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

function FilterLabel({ children }) {
  return (
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {children}
    </span>
  );
}

function ProductCard({ product }) {
  const price = getPrice(product);
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/view/${product._id}`}
      className="group bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-violet-300 dark:hover:border-slate-700 hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-slate-800">
        <span className="absolute top-2 left-2 z-10">
          <StatusBadge active={product.isActive} />
        </span>

        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-[1.03] dark:bg-slate-950 border-b border-gray-200 dark:border-b dark:border-slate-800 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center dark:bg-slate-950 border-b border-gray-200 dark:border-b dark:border-slate-800 justify-center text-gray-300 dark:text-gray-600">
            <IoImageOutline size={36} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200 line-clamp-1">
          {product.title}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {product.brand?.name}
        </span>
        <span className="text-base font-bold text-zinc-800 dark:text-gray-100">
          {formatCurrency(price)}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Stock: {product.stock}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-gray-300">
            <IoStar size={13} className="text-amber-400" />
            {(product.ratingsAverage || 0).toFixed(1)}
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              ({product.ratingsCount || 0})
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductRow({ product }) {
  const price = getPrice(product);
  const image = product.images?.[0];

  return (
    <Link
      to={`/products/${product._id}`}
      className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 hover:border-violet-300 dark:hover:border-slate-700 hover:shadow-md transition-all"
    >
      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-lg overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-contain p-1.5"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <IoImageOutline size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200 truncate">
            {product.title}
          </h3>
          <StatusBadge active={product.isActive} />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {product.brand?.name}
        </span>
      </div>

      <span className="text-xs text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">
        Stock: {product.stock}
      </span>

      <span className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-gray-300 w-16 flex-shrink-0">
        <IoStar size={13} className="text-amber-400" />
        {(product.ratingsAverage || 0).toFixed(1)}
      </span>

      <span className="text-base font-bold text-zinc-800 dark:text-gray-100 w-24 text-right flex-shrink-0">
        {formatCurrency(price)}
      </span>
    </Link>
  );
}

function ViewCategoryProducts({ categoryId: categoryIdProp }) {
  const { categoryId: categoryIdParam } = useParams();
  const categoryId = categoryIdProp || categoryIdParam;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  // Draft filters reflect what's typed/selected in the panel; appliedFilters
  // are what's actually used to filter the grid, so changes only take
  // effect once "Apply Filters" is clicked (matching the reference design).
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoryResult, productsResult] = await Promise.allSettled([
          CategoryApi.getCategoryById(categoryId),
          ProductApi.getProductByCategories(categoryId),
        ]);

        if (cancelled) return;

        const categoryData =
          categoryResult.status === "fulfilled"
            ? (categoryResult.value?.data ?? categoryResult.value)
            : null;

        if (productsResult.status !== "fulfilled") {
          throw productsResult.reason;
        }

        const productList =
          productsResult.value?.data ?? productsResult.value ?? [];

        setCategory(categoryData);
        setProducts(Array.isArray(productList) ? productList : []);
        setDraftFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || "Failed to load category products.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const brandOptions = useMemo(() => {
    const names = new Set(products.map((p) => p.brand?.name).filter(Boolean));
    return ["All Brands", ...Array.from(names).sort()];
  }, [products]);

  const filteredProducts = useMemo(
    () => applyFilters(products, appliedFilters),
    [products, appliedFilters],
  );

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortBy),
    [filteredProducts, sortBy],
  );

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageProducts = sortedProducts.slice(pageStart, pageStart + PAGE_SIZE);

  const totalBrands =
    category?.totalBrands ??
    new Set(products.map((p) => p.brand?._id).filter(Boolean)).size;
  const totalSubCategories =
    category?.totalSubCategories ?? category?.subCategoriesCount ?? "—";
  const lastUpdated =
    category?.updatedAt ??
    products.reduce(
      (latest, p) =>
        p.updatedAt && (!latest || p.updatedAt > latest) ? p.updatedAt : latest,
      null,
    );

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  if (!categoryId) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500">
        No category selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 w-64 bg-gray-100 dark:bg-slate-800 rounded" />
        <div className="h-8 w-72 bg-gray-100 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-center">
        <IoAlertCircleOutline size={32} className="text-red-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <ButtonIcon
          icon={<IoRefreshOutline size={16} />}
          text="Retry"
          onClick={() => setCategory((c) => c)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col bg-white dark:bg-slate-950 gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-violet-600">
          Home
        </Link>
        <IoChevronForward size={11} />
        <Link to="/categories" className="hover:text-violet-600">
          Categories
        </Link>
        {category?.parentCategory && (
          <>
            <IoChevronForward size={11} />
            <Link
              to={`/categories/${category.parentCategory._id}`}
              className="hover:text-violet-600"
            >
              {category.parentCategory.name}
            </Link>
          </>
        )}
        <IoChevronForward size={11} />
        <span className="text-zinc-700 dark:text-gray-200 font-medium">
          {category?.name || "Category"}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-gray-100">
              {category?.name || "Category"}
            </h1>
            <StatusBadge active={category?.isActive ?? true} />
          </div>

          {category?.parentCategory && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Parent Category:{" "}
              <Link
                to={`/categories/${category.parentCategory._id}`}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {category.parentCategory.name}
                <IoOpenOutline size={12} />
              </Link>
            </span>
          )}

          {category?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<IoCubeOutline size={22} className="text-indigo-600" />}
          iconBackground="bg-indigo-50 dark:bg-indigo-950/40"
          value={products.length}
          label="Total Products"
        />
        <StatCard
          icon={<IoStorefrontOutline size={22} className="text-emerald-600" />}
          iconBackground="bg-emerald-50 dark:bg-emerald-950/40"
          value={totalBrands}
          label="Brands"
        />
        <StatCard
          icon={<IoLayersOutline size={22} className="text-blue-600" />}
          iconBackground="bg-blue-50 dark:bg-blue-950/40"
          value={totalSubCategories}
          label="Sub-categories"
        />
        <StatCard
          icon={<IoCalendarOutline size={22} className="text-amber-600" />}
          iconBackground="bg-amber-50 dark:bg-amber-950/40"
          value={formatDate(lastUpdated)}
          label="Last Updated"
        />
      </div>

      {/* Content: product grid + filters sidebar */}
      <div className="flex gap-6 items-start flex-col lg:flex-row">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Sort + view toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sort by:
              </span>
              <Dropdown
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
              />
            </div>

            <div className="flex items-center gap-1 border border-gray-200 dark:border-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-violet-600"
                }`}
                aria-label="Grid view"
              >
                <IoGridOutline size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-violet-600"
                }`}
                aria-label="List view"
              >
                <IoListOutline size={16} />
              </button>
            </div>
          </div>

          {/* Product grid / list */}
          {pageProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
              <IoAlertCircleOutline
                size={28}
                className="text-gray-300 dark:text-gray-600"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No products match your filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {pageProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pageProducts.map((product) => (
                <ProductRow key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Footer: count + pagination */}
          {sortedProducts.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Showing {pageStart + 1} to{" "}
                {Math.min(pageStart + PAGE_SIZE, sortedProducts.length)} of{" "}
                {sortedProducts.length} products
              </span>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Filters sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-4">
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-4 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                Filters
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors"
              >
                <IoRefreshOutline size={13} />
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <FilterLabel>Search</FilterLabel>
              <SearchBar
                search={draftFilters.search}
                setSearch={(value) => handleDraftChange("search", value)}
                placeholder="Search products..."
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FilterLabel>Brand</FilterLabel>
              <Dropdown
                value={draftFilters.brand}
                options={brandOptions}
                onChange={(value) => handleDraftChange("brand", value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FilterLabel>Status</FilterLabel>
              <Dropdown
                value={draftFilters.status}
                options={STATUS_OPTIONS}
                onChange={(value) => handleDraftChange("status", value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FilterLabel>Stock Availability</FilterLabel>
              <Dropdown
                value={draftFilters.stock}
                options={STOCK_OPTIONS}
                onChange={(value) => handleDraftChange("stock", value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <FilterLabel>Price Range</FilterLabel>
              <div className="flex gap-2">
                <InputBox
                  type="number"
                  placeholder="Min Price"
                  value={draftFilters.minPrice}
                  onChange={(e) =>
                    handleDraftChange("minPrice", e.target.value)
                  }
                />
                <InputBox
                  type="number"
                  placeholder="Max Price"
                  value={draftFilters.maxPrice}
                  onChange={(e) =>
                    handleDraftChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ViewCategoryProducts;
