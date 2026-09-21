import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { IoPricetagOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoLinkOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";
import { IoBusinessOutline } from "react-icons/io5";
import { IoSwapHorizontal } from "react-icons/io5";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineTag } from "react-icons/md";
import { LuNotepadText } from "react-icons/lu";

// Services
import BrandApi from "../../services/BrandApi.js";
import SupplierApi from "../../services/SupplierApi.js";
import CategoryApi from "../../services/CategoryApi.js";

// Utils
import { slugify } from "../../utils/commonFunctions.js";
import {
  validateLogoFile,
  buildSupplierPayload,
  validateBrandForm,
  diffCategoryIds,
  shouldShowCurrentLogo,
} from "./utils/brand.utils.js";

// Components
import FormSection from "./comps/FormSection.jsx";
import InputBox from "../InputBox";
import Dropdown from "../Dropdown";
import MultiSelect from "../MultiSelect";
import DeleteBrandModal from "./Modal/DeleteBrandModal.jsx";
import BrandLogoUploader from "./comps/BrandLogoUploader.jsx";

// Constants
import {
  MAX_LOGO_SIZE_MB,
  ACCEPTED_LOGO_TYPES,
  COUNTRY_OPTIONS,
} from "../../utils/constants.js";

import { collectCategoriesRecursively } from "../../utils/commonFunctions.js";


