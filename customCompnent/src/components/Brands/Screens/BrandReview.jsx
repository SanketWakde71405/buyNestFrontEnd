import React, { useRef, useState, useEffect } from "react";

// Icons
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoPencilOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoBusinessOutline } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoFolderOpenOutline } from "react-icons/io5";
import { IoLinkOutline } from "react-icons/io5";
import { MdOutlineTag } from "react-icons/md";
import { LuNotepadText } from "react-icons/lu";

// Services
import BrandApi from "../../../services/BrandApi.js";

// Components
import FormSection from "../comps/FormSection.jsx";
import InputBox from "../../InputBox.jsx";
import ButtonIcon from "../../ButtonIcon.jsx";
import MultiSelect from "../../MultiSelect.jsx";

const MAX_LOGO_SIZE_MB = 2;
const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function SectionEditToggle({ editing, onEdit, onCancel, onSave, saving }) {
  if (!editing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg px-2.5 py-1.5 transition-colors"
      >
        <IoPencilOutline size={14} />
        Edit
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg px-2.5 py-1.5 transition-colors"
      >
        <IoCloseOutline size={14} />
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-60"
      >
        <IoSaveOutline size={14} />
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function BrandReview({ brand, allCategories = [], onBrandUpdated }) {
  const [current, setCurrent] = useState(brand);
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoDraft, setInfoDraft] = useState({
    name: brand?.name || "",
    slug: brand?.slug || "",
    description: brand?.description || "",
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [editingCategories, setEditingCategories] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState(
    (brand?.categories || []).map((c) => c._id),
  );
  const [categoriesSaving, setCategoriesSaving] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const [editingLogo, setEditingLogo] = useState(false);
  const fileInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleSaveInfo = async () => {
    setInfoError("");
    if (!infoDraft.name.trim() || !infoDraft.slug.trim()) {
      setInfoError("Brand name and slug cannot be empty.");
      return;
    }

    setInfoSaving(true);
    try {
      const response = await BrandApi.updateBrandDetails({
        brandId: current._id,
        name: infoDraft.name.trim(),
        slug: infoDraft.slug.trim(),
        description: infoDraft.description.trim(),
      });
      console.log("Brand details:", current);
      const updated = { ...current, ...response.data };
      setCurrent(updated);
      onBrandUpdated?.(updated);
      setEditingInfo(false);
    } catch (err) {
      setInfoError(err?.message || "Failed to update brand details.");
    } finally {
      setInfoSaving(false);
    }
  };

  const handleSaveCategories = async () => {
    setCategoriesError("");
    const originalIds = (current.categories || []).map((c) => c._id);
    const added = categoryDraft.filter((id) => !originalIds.includes(id));
    const removed = originalIds.filter((id) => !categoryDraft.includes(id));

    if (added.length === 0 && removed.length === 0) {
      setEditingCategories(false);
      return;
    }

    setCategoriesSaving(true);
    try {
      let latestBrand = current;
      if (added.length > 0) {
        const response = await BrandApi.addCategoriesToBrand({
          brandId: current._id,
          categoryIds: added,
        });
        latestBrand = response.data;
      }
      if (removed.length > 0) {
        const response = await BrandApi.deleteCategoriesFromBrand({
          brandId: current._id,
          categoryIds: removed,
        });
        latestBrand = response.data;
      }

      const updated = { ...current, categories: latestBrand.categories };
      setCurrent(updated);
      onBrandUpdated?.(updated);
      setEditingCategories(false);
    } catch (err) {
      setCategoriesError(err?.message || "Failed to update categories.");
    } finally {
      setCategoriesSaving(false);
    }
  };

  const handleLogoFile = (file) => {
    setLogoError("");
    if (!file) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Please upload a JPG, PNG or WebP file.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setLogoError(`File is too large. Max size is ${MAX_LOGO_SIZE_MB}MB.`);
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleLogoFile(e.dataTransfer.files?.[0]);
  };

  const handleSaveLogo = async () => {
    setLogoError("");
    if (!logoFile) {
      setEditingLogo(false);
      return;
    }

    setLogoSaving(true);
    try {
      const response = await BrandApi.updateBrandLogo(current._id, logoFile);
      const updated = { ...current, ...response.data };
      setCurrent(updated);
      onBrandUpdated?.(updated);
      setEditingLogo(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      setLogoError(err?.message || "Failed to update logo.");
    } finally {
      setLogoSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Success banner */}
      <div className="flex items-center gap-2 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
        <IoCheckmarkCircleOutline size={18} className="flex-shrink-0" />
        Brand created successfully. Review the details below — you can correct
        anything before you're done.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <FormSection
            icon={<IoDocumentTextOutline size={20} />}
            title="Brand Information"
            subtitle="Basic information about the brand."
            action={
              <SectionEditToggle
                editing={editingInfo}
                saving={infoSaving}
                onEdit={() => {
                  setInfoDraft({
                    name: current.name || "",
                    slug: current.slug || "",
                    description: current.description || "",
                  });
                  setInfoError("");
                  setEditingInfo(true);
                }}
                onCancel={() => setEditingInfo(false)}
                onSave={handleSaveInfo}
              />
            }
          >
            {infoError && (
              <div className="flex items-center gap-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400">
                <IoAlertCircleOutline size={16} className="flex-shrink-0" />
                {infoError}
              </div>
            )}

            {editingInfo ? (
              <>
                <InputBox
                  label="Brand Name"
                  notOptional
                  icon={<IoDocumentTextOutline size={20} />}
                  value={infoDraft.name}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <InputBox
                  label="Slug"
                  notOptional
                  icon={<MdOutlineTag size={20} />}
                  value={infoDraft.slug}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
                <InputBox
                  label="Brand Description"
                  icon={<LuNotepadText size={20} />}
                  value={infoDraft.description}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  multiline
                  rows={4}
                  maxLength={300}
                />
              </>
            ) : (
              <dl className="flex flex-col gap-3">
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Brand Name
                  </dt>
                  <dd className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                    {current.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Slug
                  </dt>
                  <dd className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                    {current.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="text-sm text-zinc-700 dark:text-gray-300">
                    {current.description || (
                      <span className="text-gray-400 dark:text-gray-500">
                        No description added.
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </FormSection>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <FormSection
            icon={<IoImageOutline size={20} />}
            title="Brand Logo"
            subtitle="The brand's logo."
            action={
              <SectionEditToggle
                editing={editingLogo}
                saving={logoSaving}
                onEdit={() => {
                  setLogoError("");
                  setEditingLogo(true);
                }}
                onCancel={() => {
                  setEditingLogo(false);
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                onSave={handleSaveLogo}
              />
            }
          >
            {editingLogo ? (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 px-4 transition-colors ${
                    dragActive
                      ? "border-indigo-400 bg-indigo-50 dark:bg-slate-800"
                      : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950"
                  }`}
                >
                  <div className="rounded-full p-3 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                    <IoCloudUploadOutline size={26} />
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-gray-300">
                    Drag and drop a new logo here
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    or
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_LOGO_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => handleLogoFile(e.target.files?.[0])}
                  />
                  <ButtonIcon
                    icon={<IoFolderOpenOutline size={18} />}
                    text="Browse Files"
                    onClick={() => fileInputRef.current?.click()}
                  />

                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    JPG, PNG or WebP. Max size {MAX_LOGO_SIZE_MB}MB.
                  </span>
                </div>
                {logoError && (
                  <span className="text-xs text-red-500">{logoError}</span>
                )}
              </>
            ) : null}

            <div className="flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-slate-800 rounded-lg py-6">
              {logoPreview || current.logo ? (
                <img
                  src={current.logo}
                  alt={current.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <>
                  <IoImageOutline
                    size={28}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    No logo uploaded yet.
                  </span>
                </>
              )}
            </div>
          </FormSection>

          <FormSection
            icon={<IoBusinessOutline size={20} />}
            title="Categories"
            subtitle="Categories this brand is tagged under."
            action={
              <SectionEditToggle
                editing={editingCategories}
                saving={categoriesSaving}
                onEdit={() => {
                  setCategoryDraft(
                    (current.categories || []).map((c) => c._id),
                  );
                  setCategoriesError("");
                  setEditingCategories(true);
                }}
                onCancel={() => setEditingCategories(false)}
                onSave={handleSaveCategories}
              />
            }
          >
            {categoriesError && (
              <div className="flex items-center gap-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400">
                <IoAlertCircleOutline size={16} className="flex-shrink-0" />
                {categoriesError}
              </div>
            )}

            {editingCategories ? (
              <MultiSelect
                label="Categories"
                placeholder="Select categories"
                options={allCategories}
                selected={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
              />
            ) : current.categories?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {current.categories.map((cat) => (
                  <span
                    key={cat._id}
                    className="text-xs font-medium bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full px-3 py-1"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                No categories linked yet.
              </span>
            )}
          </FormSection>

          <FormSection
            icon={<IoLinkOutline size={20} />}
            title="Supplier"
            subtitle="Supplier linked to this brand."
          >
            {current.supplier ? (
              <dl className="flex flex-col gap-2">
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    Supplier Name
                  </dt>
                  <dd className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                    {current.supplier.supplierName}
                  </dd>
                </div>
                {current.supplier.contactPerson && (
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">
                      Contact Person
                    </dt>
                    <dd className="text-sm text-zinc-700 dark:text-gray-300">
                      {current.supplier.contactPerson}
                    </dd>
                  </div>
                )}
                {current.supplier.contactDetails && (
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">
                      Contact Details
                    </dt>
                    <dd className="text-sm text-zinc-700 dark:text-gray-300">
                      {current.supplier.contactDetails.email && (
                        <p>{current.supplier.contactDetails.email}</p>
                      )}
                      {current.supplier.contactDetails.phone && (
                        <p>{current.supplier.contactDetails.phone}</p>
                      )}
                      {current.supplier.contactDetails.address && (
                        <p>{current.supplier.contactDetails.address}</p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                No supplier linked.
              </span>
            )}
          </FormSection>
        </div>
      </div>
    </div>
  );
}

export default BrandReview;
