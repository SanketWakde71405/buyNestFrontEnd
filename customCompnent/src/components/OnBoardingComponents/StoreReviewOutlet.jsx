import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoShieldHalf } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { MdLockOutline } from "react-icons/md";

// Components
import Connector from "../Connector";
import Toggler from "../Toggler";

// Summary Cards
import StoreSetupSummary from "./Forms/ReviewLauncher/StoreSetupSummary";
import ProductsSummary from "./Forms/ReviewLauncher/ProductsSummary";
import SettingsSummary from "./Forms/ReviewLauncher/SettingsSummary";

// Edit Forms
import StoreDetailsEdit from "./Forms/ReviewLauncher/StoreDetailsEdit";
import ProductDetailsEdit from "./Forms/ReviewLauncher/ProductDetailsEdit";
import StoreSettingsEdit from "./Forms/ReviewLauncher/StoreSettingsEdit";

// Modals
import UpdateStoreDetailsSuccess from "./Modal/ReviewLauncher/UpdateStoreDetailsSuccess";
import UpdateProductDetailsSuccess from "./Modal/ReviewLauncher/UpdateProductDetailsSuccess";
import UpdateSettingDetailsSuccess from "./Modal/ReviewLauncher/UpdateSettingDetailsSuccess";

// Contexts
import useTheme from "../../contexts/ThemeContext";

// Services
import StoreApi from "../../services/StoreApi";
import ProductApi from "../../services/ProductApi";
import CategoryApi from "../../services/CategoryApi";
import AuthApi from "../../services/AuthApi";

// Constants
import { ONBOARDING_PROGRESS_KEY } from "../HomeSection/Onboarding";

const steps = [
  { number: 1, title: "Store Setup", completed: true },
  { number: 2, title: "Add Products", completed: true },
  { number: 3, title: "Configure Settings", completed: true },
  { number: 4, title: "Review & Launch", completed: false },
];

