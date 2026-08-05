import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Connector from "../Connector";
import InputBox from "../InputBox";

// Forms
import AddBrandForm from "./Forms/ProductCreation/AddBrandForm";
import BrandLogoUpload from "./Forms/ProductCreation/BrandLogoUpload";
import AddProductForm from "./Forms/ProductCreation/AddProductForm";
import ProductImagesUpload from "./Forms/ProductCreation/ProductImagesUpload";

// Modals
import ProductSuccessModal from "./Modal/ProductCreation/ProductSuccessModal";

// Icons
import {
  IoIosCheckmarkCircleOutline,
  IoIosArrowRoundForward,
} from "react-icons/io";

// Constants
import { ONBOARDING_PROGRESS_KEY } from "../HomeSection/Onboarding";

// Store Setup Steps
const steps = [
  {
    id: "brandSetup",
    number: 1,
    title: "Brand Details",
    description: "Add basic information about the brand",
  },
  {
    id: "brandLogoUpload",
    number: 2,
    title: "Brand logo",
    description: "Upload brand logo image",
  },
  {
    id: "productSetup",
    number: 3,
    title: "Product Details",
    description: "Add basic information about your first product.",
  },
  {
    id: "imagesUpload",
    number: 4,
    title: "Product Images",
    description: "Upload 3-5 product images",
  },
];

function ProductOnboardingOutlet() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [brandData, setBrandData] = useState(null);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [brandLogoUploading, setBrandLogoUploading] = useState(false);
  const [brandLogoUploaded, setBrandLogoUploaded] = useState(false);
  const [brandLogoError, setBrandLogoError] = useState("");
  const [completion, setCompletion] = useState(false);

  const navigate = useNavigate();

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToNextStep = () => {
    const step = steps.find((step) => step.number === currentStep);
    console.log("Step number", step);
    console.log("Current Step", currentStep);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleNewBrandCreation = (brand) => {
    setBrandData(brand);
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(1);
      return Array.from(next);
    });
    goToNextStep();
  };

  const handleProductCreated = (product) => {
    setCreatedProduct(product);
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(3);
      return Array.from(next);
    });
    goToNextStep();
  };

  const handleProductImagesNext = (finalProductData) => {
    setCompletion(true);
    setCreatedProduct(finalProductData);
  };

  const markProductCreationComplete = () => {
    try {
      const progress =
        JSON.parse(localStorage.getItem(ONBOARDING_PROGRESS_KEY)) || {};
      progress[2] = true;
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("Failed to persist onboarding progress", err);
    }
  };

  const finishProductCreation = () => {
    markProductCreationComplete();
    navigate("/");
  };

  const handleBrandLogoNext = () => {
    if (!brandLogoUploaded) {
      setBrandLogoError("Please upload a logo, or skip this step for now");
      return;
    }

    setBrandLogoError("");
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(2);
      return Array.from(next);
    });
    goToNextStep();
  };

  const handleSkipBrandLogo = () => {
    setBrandLogoError("");
    goToNextStep();
  };

  const handleLogoUploadStart = () => {
    setBrandLogoUploading(true);
    setBrandLogoError("");
  };

  const handleLogoUploadSuccess = (data) => {
    // API may respond with the updated brand directly, or nested under
    // `brand` / `data` depending on the controller's response shape.
    const updatedBrand = data?.brand || data?.data || data;

    setBrandLogoUploading(false);
    setBrandLogoUploaded(true);
    setBrandLogoError("");
    setBrandData((prev) => ({ ...prev, ...updatedBrand }));
  };

  const handleLogoUploadError = (message) => {
    setBrandLogoUploading(false);
    setBrandLogoUploaded(false);
    setBrandLogoError(message);
  };

  const handleBrandSelected = ({ brand, isNewBrand, skipLogoStep }) => {
    setSelectedBrand(brand);
    setBrandData(brand);

    // Brand Details (step 1) is always done once a brand is chosen.
    // Existing brand → also skips Brand logo (step 2) entirely, so mark
    // that complete too rather than leaving it stuck as "upcoming".
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(1);
      if (skipLogoStep) next.add(2);
      return Array.from(next);
    });

    // Existing brand → jump straight to Product Details (step 3), skipping the
    // logo upload step. New brand → go through the logo upload step (step 2) as normal.
    setCurrentStep(skipLogoStep ? 3 : 2);
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background layer — pinned to viewport, independent of content height */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:bg-none dark:bg-slate-950" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 dark:bg-violet-600/30 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600/30 rounded-full blur-3xl -z-10" />

      <div className="relative z-10 w-full min-h-screen flex justify-center items-center sm:items-center px-4 py-8">
        <div className="relative flex flex-row items-stretch w-full max-w-3xl h-[calc(100vh-4rem)] border border-gray-200 rounded-lg bg-white dark:bg-slate-950 dark:border dark:border-slate-800 z-20 px-6 py-6 my-auto gap-10">
          <div className="flex flex-col items-stretch my-3 w-56 flex-shrink-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-row items-stretch">
                {/* Left column: number circle + vertical connector */}
                <div className="flex flex-col items-center mr-4 flex-shrink-0">
                  {completedSteps.includes(step.number) ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-indigo-600 flex-shrink-0">
                      <IoIosCheckmarkCircleOutline size={30} />
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold flex-shrink-0 ${
                        step.number === currentStep
                          ? "bg-indigo-600 text-white"
                          : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-500 border border-gray-300 dark:border dark:border-slate-700"
                      }`}
                    >
                      {step.number}
                    </div>
                  )}

                  {index < steps.length - 1 && (
                    <Connector
                      active={step.number < currentStep}
                      orientation="vertical"
                    />
                  )}
                </div>

                {/* Right column: title + description */}
                <div
                  className={`flex flex-col w-full text-left ${index < steps.length - 1 ? "pb-6" : ""}`}
                >
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-gray-500 w-full dark:text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto">
            {currentStep === 1 && (
              <AddBrandForm
                onBrandSelected={handleBrandSelected}
                onNewBrandCreation={handleNewBrandCreation}
              />
            )}

            {currentStep === 2 && (
              <div className="flex w-full flex-col gap-5">
                <BrandLogoUpload
                  brandId={brandData?._id}
                  onUploadStart={handleLogoUploadStart}
                  onUploadSuccess={handleLogoUploadSuccess}
                  onUploadError={handleLogoUploadError}
                  error={brandLogoError}
                />

                <div className="flex w-full items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-slate-700 dark:text-gray-300"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipBrandLogo}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      Skip for now
                    </button>

                    <button
                      type="button"
                      onClick={handleBrandLogoNext}
                      disabled={brandLogoUploading}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>Next</span>
                      <IoIosArrowRoundForward size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <AddProductForm
                brandId={brandData?._id}
                categoryIds={(brandData?.categories || []).map((category) =>
                  typeof category === "string" ? category : category._id,
                )}
                onProductCreated={handleProductCreated}
              />
            )}

            {currentStep === 4 && (
              <ProductImagesUpload
                productId={createdProduct?._id}
                onBack={goToPreviousStep}
                onNext={handleProductImagesNext}
              />
            )}

            {completion && (
              <ProductSuccessModal
                productData={createdProduct}
                onSubmit={finishProductCreation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductOnboardingOutlet;