export default function EditBrandOutlet() {
  const navigate = useNavigate();
  const { brandId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    countryOfOrigin: "",
    yearEstablished: "",
  });
  const [slugTouched, setSlugTouched] = useState(true);

  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [supplierMode, setSupplierMode] = useState("unchanged");
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [newSupplier, setNewSupplier] = useState({
    supplierName: "",
    contactPerson: "",
    contactDetails: { email: "", phone: "", address: "" },
  });
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState("");

  const [currentLogo, setCurrentLogo] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const originalBrandRef = useRef(null);

  const [categoryDraft, setCategoryDraft] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitState, setSubmitState] = useState("idle"); // idle | success | error
  const [submitMessage, setSubmitMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const applyBrandToForm = (brand) => {
    setFormData({
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      website: brand.website || "",
      countryOfOrigin: brand.countryOfOrigin || "",
      yearEstablished: brand.yearEstablished || "",
    });
    setCurrentLogo(brand.logo || null);
    setLogoRemoved(false);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError("");

    setCategoryDraft((brand.categories || []).map((c) => c._id));

    setCurrentSupplier(brand.supplier || null);
    setSupplierMode("unchanged");
    setSupplierPickerOpen(false);
    setSelectedSupplierId("");
    setNewSupplier({
      supplierName: "",
      contactPerson: "",
      contactDetails: { email: "", phone: "", address: "" },
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadBrand = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const brand = await BrandApi.getBrandById(brandId);
        console.log("Fetched brand:", brand);
        if (cancelled) return;
        if (!brand) throw new Error("Brand not found.");
        originalBrandRef.current = brand;
        applyBrandToForm(brand);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load brand.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBrand();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const parents = await CategoryApi.getCategoriesForStore();
        const flattened = await collectCategoriesRecursively(parents);
        if (!cancelled) setAllCategories(flattened);
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load categories.",
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!supplierPickerOpen || suppliers.length > 0) return;
    let cancelled = false;

    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      setSuppliersError("");
      try {
        const data = await SupplierApi.getAllSuppliers();
        if (!cancelled) setSuppliers(data || []);
      } catch (err) {
        if (!cancelled) {
          setSuppliersError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load suppliers.",
          );
        }
      } finally {
        if (!cancelled) setSuppliersLoading(false);
      }
    };

    loadSuppliers();
    return () => {
      cancelled = true;
    };
  }, [supplierPickerOpen, suppliers.length]);

  const openSupplierPicker = () => {
    setSupplierMode("existing");
    setSupplierPickerOpen(true);
  };

  const cancelSupplierPicker = () => {
    setSupplierPickerOpen(false);
    setSupplierMode("unchanged");
    setSelectedSupplierId("");
  };

  // Case 3: delete the supplier, assign nothing.
  const handleRemoveSupplier = () => {
    setSupplierMode("none");
    setSupplierPickerOpen(false);
  };

  const handleUndoRemoveSupplier = () => {
    setSupplierMode("unchanged");
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoFile = (file) => {
    setLogoError("");
    if (!file) return;

    const error = validateLogoFile(file, ACCEPTED_LOGO_TYPES, MAX_LOGO_SIZE_MB);
    if (error) {
      setLogoError(error);
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoRemoved(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleLogoFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveCurrentLogo = () => {
    setLogoRemoved(true);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const validate = () => {
    const next = validateBrandForm(
      formData,
      supplierMode,
      selectedSupplierId,
      newSupplier,
    );
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReset = () => {
    if (!originalBrandRef.current) return;
    applyBrandToForm(originalBrandRef.current);
    setSlugTouched(true);
    setErrors({});
    setSubmitState("idle");
    setSubmitMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    if (!validate()) {
      setSubmitState("error");
      setSubmitMessage("Fix the highlighted fields and try again.");
      return;
    }

    setSaving(true);
    try {
      const updatedBrand = await BrandApi.updateBrandDetails({
        brandId,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        countryOfOrigin: formData.countryOfOrigin.trim(),
        yearEstablished:
          formData.yearEstablished === ""
            ? undefined
            : Number(formData.yearEstablished),
        supplier: buildSupplierPayload(
          supplierMode,
          selectedSupplierId,
          newSupplier,
        ),
      });

      if (logoFile) {
        await BrandApi.updateBrandLogo(brandId, logoFile);
      }

      const originalCategoryIds = (
        originalBrandRef.current?.categories || []
      ).map((c) => c._id);
      const { added: addedCategoryIds, removed: removedCategoryIds } =
        diffCategoryIds(originalCategoryIds, categoryDraft);

      if (addedCategoryIds.length > 0) {
        await BrandApi.addCategoriesToBrand({
          brandId,
          categoryIds: addedCategoryIds,
        });
      }
      if (removedCategoryIds.length > 0) {
        await BrandApi.deleteCategoriesFromBrand({
          brandId,
          categoryIds: removedCategoryIds,
        });
      }
      console.log("Brand updated successfully:", updatedBrand);
      setSubmitState("success");
      setSubmitMessage("Changes saved.");
    } catch (err) {
      setSubmitState("error");
      setSubmitMessage(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading brand…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-red-500">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate("/brands")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 dark:border-slate-800 dark:text-gray-300"
        >
          Back to Brands
        </button>
      </div>
    );
  }

  const showCurrentLogo = shouldShowCurrentLogo(
    currentLogo,
    logoRemoved,
    logoPreview,
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
          >
            <IoArrowBack size={16} /> Back to Brands
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/brands/view/${brandId}`)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
            >
              <IoEyeOutline size={16} /> View Brand
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-slate-800"
            >
              <IoTrashOutline size={16} /> Delete Brand
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoPricetagOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              Edit Brand
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update the details of your brand and click Save Changes.
            </p>
          </div>
        </div>

        {submitMessage && (
          <div
            className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
              submitState === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {submitState === "success" ? (
              <IoCheckmarkCircle size={16} />
            ) : (
              <IoCloseCircle size={16} />
            )}
            {submitMessage}
          </div>
        )}

        <form
          id="edit-brand-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-start"
        >
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <FormSection
              icon={<IoDocumentTextOutline size={20} />}
              title="Brand Information"
              subtitle="Basic information about the brand."
            >
              <div>
                <InputBox
                  label="Brand Name"
                  notOptional
                  placeholder="Enter brand name"
                  name="name"
                  icon={<IoPricetagOutline size={20} />}
                  value={formData.name}
                  maxLength={100}
                  onChange={(e) => {
                    handleField(e);
                    if (!slugTouched) {
                      setFormData((prev) => ({
                        ...prev,
                        slug: slugify(e.target.value),
                      }));
                    }
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  This will be the official name of the brand.
                </span>
              </div>

              <div>
                <InputBox
                  label="Slug"
                  notOptional
                  placeholder="Enter brand slug"
                  name="slug"
                  icon={<MdOutlineTag size={20} />}
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  A unique slug for the brand. Example: nike, adidas, samsung
                </span>
              </div>

              <div>
                <InputBox
                  label="Brand Description"
                  placeholder="Enter a brief description about the brand"
                  name="description"
                  icon={<LuNotepadText size={20} />}
                  value={formData.description}
                  onChange={handleField}
                  multiline
                  rows={4}
                  maxLength={300}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  This description will help customers understand the brand.
                </span>
              </div>

              <div>
                <InputBox
                  label="Website"
                  labelClassName="text-base font-bold text-zinc-800 dark:text-gray-200"
                  placeholder="https://www.brandwebsite.com"
                  name="website"
                  value={formData.website}
                  icon={<IoLinkOutline size={16} />}
                  onChange={handleField}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the official website of the brand (optional).
                </span>
              </div>
            </FormSection>

            <FormSection
              icon={<IoBusinessOutline size={20} />}
              title="Categories"
              subtitle="Categories this brand is tagged under."
            >
              {categoriesError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  <IoAlertCircleOutline size={16} className="flex-shrink-0" />
                  {categoriesError}
                </div>
              )}
              <MultiSelect
                label="Categories"
                placeholder="Select categories"
                options={allCategories}
                selected={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
              />
              {categoriesLoading && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Loading categories…
                </span>
              )}
            </FormSection>

            <FormSection
              icon={<IoBusinessOutline size={20} />}
              title="Supplier"
              subtitle="Manage which supplier this brand is sourced from."
            >
              {!supplierPickerOpen ? (
                supplierMode === "none" ? (
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      No supplier assigned
                    </span>
                    <div className="flex items-center gap-3">
                      {currentSupplier && (
                        <button
                          type="button"
                          onClick={handleUndoRemoveSupplier}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          Undo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={openSupplierPicker}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <IoAddCircleOutline size={14} /> Add Supplier
                      </button>
                    </div>
                  </div>
                ) : currentSupplier ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                        {currentSupplier.supplierName}
                      </p>
                      {currentSupplier.contactDetails?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {currentSupplier.contactDetails.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={openSupplierPicker}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <IoSwapHorizontal size={14} /> Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveSupplier}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        <IoTrashOutline size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3 dark:border-slate-700">
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      No supplier assigned
                    </span>
                    <button
                      type="button"
                      onClick={openSupplierPicker}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <IoAddCircleOutline size={14} /> Add Supplier
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex w-fit items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setSupplierMode("existing")}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        supplierMode === "existing"
                          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Existing Supplier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplierMode("new")}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        supplierMode === "new"
                          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      New Supplier
                    </button>
                  </div>

                  {supplierMode === "existing" && (
                    <div>
                      <Dropdown
                        className="w-full"
                        value={
                          suppliers.find((s) => s._id === selectedSupplierId)
                            ?.supplierName || "Select supplier"
                        }
                        options={suppliers.map((s) => s.supplierName)}
                        onChange={(val) => {
                          const match = suppliers.find(
                            (s) => s.supplierName === val,
                          );
                          setSelectedSupplierId(match?._id || "");
                        }}
                      />
                      {suppliersLoading && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Loading suppliers…
                        </span>
                      )}
                      {suppliersError && (
                        <span className="text-xs text-red-500">
                          {suppliersError}
                        </span>
                      )}
                    </div>
                  )}

                  {supplierMode === "new" && (
                    <div className="flex flex-col gap-3">
                      <InputBox
                        label="Supplier Name"
                        notOptional
                        placeholder="Enter supplier name"
                        name="supplierName"
                        icon={<IoBusinessOutline size={16} />}
                        value={newSupplier.supplierName}
                        onChange={(e) =>
                          setNewSupplier((prev) => ({
                            ...prev,
                            supplierName: e.target.value,
                          }))
                        }
                      />
                      <InputBox
                        label="Contact Person"
                        placeholder="Enter contact person"
                        name="contactPerson"
                        icon={<IoPersonOutline size={16} />}
                        value={newSupplier.contactPerson}
                        onChange={(e) =>
                          setNewSupplier((prev) => ({
                            ...prev,
                            contactPerson: e.target.value,
                          }))
                        }
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InputBox
                          label="Email"
                          placeholder="supplier@example.com"
                          name="email"
                          icon={<IoMailOutline size={16} />}
                          value={newSupplier.contactDetails.email}
                          onChange={(e) =>
                            setNewSupplier((prev) => ({
                              ...prev,
                              contactDetails: {
                                ...prev.contactDetails,
                                email: e.target.value,
                              },
                            }))
                          }
                        />
                        <InputBox
                          label="Phone"
                          placeholder="Enter phone number"
                          name="phone"
                          icon={<IoCallOutline size={16} />}
                          value={newSupplier.contactDetails.phone}
                          onChange={(e) =>
                            setNewSupplier((prev) => ({
                              ...prev,
                              contactDetails: {
                                ...prev.contactDetails,
                                phone: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <InputBox
                        label="Address"
                        placeholder="Enter supplier address"
                        name="address"
                        icon={<IoLocationOutline size={16} />}
                        value={newSupplier.contactDetails.address}
                        onChange={(e) =>
                          setNewSupplier((prev) => ({
                            ...prev,
                            contactDetails: {
                              ...prev.contactDetails,
                              address: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}

                  {errors.supplier && (
                    <p className="text-xs text-red-500">{errors.supplier}</p>
                  )}

                  <button
                    type="button"
                    onClick={cancelSupplierPicker}
                    className="self-start text-xs font-medium text-gray-500 hover:text-zinc-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </FormSection>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <FormSection
              icon={<IoImageOutline size={20} />}
              title="Brand Logo"
              subtitle="Update the brand logo."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-800 py-6">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="New logo preview"
                        className="h-24 w-24 object-contain"
                      />
                    ) : showCurrentLogo ? (
                      <img
                        src={currentLogo}
                        alt={formData.name}
                        className="h-24 w-24 object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <IoImageOutline
                          size={28}
                          className="text-gray-300 dark:text-gray-600"
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          No logo
                        </span>
                      </div>
                    )}
                  </div>
                  {showCurrentLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveCurrentLogo}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <IoTrashOutline size={14} />
                      Remove Current Logo
                    </button>
                  )}
                </div>

                <BrandLogoUploader
                  size="sm"
                  dragActive={dragActive}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  fileInputRef={fileInputRef}
                  onFileChange={(e) => handleLogoFile(e.target.files?.[0])}
                  dropLabel="Drag and drop a new file here"
                />
              </div>
              {logoError && (
                <span className="text-xs text-red-500">{logoError}</span>
              )}
            </FormSection>

            <FormSection
              icon={<IoBusinessOutline size={20} />}
              title="Additional Information (Optional)"
              subtitle="More details about the brand."
            >
              <div>
                <label className="text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2 block">
                  Country of Origin
                </label>
                <Dropdown
                  className="w-full"
                  value={formData.countryOfOrigin || "Select country"}
                  options={COUNTRY_OPTIONS}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, countryOfOrigin: val }))
                  }
                />
              </div>

              <div>
                <InputBox
                  label="Year Established"
                  type="number"
                  placeholder="e.g. 1976"
                  name="yearEstablished"
                  icon={<IoCalendarOutline size={20} />}
                  value={formData.yearEstablished}
                  onChange={handleField}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Year the brand was established (optional).
                </span>
              </div>
            </FormSection>
          </div>
        </form>
      </div>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              form="edit-brand-form"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              <IoSaveOutline size={16} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <DeleteBrandModal
          brandId={brandId}
          formData={formData}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
