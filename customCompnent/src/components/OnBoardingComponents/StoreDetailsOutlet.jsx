import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import Logo from "../../assets/companyLogoGradient.svg?react";
import {
  IoIosArrowRoundForward,
  IoIosCheckmarkCircleOutline,
} from "react-icons/io";

// Components
import Connector from "../Connector";
import StoreDetailsForm from "./Forms/StoreDetailsForm";
import BusinessInfoForm from "./Forms/BusinessInfoForm";
import StoreSuccessModal from "./Modal/StoreSuccessModal";
import StoreLogoUpload from "./Forms/StoreLogoUpload";
import LogoUploadStatusModal from "./Modal/LogoUploadStatusModal";
import ReviewForm from "./Forms/StoreInfoReview";

// Services
import CategoryApi from "../../services/CategoryApi";
import StoreApi from "../../services/StoreApi";

// Constants
import { ONBOARDING_PROGRESS_KEY } from "../HomeSection/Onboarding";

// Store Details Form Object structure
const initialFormData = {
  // Step 1 — Store Details
  storeName: "",
  description: "",
  categories: [],

  // Step 2 — Business Info
  businessType: "",
  registrationNumber: "",
  businessEmail: "",
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
  },
};

// Store Setup Steps
const steps = [
  {
    id: "storeSetup",
    number: 1,
    title: "Store Details",
    completed: false,
  },
  {
    id: "BusinessInfo",
    number: 2,
    title: "Business Info",
    completed: false,
  },
  {
    id: "storeLogo",
    number: 3,
    title: "Upload store logo",
    completed: false,
  },
  {
    id: "Review",
    number: 4,
    title: "Review",
    completed: false,
  },
];

