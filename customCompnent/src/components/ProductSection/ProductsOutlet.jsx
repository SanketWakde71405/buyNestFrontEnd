import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../contexts/ThemeContext";

// Icons
import { IoAdd, IoFilter } from "react-icons/io5";
import { BsFillBagHeartFill } from "react-icons/bs";
import { TbPackageOff, TbAlertTriangleFilled } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { TbPackages } from "react-icons/tb";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";

// Components
import ButtonIcon from "../ButtonIcon";
import Pagination from "../Pagination";
import HeadingCard from "./comps/HeadingCard.jsx";
import Dropdown from "../Dropdown";
import SearchBar from "../SearchBar";

// Modal
import DeleteProductModal from "./Modal/DeleteProductModal.jsx";

// Services
import ProductApi from "../../services/ProductApi.js";
import CategoryApi from "../../services/CategoryApi.js";
import BrandApi from "../../services/BrandApi.js";

function StatusBadge({ status }) {
  const statusConfig = {
    Active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <HiTrendingUp size={13} />,
    },
    Inactive: {
      bg: "bg-red-100",
      text: "text-red-600",
      icon: <HiTrendingDown size={13} />,
    },
  };

  const cfg = status ? statusConfig["Active"] : statusConfig["Inactive"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon} {status ? "Active" : "Inactive"}
    </span>
  );
}

function StockCell({ stock, status }) {
  const color =
    status === "Out of Stock"
      ? "text-red-500"
      : status === "Low Stock"
        ? "text-amber-500"
        : "text-green-600";
  return (
    <div>
      <p className="font-medium text-zinc-800 dark:text-gray-200">{stock}</p>
      <p className={`text-xs ${color}`}>
        {status === "Trending" ? "In Stock" : status}
      </p>
    </div>
  );
}

