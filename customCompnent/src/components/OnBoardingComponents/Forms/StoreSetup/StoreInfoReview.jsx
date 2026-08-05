import React, { useState } from "react";

// Icons
import { IoStorefront, IoStorefrontOutline } from "react-icons/io5";
import {
  HiOutlineShieldCheck,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineIdentification,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineCurrencyRupee,
} from "react-icons/hi";
import { HiOutlineBuildingOffice2, HiOutlineLockClosed } from "react-icons/hi2";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdOutlineStorefront } from "react-icons/md";
import { PiStorefrontDuotone } from "react-icons/pi";
import { RiStoreLine } from "react-icons/ri";
import { LiaAddressCard } from "react-icons/lia";
import { GiModernCity, GiPostOffice } from "react-icons/gi";
import { BsSignpost2 } from "react-icons/bs";
import { CiMail } from "react-icons/ci";
import { IoBriefcaseOutline } from "react-icons/io5";

// Components
import InputBox from "../../../InputBox";
import Dropdown from "../../../Dropdown";
import MultiSelect from "../../../MultiSelect";

// Constants
import { BUSINESS_TYPES } from "../../../../utils/constants";

// Read-only display — used when a section is NOT being edited.
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium text-zinc-800 dark:text-gray-200 break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, isEditing, onToggleEdit, children }) {
  return (
    <div className="w-full rounded-lg border border-gray-200 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggleEdit}
          className="flex items-center gap-1 rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
        >
          {isEditing ? (
            <>
              <HiOutlineCheck className="h-3.5 w-3.5" />
              <span>Done</span>
            </>
          ) : (
            <>
              <HiOutlinePencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function ReviewForm({
  formData,
  handleChange, // shared handler — same shape as every other step: ({ target: { name, value } })
  options, // category options from CategoryApi, needed to edit categories
  logoPreview,
  logoFileName,
  categoryLabels = [],
  onBack,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  const {
    storeName,
    description,
    categories,
    businessType,
    registrationNumber,
    businessEmail,
    address,
  } = formData;

  const fullAddress = [address?.addressLine1, address?.addressLine2]
    .filter(Boolean)
    .join(", ");

  const businessTypesArray = Object.values(BUSINESS_TYPES);

  const handleBusinessTypeChange = (val) => {
    handleChange({ target: { name: "businessType", value: val } });
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Heading & Subtitle */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-200">
          Review Your Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please review all the details below before creating your store.
        </p>
      </div>

      {/* ---------------- Store Details ---------------- */}
      <SectionCard
        icon={IoStorefront}
        title="Store Details"
        isEditing={isEditingStore}
        onToggleEdit={() => setIsEditingStore((prev) => !prev)}
      >
        {isEditingStore ? (
          <>
            <InputBox
              name="storeName"
              label="Store Name"
              notOptional
              type="text"
              value={storeName}
              onChange={handleChange}
              icon={<IoStorefrontOutline size={20} />}
            />

            {/* Logo stays read-only — never rendered as an editable field */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Store Logo
              </span>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Store logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PiStorefrontDuotone className="h-5 w-5 text-indigo-500" />
                  )}
                </div>
                <span className="truncate text-sm font-medium text-zinc-800 dark:text-gray-200">
                  {logoFileName || "No logo uploaded"}
                </span>
              </div>
            </div>

            <div className="sm:col-span-1">
              <MultiSelect
                name="categories"
                label="Store Category"
                notOptional
                options={options}
                selected={categories}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-3">
              <InputBox
                name="description"
                label="Store Description"
                notOptional
                type="text"
                multiline
                maxLength="150"
                value={description}
                onChange={handleChange}
              />
            </div>
          </>
        ) : (
          <>
            <DetailItem label="Store Name" value={storeName} />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Store Logo
              </span>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Store logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PiStorefrontDuotone className="h-5 w-5 text-indigo-500" />
                  )}
                </div>
                <span className="truncate text-sm font-medium text-zinc-800 dark:text-gray-200">
                  {logoFileName || "No logo uploaded"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Store Category
              </span>
              {categoryLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {categoryLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                  —
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <DetailItem label="Store Description" value={description} />
            </div>
          </>
        )}
      </SectionCard>

      {/* ---------------- Business Information ---------------- */}
      <SectionCard
        icon={HiOutlineBuildingOffice2}
        title="Business Information"
        isEditing={isEditingBusiness}
        onToggleEdit={() => setIsEditingBusiness((prev) => !prev)}
      >
        {isEditingBusiness ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                Business Type
                <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={businessType || "Select Business Type"}
                onChange={handleBusinessTypeChange}
                options={businessTypesArray}
                className="w-full"
              />
            </div>

            <InputBox
              name="registrationNumber"
              label="Registration Number"
              notOptional
              type="text"
              icon={<IoBriefcaseOutline size={20} />}
              value={registrationNumber}
              onChange={handleChange}
            />

            <InputBox
              name="businessEmail"
              label="Business Email"
              notOptional
              type="email"
              icon={<CiMail size={22} />}
              value={businessEmail}
              onChange={handleChange}
            />

            <div className="sm:col-span-3">
              <InputBox
                name="address.addressLine1"
                label="Address Line 1"
                notOptional
                type="text"
                icon={<LiaAddressCard size={22} />}
                value={address?.addressLine1}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-3">
              <InputBox
                name="address.addressLine2"
                label="Address Line 2 (optional)"
                type="text"
                icon={<LiaAddressCard size={22} />}
                value={address?.addressLine2}
                onChange={handleChange}
              />
            </div>

            <InputBox
              name="address.city"
              label="City"
              notOptional
              type="text"
              icon={<GiModernCity size={22} />}
              value={address?.city}
              onChange={handleChange}
            />

            <InputBox
              name="address.state"
              label="State"
              notOptional
              type="text"
              icon={<BsSignpost2 size={22} />}
              value={address?.state}
              onChange={handleChange}
            />

            <InputBox
              name="address.country"
              label="Country"
              notOptional
              type="text"
              value={address?.country}
              onChange={handleChange}
            />

            <InputBox
              name="address.postalCode"
              label="Postal Code"
              notOptional
              type="text"
              icon={<GiPostOffice size={22} />}
              value={address?.postalCode}
              onChange={handleChange}
              maxLength="6"
            />
          </>
        ) : (
          <>
            <DetailItem
              icon={RiStoreLine}
              label="Business Type"
              value={businessType}
            />
            <DetailItem
              icon={HiOutlineIdentification}
              label="Registration Number"
              value={registrationNumber}
            />
            <DetailItem label="State / Province" value={address?.state} />

            <DetailItem
              icon={HiOutlineMail}
              label="Business Email"
              value={businessEmail}
            />
            <DetailItem label="City" value={address?.city} />

            <DetailItem
              icon={HiOutlineLocationMarker}
              label="Business Address"
              value={
                fullAddress
                  ? `${fullAddress}, ${address?.city || ""}, ${address?.state || ""} - ${
                      address?.postalCode || ""
                    }, ${address?.country || ""}`
                  : null
              }
            />
            <DetailItem
              icon={HiOutlineGlobeAlt}
              label="Country"
              value={address?.country}
            />
            <DetailItem
              icon={HiOutlineCurrencyRupee}
              label="Currency"
              value="INR (₹)"
            />

            <DetailItem label="Postal / ZIP Code" value={address?.postalCode} />
          </>
        )}
      </SectionCard>

      <div className="flex w-full items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-slate-800">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600">
          <HiOutlineShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
            Almost there!
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Once you confirm, your store will be created and you can start
            managing it right away.
          </span>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-gray-300"
        >
          <IoIosArrowRoundBack size={18} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdOutlineStorefront size={18} />
          <span>{isSubmitting ? "Creating Store..." : "Create Store"}</span>
        </button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <HiOutlineLockClosed className="h-3.5 w-3.5" />
        Your information is secure and will be kept private.
      </p>
    </div>
  );
}

export default ReviewForm;