function StoreReviewOutlet() {
  // Data state
  const [store, setStore] = useState(null);
  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Buttons state
  const [storeDetailsEdit, setStoreDetailsEdit] = useState(false);
  const [productDetailsEdit, setProductDetailsEdit] = useState(false);
  const [settingDetailsEdit, setSettingDetailsEdit] = useState(false);

  // Update Buttons state
  const [storeDetailsSuccess, setStoreDetailsSuccess] = useState(false);
  const [productDetailsSuccess, setProductDetailsSuccess] = useState(false);
  const [settingDetailsSuccess, setSettingDetailsSuccess] = useState(false);

  // Context hooks
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Store Details Edit Form Toggler
  const handleStoreDetailsEdit = () => {
    setStoreDetailsEdit((prev) => !prev);
  };

  // Store Details Edit Form Success Modal Toggler
  const handleStoreDetailsSuccess = () => {
    setStoreDetailsSuccess((prev) => !prev);
  };

  // Product Details Edit Form Toggler
  const handleProductDetailsEdit = () => {
    setProductDetailsEdit((prev) => !prev);
  };

  // Product Details Edit Form Sucess Modal Toggler
  const handleProductDetailsSuccess = () => {
    setProductDetailsSuccess((prev) => !prev);
  };

  // Store Settings Details Edit Form Toggler
  const handleStoreSettingDetailsEdit = () => {
    setSettingDetailsEdit((prev) => !prev);
  };

  // Store Settings Details Edit Form Success Modal Toggler
  const handleStoreSettingDetailsSuccess = () => {
    setSettingDetailsSuccess((prev) => !prev);
  };

  // Completing onboarding Process
  const markOnboardingStepComplete = () => {
    try {
      const progress =
        JSON.parse(localStorage.getItem(ONBOARDING_PROGRESS_KEY)) || {};
      progress[4] = true;
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("Failed to persist onboarding progress", err);
    }
  };

  const handleCompleteOnboardingSucesss = async () => {
    try {
      const response = await AuthApi.getCurrentUser();
      const user = response?.data || response;

      if (!user?._id) {
        throw new Error("User not found");
      }

      await AuthApi.completeOnboarding(user._id);
      markOnboardingStepComplete();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding process!", err);
      setError(
        err?.message || "Failed to complete onboarding. Please try again.",
      );
    }
  };

  // Store details edit form input change handler
  const handleChange = ({ target }) => {
    const { name, value } = target;

    setStore((prev) => {
      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });

    if (error) {
      setError("");
    }
  };

  // Product Edit form input change handler
  const handleChangeForProduct = ({ target }) => {
    const { name, value } = target;

    setProduct((prev) => {
      if (!prev || prev.length === 0) return prev;

      const updatedFirstProduct = name.includes(".")
        ? (() => {
            const [parentKey, childKey] = name.split(".");
            return {
              ...prev[0],
              [parentKey]: {
                ...prev[0][parentKey],
                [childKey]: value,
              },
            };
          })()
        : { ...prev[0], [name]: value };

      return [updatedFirstProduct, ...prev.slice(1)];
    });

    if (error) {
      setError("");
    }
  };

  // Loading Store Details + Settings
  useEffect(() => {
    let cancelled = false;

    const loadStore = async () => {
      try {
        const response = await StoreApi.getMyStore();
        const storeData = response?.data || response;

        if (!cancelled) {
          setStore(storeData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load store details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Loading Product Details
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await ProductApi.getAllProducts();
        console.log("Products", response);
        const productData = response?.data || response;
        const categoryIds = productData[0]?.category;

        const categoriesList = await Promise.all(
          categoryIds.map((categoryId) =>
            CategoryApi.getCategoryById(categoryId),
          ),
        );

        const categoryNames = categoriesList.map((category) => category.name);
        productData[0].category = categoryNames;
        setProduct(productData);
      } catch (err) {
        console.error(
          "Failed to fetch products. Please try again",
          err?.message,
        );
        setError(err?.message);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="flex flex-col w-full h-screen overflow-y-auto gap-5 px-4 py-10 dark:bg-slate-950">
      {/* Header + steps */}
      <div className="flex flex-row gap-5 justify-between items-start px-4">
        <div className="flex flex-col gap-2">
          <span className="text-zinc-800 dark:text-gray-200 text-3xl font-semibold">
            Review & Launch 🎉
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
              You've completed all the steps!
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
              Review your store details and launch your store.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end shrink-0">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center w-24">
                {step.completed ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold mb-3 text-indigo-600">
                    <IoIosCheckmarkCircle size={30} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold mb-3 text-white bg-indigo-600">
                    {step.number}
                  </div>
                )}

                <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200 mb-1 whitespace-nowrap">
                  {step.title}
                </h3>
              </div>

              {index < steps.length - 1 && (
                <div className="w-10 mx-1 mb-6">
                  <Connector active={step.completed} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <span className="text-red-500 text-sm font-medium px-4">{error}</span>
      )}

      <div className="flex flex-row gap-2 px-4">
        <div className="flex flex-col gap-2 rounded-lg w-[70%] px-4 py-2 border border-gray-200 dark:border-slate-700">
          {/* Loading Screen */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Loading store details...
              </span>
            </div>
          ) : (
            // Three Steps Summary+ Edit Forms
            <>
              {/* Store Details */}
              <StoreSetupSummary
                store={store}
                isLast={false}
                onEdit={handleStoreDetailsEdit}
              />
              {storeDetailsEdit && (
                <StoreDetailsEdit
                  store={store}
                  handleChange={handleChange}
                  onUpdateSucess={handleStoreDetailsSuccess}
                />
              )}

              {/* Product Details */}
              <ProductsSummary
                store={store}
                products={product}
                isLast={false}
                onEdit={handleProductDetailsEdit}
              />

              {productDetailsEdit && product.length === 1 && (
                <ProductDetailsEdit
                  product={product}
                  store={store}
                  handleChangeForProduct={handleChangeForProduct}
                  onUpdateSuccess={handleProductDetailsSuccess}
                />
              )}

              {/* Store settings */}
              <SettingsSummary
                store={store}
                onEdit={handleStoreSettingDetailsEdit}
                isLast={true}
              />

              {settingDetailsEdit && (
                <StoreSettingsEdit
                  store={store}
                  onUpdateSuccess={handleStoreSettingDetailsSuccess}
                />
              )}
            </>
          )}
        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-2 w-[30%] border px-4 py-2 border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-950">
          <span className="text-zinc-800 dark:text-gray-200 font-semibold text-lg my-2 mx-2">
            Your Store is Ready!
          </span>

          {/* Hero Image */}
          <div className="flex justify-center items-center my-2 py-2">
            {theme === "dark" ? (
              <img
                className="w-65 object-cover"
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786474210/review_dark_ffkakw.png"
                alt="review.png"
              />
            ) : (
              <img
                className="w-65 object-cover"
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786473871/review_tjlmbd.png"
                alt="review.png"
              />
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400 mx-2 px-15 font-medium text-sm text-center ">
            Everything looks good. You're all set to launch your store and start
            selling.
          </span>

          {/* Bullet Points */}
          <div className="flex flex-col gap-5 mx-2 my-5">
            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm font-medium">
                Store setup completed
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm font-medium">
                Products added (1).
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm font-medium">
                Settings configured.
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm font-medium">
                Ready to go live.
              </span>
            </div>
          </div>

          <div className="m-5 flex flex-row gap-2 rounded-lg p-4 bg-purple-50 dark:bg-slate-900">
            <IoShieldHalf className="text-indigo-600" size={40} />
            <span className="text-gray-500 dark:text-gray-400 font-normal text-sm pt-1">
              Once launched, your store will be <br /> live and visible to
              customers.
            </span>
          </div>
        </div>
      </div>

      {/* Back and Launch Buttons */}
      <div className="flex flex-row justify-between items-start px-4">
        <button
          type="button"
          onClick={() => {
            navigate("/");
          }}
          className="flex flex-row gap-2 border border-gray-200 dark:border rounded-lg dark:border-slate-700 bg-transparent px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoIosArrowRoundBack
            size={25}
            className="text-zinc-800 dark:text-gray-200"
          />
          <span className="text-zinc-800 dark:text-gray-200">Back</span>
        </button>

        <div className="flex flex-col gap-1 w-[30%]">
          <button
            type="button"
            onClick={handleCompleteOnboardingSucesss}
            className="flex flex-row gap-2  justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50  disabled:cursor-not-allowed"
          >
            <span className="text-slate-100 font-semibold">Launch Store</span>
            <HiOutlineRocketLaunch
              className="text-slate-100 font-semibold"
              size={25}
            />
          </button>
          <div className="flex flex-row gap-2 my-2 justify-center items-center">
            <MdLockOutline
              className="text-gray-500 dark:text-gray-400"
              size={15}
            />
            <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">
              Your store will be live and visible to customers.
            </span>
          </div>
        </div>
      </div>

      {/* Update Store Details success modal */}
      {storeDetailsSuccess && (
        <UpdateStoreDetailsSuccess onClose={handleStoreDetailsSuccess} />
      )}

      {/* Update Product Details success modal */}
      {productDetailsSuccess && (
        <UpdateProductDetailsSuccess onClose={handleProductDetailsSuccess} />
      )}

      {/* Update Store Settings success modal */}
      {settingDetailsSuccess && (
        <UpdateSettingDetailsSuccess
          onClose={handleStoreSettingDetailsSuccess}
        />
      )}
    </div>
  );
}

export default StoreReviewOutlet;
