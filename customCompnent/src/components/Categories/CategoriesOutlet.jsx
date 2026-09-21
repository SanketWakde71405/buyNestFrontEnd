import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../contexts/ThemeContext";

// Icons
import { IoAdd } from "react-icons/io5";
import { IoGridOutline } from "react-icons/io5";
import { HiTrendingUp } from "react-icons/hi";
import { HiTrendingDown } from "react-icons/hi";
import { LuBox } from "react-icons/lu";

// Components
import SearchBar from "../SearchBar";
import Dropdown from "../Dropdown";
import CategoryCard from "./comps/CategoryCard";
import ButtonIcon from "../ButtonIcon";
import CategoryTree from "./comps/CategoryTree";
import CategoryDetailsPanel from "./comps/CategoryDetailsPanel";

// Modal
import DeleteCategoryModal from "./modal/DeleteCategoryModal";

// Services
import CategoryApi from "../../services/CategoryApi.js";
import ProductApi from "../../services/ProductApi.js";


// Constants
const STATUS_OPTIONS = ["All Status", "Active", "Inactive"];

// Util functions
import { collectCategoriesRecursively } from "../../utils/commonFunctions.js";

const unwrapList = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};


function buildCategoryTree(flatList) {
  const byId = new Map(
    flatList.map((cat) => [cat._id, { ...cat, children: [] }]),
  );
  const roots = [];

  byId.forEach((node) => {
    const parentId = node.parentCategory
      ? node.parentCategory.toString?.() || node.parentCategory
      : null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Render order must follow displayOrder, not insertion order — this is
  // what makes reorderCategories visible in the UI at all.
  const byDisplayOrder = (a, b) =>
    (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  byId.forEach((node) => node.children.sort(byDisplayOrder));
  roots.sort(byDisplayOrder);

  return roots;
}

function pruneTree(nodes, matches) {
  return nodes
    .map((node) => {
      const prunedChildren = node.children
        ? pruneTree(node.children, matches)
        : [];
      const selfMatches = matches(node);
      if (!selfMatches && prunedChildren.length === 0) return null;
      return { ...node, children: prunedChildren };
    })
    .filter(Boolean);
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function CategoriesOutlet() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [productList, setProductList] = useState([]);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parentsResponse = await CategoryApi.getCategoriesForStore();
      const parents = unwrapList(parentsResponse);
      const flattened = await collectCategoriesRecursively(parents);
      setCategoriesList(flattened);
    } catch (err) {
      console.error("failed to fetch categories", err);
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await ProductApi.getAllProducts();
        setProductList(response);
      } catch (err) {
        console.error("Failed to fetch product list", err);
      }
    };
    loadProducts();
  }, []);

  const handleCategoryDeleted = (categoryId) => {
    setCategoriesList((prev) => prev.filter((cat) => cat._id !== categoryId));
    if (selectedId === categoryId) setSelectedId(null);
  };

  const handleEdit = (category) => {
    navigate(`/edit/category/${category._id}`);
  };

  // Reordering is only meaningful against the full, unfiltered sibling
  // group — if search or a status filter has pruned the tree, the
  // subset the user sees on screen isn't the full set reorderCategories
  // expects, and sending it would silently corrupt the real order.
  const isFiltering = search.trim() !== "" || statusFilter !== "All Status";

  const handleReorder = useCallback(
    async (parentCategoryId, orderedIds) => {
      if (isFiltering) return;

      const previousList = categoriesList;

      // Optimistic update so drag-and-drop feels instant; rolled back if
      // the request fails.
      setCategoriesList((prev) => {
        const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
        return prev.map((cat) => {
          const parentId = cat.parentCategory
            ? cat.parentCategory.toString?.() || cat.parentCategory
            : null;
          if ((parentId || null) !== (parentCategoryId || null)) return cat;
          return orderMap.has(cat._id)
            ? { ...cat, displayOrder: orderMap.get(cat._id) }
            : cat;
        });
      });

      try {
        await CategoryApi.reorderCategories(parentCategoryId, orderedIds);
      } catch (err) {
        console.error("Failed to reorder categories", err);
        setError("Failed to save the new category order");
        setCategoriesList(previousList);
      }
    },
    [categoriesList, isFiltering],
  );

  // ── Tree building + filtering ──────────────────────────────────────────
  const fullTree = useMemo(
    () => buildCategoryTree(categoriesList),
    [categoriesList],
  );

  const visibleTree = useMemo(() => {
    const matches = (node) => {
      const matchSearch = (node.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All Status" ||
        node.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    };
    return pruneTree(fullTree, matches);
  }, [fullTree, search, statusFilter]);

  const selectedCategory = useMemo(
    () => (selectedId ? findNodeById(fullTree, selectedId) : null),
    [fullTree, selectedId],
  );

  const selectedSubCategoryCount = selectedCategory?.children?.length || 0;

  const bestSeller = useMemo(() => {
    if (categoriesList.length === 0) return null;
    return categoriesList.reduce((best, cat) =>
      (cat.productCount || 0) > (best.productCount || 0) ? cat : best,
    );
  }, [categoriesList]);

  const underperforming = useMemo(() => {
    if (categoriesList.length === 0) return null;
    return categoriesList.reduce((worst, cat) =>
      (cat.productCount || 0) < (worst.productCount || 0) ? cat : worst,
    );
  }, [categoriesList]);

  const categoryCards = [
    {
      id: "categories_total",
      icon: <IoGridOutline className="text-violet-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Categories",
      subTitle: String(categoriesList.length),
      desc: "All product categories",
    },
    {
      id: "categories_best",
      icon: (
        <HiTrendingUp
          className="text-emerald-600 border-l-2 border-b-2 border-emerald-600"
          size={24}
        />
      ),
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-emerald-100",
      title: "Best Seller Category",
      subTitle: bestSeller ? bestSeller.name : "—",
      desc: bestSeller
        ? `${bestSeller.productCount || 0} products`
        : "No data yet",
    },
    {
      id: "categories_underperforming",
      icon: (
        <HiTrendingDown
          className="text-amber-600 border-l-2 border-b-2 border-amber-600"
          size={24}
        />
      ),
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Underperforming",
      subTitle: underperforming ? underperforming.name : "—",
      desc: underperforming
        ? `${underperforming.productCount || 0} products`
        : "No data yet",
    },
    {
      id: "categories_products",
      icon: <LuBox className="text-sky-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      title: "Total Products",
      subTitle: String(productList.length),
      desc: "Across all categories",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 px-6 py-4">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            Categories
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Organize your store categories in a hierarchical structure
          </span>
        </div>
        <ButtonIcon
          onClick={() => navigate("/add/category")}
          text="Add New Category"
          icon={<IoAdd size={25} />}
        />
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex flex-row gap-3">
        {categoryCards.map((card) => (
          <CategoryCard
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            title={card.title}
            subTitle={card.subTitle}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Tree + Details ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Tree card */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-row items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-b dark:border-slate-800">
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-800 dark:text-gray-200">
                Category Tree
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Manage parent and sub-categories
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <SearchBar
                search={search}
                setSearch={setSearch}
                placeholder="Search categories..."
              />
              <Dropdown
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                Loading categories...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 text-sm">
                {error}
              </div>
            ) : (
              <CategoryTree
                nodes={visibleTree}
                selectedId={selectedId}
                onSelect={(node) => setSelectedId(node._id)}
                onEdit={handleEdit}
                onDelete={setCategoryToDelete}
                onReorder={handleReorder}
                reorderEnabled={!isFiltering}
              />
            )}
          </div>
        </div>

        {/* Details panel — hidden until a category is selected */}
        {selectedCategory && (
          <CategoryDetailsPanel
            category={selectedCategory}
            subCategoryCount={selectedSubCategoryCount}
            onClose={() => setSelectedId(null)}
            onEdit={handleEdit}
            onDelete={setCategoryToDelete}
          />
        )}
      </div>

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onDeleted={handleCategoryDeleted}
        />
      )}
    </div>
  );
}

export default CategoriesOutlet;