function StoreDetailsOutlet({ onSetupSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStoreSuccess, setShowStoreSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoModalStatus, setLogoModalStatus] = useState(null); // null | "success" | "error"
  const [hasReviewEdits, setHasReviewEdits] = useState(false);

  // Create the preview URL once per file, and clean up the previous one —
  // recreating it inline on every render would leak blob URLs.
  useEffect(() => {
    if (!logoFile) return;

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  // Get Parent categories from database so user can select categories of the products in his store
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryApi.getParentCategories();
        console.log("Response", response);
        setOptions(response); // keep full objects — need _id for value, name for label
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  // Supports both flat fields ("storeName") and nested fields ("address.city")
  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => {
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

    // ✅ Only edits made while actually on the Review step count —
    // edits from steps 1/2 shouldn't force an update call later.
    if (currentStep === 4) {
      setHasReviewEdits(true);
    }

    if (error) {
      setError("");
    }
  };

  // Next Step function
  const goToNextStep = () => {
    const step = steps.find((step) => step.number === currentStep);
    console.log("Step number", step);
    console.log("Current Step", currentStep);

    if (step) {
      step.completed = true;
      console.log("Step number", step);
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  // Previous step function
  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Store success Modal is closed
  const handleStoreSuccess = () => {
    setShowStoreSuccess(false);
    goToNextStep();
  };

  // Store is actually created at the end of step 2
  const handleCreateStore = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await StoreApi.createStore(formData);
      console.log("Response", response);
      setShowStoreSuccess(true);
    } catch (err) {
      console.error("Failed to create store", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong while creating your store. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding lives on a different route, so it won't re-mount when this
  // finishes — progress is written to localStorage (read by Onboarding on
  // mount/focus) rather than passed back through component state.
  const markStoreSetupComplete = () => {
    try {
      const progress =
        JSON.parse(localStorage.getItem(ONBOARDING_PROGRESS_KEY)) || {};
      progress[1] = true;
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("Failed to persist onboarding progress", err);
    }
  };

  // Final Finishing store setup
  const finishStoreSetup = () => {
    markStoreSetupComplete();
    onSetupSuccess?.();
    navigate("/");
  };

  // If any detail is updated by user while reviewing it updates the details
  const handleReviewSubmit = async () => {
    if (!hasReviewEdits) {
      finishStoreSetup();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await StoreApi.updateStoreDetails(formData);
      finishStoreSetup();
    } catch (err) {
      console.error("Failed to update store details", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong while updating your store. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logo is optional — schema falls back to a default placeholder, so
  // "Skip for now" is a valid path, not just a dead end.
  const handleUploadLogo = async () => {
    if (!logoFile) {
      setLogoError("Please choose a logo, or skip this step for now");
      return;
    }

    setIsUploadingLogo(true);
    setLogoError("");

    try {
      const uploadData = new FormData();
      uploadData.append("storeLogo", logoFile);
      console.log("is File?", logoFile instanceof File, logoFile);
      for (const [k, v] of uploadData.entries()) console.log(k, v);
      await StoreApi.addStoreLogo(uploadData);
      setLogoModalStatus("success");
    } catch (err) {
      console.error("Failed to upload store logo", err);
      setLogoError(
        err?.response?.data?.message ||
          "Something went wrong while uploading your logo. Please try again.",
      );
      setLogoModalStatus("error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Upload logo step can be skipped if there is an error in uploading logo file
  const handleSkipLogo = () => {
    setLogoError("");
    goToNextStep();
  };

  const categoryLabels = options
    .filter((opt) => formData.categories?.includes(opt._id))
    .map((opt) => opt.name);

  return (
    <div className="relative w-full min-h-screen">
      {/* Background layer — pinned to viewport, independent of content height */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:bg-none dark:bg-slate-950" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 dark:bg-violet-600/30 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600/30 rounded-full blur-3xl -z-10" />

      {/* Content layer — grows freely, page scrolls if content overflows viewport */}
      <div className="relative z-10 w-full min-h-screen flex justify-center items-start sm:items-center px-4 py-8">
        <div className="relative flex flex-col items-center w-full max-w-2xl border border-gray-200 rounded-lg bg-white dark:bg-slate-950 dark:border dark:border-slate-800 z-20 px-6 py-6 my-auto">
          {/* Logo  */}
          <div className="flex flex-row items-center gap-2">
            <Logo className="w-16 h-16" />
            <div className="flex flex-col justify-center items-start">
              <span
                className="font-bold text-2xl text-zinc-800 dark:text-gray-200"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                BuyNest
              </span>
              <span
                className="text-sm text-indigo-600"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Admin
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center my-3 w-full">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center text-center w-20 sm:w-24 flex-shrink-0">
                  {step.completed && step.number < currentStep ? (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-indigo-600 mb-3`}
                    >
                      <IoIosCheckmarkCircleOutline size={30} />
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold mb-3 ${
                        step.number === currentStep
                          ? "bg-indigo-600 text-white"
                          : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-500 border border-gray-300 dark:border dark:border-slate-700"
                      }`}
                    >
                      {step.number}
                    </div>
                  )}

                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-gray-500 mb-1">
                    {step.title}
                  </h3>
                </div>

                {index < steps.length - 1 && (
                  <Connector active={step.number < currentStep} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Active step form */}
          {currentStep === 1 && (
            <StoreDetailsForm
              formData={formData}
              handleChange={handleChange}
              options={options}
              onNext={goToNextStep}
            />
          )}

          {currentStep === 2 && (
            <BusinessInfoForm
              formData={formData}
              handleChange={handleChange}
              error={error}
              isSubmitting={isSubmitting}
              onBack={goToPreviousStep}
              onSubmit={handleCreateStore}
            />
          )}

          {currentStep === 3 && (
            <div className="flex w-full flex-col gap-5">
              <StoreLogoUpload
                value={logoPreview}
                onFileSelect={(file) => {
                  setLogoFile(file);
                  setLogoError("");
                }}
                error={logoError}
              />

              <div className="flex w-full items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={isUploadingLogo}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-gray-300"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkipLogo}
                    disabled={isUploadingLogo}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400"
                  >
                    Skip for now
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadLogo}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isUploadingLogo ? "Uploading..." : "Next"}</span>
                    <IoIosArrowRoundForward size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <ReviewForm
              formData={formData}
              handleChange={handleChange}
              options={options}
              logoPreview={logoPreview}
              logoFileName={logoFile?.name}
              categoryLabels={categoryLabels}
              onBack={goToPreviousStep}
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>
      </div>

      {showStoreSuccess && (
        <StoreSuccessModal
          onClose={() => {
            handleStoreSuccess();
          }}
        />
      )}

      {logoModalStatus === "success" && (
        <LogoUploadStatusModal
          status="success"
          onPrimaryAction={() => {
            setLogoModalStatus(null);
            goToNextStep();
          }}
          onClose={() => {
            setLogoModalStatus(null);
            goToNextStep();
          }}
        />
      )}

      {logoModalStatus === "error" && (
        <LogoUploadStatusModal
          status="error"
          message={logoError}
          onPrimaryAction={() => setLogoModalStatus(null)} // dismiss, let them retry from the form
          onClose={() => setLogoModalStatus(null)}
          showSecondaryAction
          secondaryLabel="Skip for now"
          onSecondaryAction={() => {
            setLogoModalStatus(null);
            handleSkipLogo();
          }}
        />
      )}
    </div>
  );
}

export default StoreDetailsOutlet;