function ProductsOutlet() {
  // Use states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();

  // Hooks
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Constants
  const STATUSES = ["All Statuses", "In Stock", "Out of Stock", "Low Stock"];
  const PAGE_SIZE = 5;

  // Helper functions
  const OnDelete = () => {
    setDeleteModal((prev) => !prev);
  };

  // useEffects
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // 1. Get all products
        const response = await ProductApi.getAllProducts();

        const products = response || [];

        // 2. Collect unique category IDs
        const categoryIds = [
          ...new Set(products.flatMap((product) => product.category || [])),
        ];

        console.log("Unique category IDs:", categoryIds);

        // 3. Fetch all categories simultaneously
        const categoryResponses = await Promise.all(
          categoryIds.map((categoryId) =>
            CategoryApi.getCategoryById(categoryId),
          ),
        );

        console.log("Category responses:", categoryResponses);

        // 4. Create category ID -> category name map
        const categoryMap = {};

        categoryResponses.forEach((category) => {
          categoryMap[category._id] = category.name;
        });

        console.log("Category map:", categoryMap);

        // 5. Replace category IDs with category names
        const processedProducts = products.map((product) => ({
          ...product,
          category: (product.category || []).map(
            (categoryId) => categoryMap[categoryId] || categoryId,
          ),
        }));

        // 6. Collect unique brand IDs and fetch them
        const brandIds = [
          ...new Set(
            processedProducts.map((product) => product.brand).filter(Boolean),
          ),
        ];

        console.log("Unique brand IDs:", brandIds);

        const brandResponses = await Promise.all(
          brandIds.map((brandId) => BrandApi.getBrandById(brandId)),
        );

        console.log("Brand responses:", brandResponses);

        // 7. Create brand ID -> brand name map
        const brandMap = {};

        brandResponses.forEach((brand) => {
          brandMap[brand._id] = brand.name;
        });

        console.log("Brand map:", brandMap);

        // 8. Replace brand IDs with brand names
        const productsWithBrandNames = processedProducts.map((product) => ({
          ...product,
          brand: brandMap[product.brand] || product.brand,
        }));

        console.log("Processed products:", productsWithBrandNames);

        // 9. Store processed products
        setProductsList(productsWithBrandNames);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 1. Get parent categories for the store
        const parentCategories = await CategoryApi.getCategoriesForStore();
        // 2. Fetch subcategories for every parent category in parallel
        const subCategoryResponses = await Promise.all(
          parentCategories.map((parent) =>
            CategoryApi.getSubCategories(parent?._id).catch((error) => {
              console.error(
                `Failed to fetch subcategories for ${parent?.name}`,
                error,
              );
              return [];
            }),
          ),
        );

        // 3. Flatten parent + all subcategory names into one list
        const parentNames = parentCategories.map((category) => category?.name);
        const subNames = subCategoryResponses
          .flat()
          .map((category) => category?.name);

        // 4. De-dupe (a subcategory name could theoretically repeat across parents)
        const categoriesList = [
          ...new Set([...parentNames, ...subNames]),
        ].filter(Boolean);

        setCategories(categoriesList);
      } catch (error) {
        console.error("Failed to fetch categories for store", error);
      }
    };
    loadCategories();
  }, []);

  const lowStockCount = productsList.filter(
    (p) => p.stockStatus === "Low Stock",
  ).length;

  const outOfStockCount = productsList.filter(
    (p) => p.stockStatus === "Out of Stock",
  ).length;

  const headingCards = [
    {
      id: "products",
      icon: <BsFillBagHeartFill className="text-violet-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Products",
      subTitle: String(productsList.length),
      desc: "All products in the store",
    },
    {
      id: "active",
      icon: <TbPackages className="text-emerald-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-stone-800" : "bg-green-100",
      title: "In Stock Products",
      subTitle: String(productsList.length - lowStockCount - outOfStockCount),
      desc: "Available",
    },
    {
      id: "noStock",
      icon: <TbPackageOff className="text-rose-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-stone-800" : "bg-rose-100",
      title: "Out of Stock",
      subTitle: String(outOfStockCount),
      desc: "Currently unavailable",
    },
    {
      id: "lowStock",
      icon: <TbAlertTriangleFilled className="text-amber-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Low Stock",
      subTitle: String(lowStockCount),
      desc: "Near Stock limit",
    },
  ];

  // Filter function
  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        category === "All Categories" ||
        (Array.isArray(p.category) && p.category.includes(category));
      const matchStatus = status === "All Statuses" || p.stockStatus === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [productsList, search, category, status]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-4 px-5 mx-2 my-2">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center gap-1 px-5">
        <div className="flex flex-col justify-start items-start">
          <span className="text-zinc-800 dark:text-gray-200 font-semibold text-2xl">
            Products
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Manage and organize your store products
          </span>
        </div>
        <ButtonIcon
          text="Add Product"
          onClick={() => {
            navigate("/add/product");
          }}
          icon={<IoAdd size={25} />}
        />
      </div>

      {/* ── Heading Cards ── */}
      <div className="flex flex-row gap-2 justify-center items-center px-3 py-1">
        {headingCards.map((card) => (
          <HeadingCard
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            title={card.title}
            subTitle={card.subTitle}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Table ── */}
      <div className="px-3">
        <div className="bg-white dark:bg-slate-950  rounded-xl border border-gray-200 dark:border dark:border-slate-800">
          {/* ── Search + Filters ── */}
          <div className="flex flex-row w-full justify-between border-b border-gray-100 dark:border-b dark:border-slate-800 py-2 rounded-lg items-center gap-3 px-3">
            {/* Search */}
            <SearchBar
              search={search}
              setSearch={setSearch}
              placeholder="Search products..."
              onSearch={() => setPage(1)}
            />

            <div className="flex flex-row gap-2">
              {/* Category Dropdown */}
              <Dropdown
                value={category}
                options={categories}
                onChange={handleFilterChange(setCategory)}
              />

              {/* Status Dropdown */}
              <Dropdown
                value={status}
                options={STATUSES}
                onChange={handleFilterChange(setStatus)}
              />

              {/* Filter Button */}
              <button className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-gray-200 bg-white dark:bg-slate-950 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-600 transition-colors">
                <IoFilter size={16} />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-b-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-b dark:border-slate-800 bg-gray-100 dark:bg-slate-900">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Brand
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Cost Price
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Discount Price
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-gray-500 dark:text-gray-400"
                    >
                      <TbPackageOff
                        size={36}
                        className="mx-auto mb-2 opacity-40"
                      />
                      <p className="text-sm">No products match your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((product, idx) => (
                    <tr
                      key={product._id}
                      onClick={() => navigate(`/edit/product/${product._id}`)}
                      className={`cursor-pointer border-b border-gray-100 dark:border-b dark:border-slate-800 hover:bg-violet-50/40 dark:hover:bg-slate-800/50 transition-colors ${idx === paginated.length - 1 ? "border-b-0" : ""}`}
                    >
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                            {product?.images[0] ? (
                              <img src={product?.images[0]} />
                            ) : (
                              <span className="font-semibold text-lg text-indigo-600">
                                {product?.title[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-800 dark:text-gray-200">
                              {product?.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product?.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {product?.category?.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-xs font-medium bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full px-2.5 py-0.5"
                            >
                              {c}
                            </span>
                          ))}
                          {product?.category?.length > 2 && (
                            <span
                              className="text-xs font-medium text-gray-400 dark:text-gray-500 px-1 py-0.5"
                              title={product.category.slice(2).join(", ")}
                            >
                              +{product.category.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-zinc-800 dark:text-gray-200">
                        {product?.brand || "—"}
                      </td>

                      {/* Cost Price */}
                      <td className="px-4 py-3 text-zinc-800 dark:text-gray-200">
                        {product?.costPrice != null
                          ? `₹${product.costPrice.toFixed(2)}`
                          : "—"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-gray-200">
                        ₹{product.price.toFixed(2)}
                      </td>

                      {/* Discount Price */}
                      <td className="px-4 py-3 text-zinc-800 dark:text-gray-200">
                        {product?.discountPrice != null
                          ? `₹${product.discountPrice.toFixed(2)}`
                          : "—"}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <StockCell
                          stock={product.stock}
                          status={product.stockStatus}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={product.isActive} />
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/edit/product/${product._id}`)
                            }
                            className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              OnDelete();
                            }}
                            className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 hover:border-red-300 dark:hover:border-slate-600 transition-colors"
                          >
                            <RiDeleteBin5Fill size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Pagination Row ── */}
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {filtered.length}
          </span>{" "}
          products
        </p>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {deleteModal && (
        <DeleteProductModal
          product={selectedProduct}
          onClose={OnDelete}
          onDeleted={(deletedProduct) =>
            setProductsList((prev) =>
              prev.filter((p) => p._id !== deletedProduct?._id),
            )
          }
        />
      )}
    </div>
  );
}

export default ProductsOutlet;
