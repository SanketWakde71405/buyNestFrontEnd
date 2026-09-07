import { useState, useMemo, useEffect } from "react";
import useTheme from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
// Icons
import { IoAdd } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoPencilOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { CgShoppingBag } from "react-icons/cg";
import { HiTrendingUp } from "react-icons/hi";

// Components
import ButtonIcon from "../ButtonIcon";
import BrandCard from "./comps/BrandCard.jsx";
import SearchBar from "../SearchBar";
import Dropdown from "../Dropdown";
import Pagination from "../Pagination";
import DeleteBrandModal from "./Modal/DeleteBrandModal.jsx";

// Services
import BrandApi from "../../services/BrandApi.js";
import ProductApi from "../../services/ProductApi.js";

// Utils
import { formatDate } from "../../utils/commonFunctions.js";

// Constants
import {
  ALL_CATEGORIES_OPTION,
  ALL_SUPPLIERS_OPTION,
  SORT_OPTIONS,
} from "../../utils/constants.js";

function BrandOutlet() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_OPTION);
  const [supplierFilter, setSupplierFilter] = useState(ALL_SUPPLIERS_OPTION);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [brandList, setBrandList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const handleDeleteBrandModal = (brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal((prev) => !prev);
  };

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brands = await BrandApi.getAllBrands();
        setBrandList(brands || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await ProductApi.getAllProducts();
        setProductList(products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const productCountByBrand = useMemo(() => {
    const counts = {};
    productList.forEach((p) => {
      const brandId = typeof p.brand === "string" ? p.brand : p.brand?._id;
      if (!brandId) return;
      counts[brandId] = (counts[brandId] || 0) + 1;
    });
    return counts;
  }, [productList]);

  const topBrandName = useMemo(() => {
    if (brandList.length === 0) return "—";
    let best = null;
    let bestCount = -1;
    brandList.forEach((b) => {
      const count = productCountByBrand[b._id] || 0;
      if (count > bestCount) {
        bestCount = count;
        best = b;
      }
    });
    return best?.name || "—";
  }, [brandList, productCountByBrand]);

  const categoryOptions = useMemo(() => {
    const set = new Set();
    brandList.forEach((b) => (b.categories || []).forEach((c) => set.add(c)));
    return [ALL_CATEGORIES_OPTION, ...Array.from(set).sort()];
  }, [brandList]);

  const supplierOptions = useMemo(() => {
    const set = new Set();
    brandList.forEach((b) => {
      if (b.supplier?.supplierName) set.add(b.supplier.supplierName);
    });
    return [ALL_SUPPLIERS_OPTION, ...Array.from(set).sort()];
  }, [brandList]);

  const brandCards = [
    {
      id: "brands_total",
      icon: <CgShoppingBag className="text-violet-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Brands",
      subTitle: String(brandList.length),
      desc: "All registered brands",
    },
    {
      id: "brands_products_total",
      icon: <IoCubeOutline className="text-amber-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Total Products",
      subTitle: String(productList.length),
      desc: "Across all brands",
    },
    {
      id: "brands_top",
      icon: <HiTrendingUp className="text-sky-600" size={26} />,
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      title: "Top Brand",
      subTitle: topBrandName,
      desc: "By product count",
    },
  ];

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...brandList];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }

    if (categoryFilter !== ALL_CATEGORIES_OPTION) {
      list = list.filter((b) => (b.categories || []).includes(categoryFilter));
    }

    if (supplierFilter !== ALL_SUPPLIERS_OPTION) {
      list = list.filter((b) => b.supplier?.supplierName === supplierFilter);
    }

    if (sort === "Sort by: Name (A–Z)")
      list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "Sort by: Name (Z–A)")
      list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "Sort by: Most Products")
      list.sort(
        (a, b) =>
          (productCountByBrand[b._id] || 0) - (productCountByBrand[a._id] || 0),
      );
    else
      // default: Recently Added
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [
    brandList,
    search,
    categoryFilter,
    supplierFilter,
    sort,
    productCountByBrand,
  ]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset to page 1 whenever filters change
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleSort = (val) => {
    setSort(val);
    setCurrentPage(1);
  };
  const handleCategoryFilter = (val) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };
  const handleSupplierFilter = (val) => {
    setSupplierFilter(val);
    setCurrentPage(1);
  };

  const COLUMN_COUNT = 6;

  return (
    <div className="w-full flex flex-col gap-5 px-6 py-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            Brands
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage all product brands in your store
          </span>
        </div>
        <ButtonIcon
          onClick={() => {
            navigate("/add/brand");
          }}
          text="Add New Brand"
          icon={<IoAdd size={25} />}
        />
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="flex flex-row gap-3">
        {brandCards.map((card) => (
          <BrandCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-100 dark:border dark:border-slate-800 shadow-sm">
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-row justify-between py-4 px-2 border-b border-gray-100 dark:border-b dark:border-slate-800 items-center gap-3 flex-wrap">
          <SearchBar
            search={search}
            setSearch={handleSearch}
            placeholder="Search brands by name..."
          />
          <div className="flex flex-row justify-center items-center gap-2 flex-wrap">
            <Dropdown
              value={categoryFilter}
              options={categoryOptions}
              onChange={handleCategoryFilter}
            />
            <Dropdown
              value={supplierFilter}
              options={supplierOptions}
              onChange={handleSupplierFilter}
            />
            <Dropdown
              value={sort}
              options={SORT_OPTIONS}
              onChange={handleSort}
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-b dark:border-slate-800 text-zinc-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[26%]">
                Brand
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[26%]">
                Categories
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[18%]">
                Supplier
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[10%]">
                Products
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[12%]">
                Added On
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[8%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
            {loadingBrands ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-5 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  Loading brands…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="px-5 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  No brands match your search.
                </td>
              </tr>
            ) : (
              paginated.map((brand) => {
                const categories = brand.categories || [];
                const visibleCategories = categories.slice(0, 3);
                const extraCategoryCount =
                  categories.length - visibleCategories.length;

                return (
                  <tr
                    key={brand._id}
                    onClick={() => {
                      navigate(`/edit/brand/${brand._id}`);
                    }}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Brand */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-transparent flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-7 h-7 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-zinc-800 dark:text-gray-200">${brand.name[0]}</span>`;
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-zinc-800 dark:text-gray-200 truncate">
                            {brand.name}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[220px]">
                            {brand.description || "No description added."}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categories */}
                    <td className="px-5 py-3">
                      {categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {visibleCategories.map((cat) => (
                            <span
                              key={cat}
                              className="text-xs font-medium bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full px-2.5 py-0.5"
                            >
                              {cat}
                            </span>
                          ))}
                          {extraCategoryCount > 0 && (
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 px-1 py-0.5">
                              +{extraCategoryCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          No categories
                        </span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-3">
                      {brand.supplier?.supplierName ? (
                        <span className="text-sm text-zinc-800 dark:text-gray-200">
                          {brand.supplier.supplierName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                          No supplier
                        </span>
                      )}
                    </td>

                    {/* Products */}
                    <td className="px-5 py-3 text-zinc-800 dark:text-gray-200 font-medium">
                      {(productCountByBrand[brand._id] || 0).toLocaleString()}
                    </td>

                    {/* Added On */}
                    <td className="px-5 py-3 text-zinc-800 dark:text-gray-200">
                      {formatDate(brand.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit/brand/${brand._id}`);
                          }}
                          className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <IoPencilOutline size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBrandModal(brand);
                          }}
                          className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-red-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <IoTrashOutline size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-t dark:border-slate-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
            to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} brands
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteBrandModal
          brandId={brandToDelete?._id}
          onClose={() => setShowDeleteModal(false)}
          formData={brandToDelete}
        />
      )}
    </div>
  );
}

export default BrandOutlet;
