import React, { useState } from "react";

// Icons
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import { LiaAddressCard } from "react-icons/lia";
import { GiModernCity } from "react-icons/gi";
import { BsSignpost2 } from "react-icons/bs";
import { GiPostOffice } from "react-icons/gi";
import { CiMail } from "react-icons/ci";
import { IoBriefcaseOutline } from "react-icons/io5";

// Components
import InputBox from "../../../InputBox";
import Dropdown from "../../../Dropdown";

// Constants values
import { BUSINESS_TYPES } from "../../../../utils/constants";

// Email and postal code check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_REGEX = /^\d{6}$/;

function BusinessInfoForm({
  formData,
  handleChange,
  error,
  isSubmitting,
  onBack,
  onSubmit,
}) {
  const { address } = formData;

  const businessTypesArray = Object.values(BUSINESS_TYPES);

  // Form validation
  const isFormValid =
    formData.businessType.trim() !== "" &&
    formData.registrationNumber.trim() !== "" &&
    EMAIL_REGEX.test(formData.businessEmail.trim()) &&
    address.addressLine1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.state.trim() !== "" &&
    address.country.trim() !== "" &&
    POSTAL_CODE_REGEX.test(address.postalCode.trim());

  // Submitting the form to create a store
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    onSubmit();
  };

  // handles selection of Business Type
  const handleBusinessTypeChange = (val) => {
    handleChange({ target: { name: "businessType", value: val } });
  };

  return (
    <div className="flex flex-col justify-center w-full px-2 sm:px-4 py-1">
      {/* Heading and subtitle */}
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-zinc-800 dark:text-gray-200 text-center text-xl font-bold">
          Business Info
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-center font-medium text-sm">
          Tell us a bit about your business.
        </span>
      </div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        {/* Business type — fixed dropdown */}
        <label
          htmlFor="Business Type"
          className="flex gap-2 text-zinc-800 dark:text-gray-200 font-medium"
        >
          Business Type
          <span className="text-red-500">*</span>
        </label>
        <Dropdown
          value={formData.businessType || "Select Business Type"}
          onChange={handleBusinessTypeChange}
          options={businessTypesArray}
          className="w-full"
        />

        {/* Registration Number Input */}
        <InputBox
          name="registrationNumber"
          label="Registration Number"
          notOptional
          icon={<IoBriefcaseOutline size={20} />}
          placeholder="Enter your business registration number"
          type="text"
          value={formData.registrationNumber}
          onChange={handleChange}
        />

        {/* Business Email Input  */}
        <InputBox
          name="businessEmail"
          label="Business Email"
          notOptional
          placeholder="Enter your business email"
          type="email"
          icon={<CiMail size={22} />}
          value={formData.businessEmail}
          onChange={handleChange}
        />

        {/* Address Line 1 Input */}
        <InputBox
          name="address.addressLine1"
          label="Address Line 1"
          notOptional
          icon={<LiaAddressCard size={22} />}
          placeholder="Street address, building, etc."
          type="text"
          value={address.addressLine1}
          onChange={handleChange}
        />

        {/* Address Line 2 Input */}
        <InputBox
          name="address.addressLine2"
          label="Address Line 2 (optional)"
          placeholder="Apartment, suite, floor, etc."
          type="text"
          icon={<LiaAddressCard size={22} />}
          value={address.addressLine2}
          onChange={handleChange}
        />

        <div className="flex gap-2">
          {/* City Input */}
          <InputBox
            name="address.city"
            label="City"
            notOptional
            placeholder="City"
            type="text"
            icon={<GiModernCity size={22} />}
            value={address.city}
            onChange={handleChange}
          />

          {/* State input  */}
          <InputBox
            name="address.state"
            label="State"
            notOptional
            placeholder="State"
            type="text"
            icon={<BsSignpost2 size={22} />}
            value={address.state}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2">
          {/* Country Input */}
          <InputBox
            name="address.country"
            label="Country"
            notOptional
            placeholder="Country"
            type="text"
            value={address.country}
            onChange={handleChange}
          />

          {/* Postal code Input */}
          <InputBox
            name="address.postalCode"
            label="Postal Code"
            placeholder="6-digit postal code"
            type="text"
            notOptional
            icon={<GiPostOffice size={22} />}
            value={address.postalCode}
            onChange={handleChange}
            maxLength="6"
          />
        </div>

        {/* Error display if there is an error while creating store. */}
        {error && (
          <span className="text-xs text-red-500 text-center -mb-1">
            {error}
          </span>
        )}

        {/* Form Navigator buttons */}
        <div className="flex gap-2 my-1">
          {/* Go back button */}
          <button
            type="button"
            onClick={onBack}
            className="text-zinc-700 dark:text-gray-300 text-center px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 flex gap-2 justify-center items-center font-medium w-1/3"
          >
            <IoIosArrowRoundBack size={20} />
            <span>Back</span>
          </button>

          {/* Store Creation button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 flex gap-2 w-2/3 justify-center items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Creating Store..." : "Continue"}</span>
            {!isSubmitting && <IoIosArrowRoundForward size={20} />}
          </button>
        </div>
      </form>

      <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        You can update these details anytime from settings.
      </span>
    </div>
  );
}

export default BusinessInfoForm;
