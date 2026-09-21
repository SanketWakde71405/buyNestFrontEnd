import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { IoPricetagOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoBusinessOutline } from "react-icons/io5";
import { IoCloseCircleOutline } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoArrowForward } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineTag } from "react-icons/md";
import { LuNotepadText } from "react-icons/lu";
import { GiFactory } from "react-icons/gi";
import { FaRegAddressCard } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

// Services
import BrandApi from "../../../services/BrandApi.js";
import CategoryApi from "../../../services/CategoryApi.js";
import SupplierApi from "../../../services/SupplierApi.js";

// Utils
import { slugify } from "../../../utils/commonFunctions.js";

// Components
import FormSection from "../comps/FormSection.jsx";
import InputBox from "../../InputBox.jsx";
import Toggler from "../../Toggler.jsx";
import MultiSelect from "../../MultiSelect.jsx";
import Dropdown from "../../Dropdown.jsx";
import BrandLogoUploader from "../comps/BrandLogoUploader.jsx";

import {
  MAX_LOGO_SIZE_MB,
  ACCEPTED_LOGO_TYPES,
} from "../../../utils/constants.js";

export default function AddBrandForm({ onCreated }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [includeSupplier, setIncludeSupplier] = useState(false);
  const [supplierMode, setSupplierMode] = useState("existing"); // "existing" | "new"
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const [newSupplier, setNewSupplier] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    pendingAmount: "",
  });

  // Logo upload
  const fileInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchAllCategoriesFlat = async () => {
    const parents = (await CategoryApi.getCategoriesForStore()) || [];
    const flat = [...parents];

    const fetchChildren = async (category) => {
      let children = [];
      try {
        children = (await CategoryApi.getSubCategories(category?._id)) || [];
      } catch (err) {
        // No subcategories under this one — not an error, just a leaf.
        return;
      }
      if (children.length > 0) {
        flat.push(...children);
        await Promise.all(children.map(fetchChildren));
      }
    };

    await Promise.all(parents.map(fetchChildren));

    const seen = new Set();
    return flat.filter((cat) => {
      if (seen.has(cat._id)) return false;
      seen.add(cat._id);
      return true;
    });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categories, suppliers] = await Promise.all([
          fetchAllCategoriesFlat(),
          SupplierApi.getAllSuppliers(),
        ]);
        setAllCategories(categories);
        setAllSuppliers(suppliers || []);
      } catch (err) {
        console.error("Failed to load categories/suppliers", err);
      }
    };
    fetchOptions();
  }, []);

  const [slugTouched, setSlugTouched] = useState(false);
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
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
    const file = e.dataTransfer.files?.[0];
    handleLogoFile(file);
  };

  const supplierOptionNames = (() => {
    const nameCounts = {};
    allSuppliers.forEach((s) => {
      nameCounts[s.supplierName] = (nameCounts[s.supplierName] || 0) + 1;
    });
    const seenSoFar = {};
    return allSuppliers.map((s) => {
      if (nameCounts[s.supplierName] <= 1) return s.supplierName;
      seenSoFar[s.supplierName] = (seenSoFar[s.supplierName] || 0) + 1;
      return `${s.supplierName} (${s._id.slice(-4)})`;
    });
  })();

  const selectedSupplierIndex = allSuppliers.findIndex(
    (s) => s._id === selectedSupplierId,
  );
  const selectedSupplierName =
    supplierOptionNames[selectedSupplierIndex] || "Select supplier";

  const resolveSupplierId = async () => {
    if (!includeSupplier) return undefined;

    if (supplierMode === "existing") {
      return selectedSupplierId || undefined;
    }

    if (!newSupplier.supplierName.trim()) return undefined;

    const created = await SupplierApi.createSupplier({
      supplierName: newSupplier.supplierName.trim(),
      contactPerson: newSupplier.contactPerson.trim() || undefined,
      contactDetails: {
        email: newSupplier.email.trim() || undefined,
        phone: newSupplier.phone.trim() || undefined,
        address: newSupplier.address.trim() || undefined,
      },
      pendingAmount: newSupplier.pendingAmount
        ? Number(newSupplier.pendingAmount)
        : undefined,
    });

    return created?._id;
  };

  const submitBrand = async () => {
    setSaving(true);
    try {
      const supplierId = await resolveSupplierId();

      const brand = await BrandApi.createBrand({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categories: selectedCategoryIds,
        supplier: supplierId,
      });

      if (logoFile && brand?._id) {
        await BrandApi.updateBrandLogo(brand._id, logoFile);
      }

      console.log("Brand created successfully:", brand);
      onCreated?.(brand._id);
    } catch (err) {
      setFormError(err?.message || "Failed to create brand. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !slug.trim()) {
      setFormError("Brand name and slug are required.");
      return;
    }

    if (includeSupplier && supplierMode === "existing" && !selectedSupplierId) {
      setFormError("Please select a supplier from the list.");
      return;
    }

    if (
      includeSupplier &&
      supplierMode === "new" &&
      !newSupplier.supplierName.trim()
    ) {
      setFormError("Supplier name is required to add a new supplier.");
      return;
    }

    submitBrand();
  };

  return (
    <>
      {formError && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <IoAlertCircleOutline size={16} />
          {formError}
        </div>
      )}

      {/* Form grid */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
      >
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <FormSection
            icon={<IoDocumentTextOutline size={20} />}
            title="Brand Information"
            subtitle="Basic information about the brand."
          >
            <InputBox
              label="Brand Name"
              notOptional
              placeholder="Enter brand name"
              name="name"
              icon={<IoPricetagOutline size={20} />}
              value={name}
              onChange={handleNameChange}
            />
            <span className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
              This will be the official name of the brand.
            </span>

            <InputBox
              label="Slug"
              notOptional
              placeholder="Enter brand slug"
              name="slug"
              icon={<MdOutlineTag size={20} />}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
            <span className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
              A unique slug for the brand. Example: nike, adidas, samsung
            </span>

            <InputBox
              label="Brand Description"
              placeholder="Enter a brief description about the brand"
              name="description"
              icon={<LuNotepadText size={20} />}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              maxLength={300}
            />
            <span className="-mt-3 text-xs text-gray-500 dark:text-gray-400">
              This description will help customers understand the brand.
            </span>
          </FormSection>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <FormSection
            icon={<IoImageOutline size={20} />}
            title="Brand Logo"
            subtitle="Upload the brand logo."
          >
            <BrandLogoUploader
              size="lg"
              dragActive={dragActive}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              fileInputRef={fileInputRef}
              onFileChange={(e) => handleLogoFile(e.target.files?.[0])}
              logoError={logoError}
              dropLabel="Drag and drop your file here"
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                Preview
              </span>
              <div className="flex flex-col items-center justify-center gap-2 border border-gray-200 dark:border-slate-800 rounded-lg py-6">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute -top-1 -right-1 text-gray-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded-full"
                      aria-label="Remove logo"
                    >
                      <IoCloseCircleOutline size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <IoImageOutline
                      size={28}
                      className="text-gray-300 dark:text-gray-600"
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Logo preview will appear here
                    </span>
                  </>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<IoBusinessOutline size={20} />}
            title="Additional Information"
            subtitle="Categories and supplier for this brand (optional)."
          >
            <MultiSelect
              label="Categories"
              placeholder="Select categories"
              options={allCategories}
              selected={selectedCategoryIds}
              onChange={(e) => setSelectedCategoryIds(e.target.value)}
            />

            <Toggler
              label="Link a Supplier"
              checked={includeSupplier}
              onChange={() => setIncludeSupplier((prev) => !prev)}
              activeLabel="Included"
              inactiveLabel="Not included"
            />

            {includeSupplier && (
              <div className="flex flex-col gap-3 border border-gray-100 dark:border-slate-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSupplierMode("existing")}
                    className={`flex-1 text-sm font-medium rounded-lg px-3 py-2 border transition-colors ${
                      supplierMode === "existing"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 dark:border-slate-700 text-zinc-700 dark:text-gray-300"
                    }`}
                  >
                    Existing Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierMode("new")}
                    className={`flex-1 text-sm font-medium rounded-lg px-3 py-2 border transition-colors ${
                      supplierMode === "new"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 dark:border-slate-700 text-zinc-700 dark:text-gray-300"
                    }`}
                  >
                    New Supplier
                  </button>
                </div>

                {supplierMode === "existing" ? (
                  allSuppliers.length > 0 ? (
                    <Dropdown
                      value={selectedSupplierName}
                      options={supplierOptionNames}
                      className="w-full"
                      onChange={(name) => {
                        const idx = supplierOptionNames.indexOf(name);
                        setSelectedSupplierId(allSuppliers[idx]?._id || null);
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      No suppliers found yet — switch to "New Supplier" to add
                      one.
                    </span>
                  )
                ) : (
                  <div className="flex flex-col gap-3">
                    <InputBox
                      label="Supplier Name"
                      notOptional
                      placeholder="Enter supplier name"
                      name="supplierName"
                      icon={<GiFactory size={20} />}
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
                      placeholder="Enter contact person's name"
                      name="contactPerson"
                      icon={<IoPersonOutline size={20} />}
                      value={newSupplier.contactPerson}
                      onChange={(e) =>
                        setNewSupplier((prev) => ({
                          ...prev,
                          contactPerson: e.target.value,
                        }))
                      }
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputBox
                        label="Email"
                        type="email"
                        placeholder="supplier@example.com"
                        name="email"
                        icon={<IoMailOutline size={20} />}
                        value={newSupplier.email}
                        onChange={(e) =>
                          setNewSupplier((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                      <InputBox
                        label="Phone"
                        placeholder="Enter phone number"
                        name="phone"
                        icon={<IoCallOutline size={20} />}
                        value={newSupplier.phone}
                        onChange={(e) =>
                          setNewSupplier((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <InputBox
                      label="Address"
                      placeholder="Enter supplier address"
                      name="address"
                      icon={<FaRegAddressCard size={20} />}
                      value={newSupplier.address}
                      onChange={(e) =>
                        setNewSupplier((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                    <InputBox
                      label="Pending Amount"
                      type="number"
                      placeholder="0"
                      icon={<FaIndianRupeeSign size={20} />}
                      name="pendingAmount"
                      value={newSupplier.pendingAmount}
                      onChange={(e) =>
                        setNewSupplier((prev) => ({
                          ...prev,
                          pendingAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </FormSection>
        </div>
      </form>

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
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Continue"}
            <IoArrowForward size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
