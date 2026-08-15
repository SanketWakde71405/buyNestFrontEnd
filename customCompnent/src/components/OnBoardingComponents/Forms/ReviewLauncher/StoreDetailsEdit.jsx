import React from "react";

// Icons
import { IoStorefrontOutline } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import { GiModernCity } from "react-icons/gi";
import { LiaAddressCard } from "react-icons/lia";
import { BsSignpost2 } from "react-icons/bs";
import { GiPostOffice } from "react-icons/gi";
import { LuRefreshCcw } from "react-icons/lu";

// Components
import InputBox from "../../../InputBox";
import Dropdown from "../../../Dropdown";

// Services
import StoreApi from "../../../../services/StoreApi";

// Constants
import { BUSINESS_TYPES } from "../../../../utils/constants";

function StoreDetailsEdit({ store, handleChange, onUpdateSucess }) {

  // Extracting options for Business Type
  const businessTypesArray = Object.values(BUSINESS_TYPES);

  // Handle selection of business type from dropdown
  const handleBusinessTypeChange = (val) => {
    handleChange({ target: { name: "businessType", value: val } });
  };

  // Actual update Store Details handler
  const handleUpdateDetails= async()=>{
    try {
        const response = await StoreApi.updateStoreDetails(store);
        console.log("Store details updated successfully." , response);
        onUpdateSucess?.();
    } catch (error) {
        console.error("Failed to update store details", error?.message);
    }
  }

  return (
    <div className="flex flex-col gap-2 justify-start items-end border borde-gray-200 rounded-lg dark:border-slate-700 px-4 py-2">
      <div className="grid grid-flow-row grid-cols-2 gap-2 w-full px-4 py-2">
        <InputBox
          label="Store Name"
          labelClassName="text-xs"
          value={store?.storeName}
          notOptional
          onChange={handleChange}
          name="storeName"
          icon={<IoStorefrontOutline size={20} />}
        />

        <InputBox
          label="Store Email"
          labelClassName="text-xs"
          value={store?.businessEmail}
          notOptional
          onChange={handleChange}
          name="businessEmail"
          icon={<IoMailOutline size={20} />}
        />

        <div className="flex flex-col gap-3 my-2">
          <label
            htmlFor="Business Type"
            className="flex gap-2 text-zinc-800 dark:text-gray-200 font-medium"
          >
            Business Type
            <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={store?.businessType || "Select Business Type"}
            onChange={handleBusinessTypeChange}
            options={businessTypesArray}
            className="w-full"
          />
        </div>

        <InputBox
          name="address.addressLine1"
          label="Address Line 1"
          notOptional
          icon={<LiaAddressCard size={20} />}
          placeholder="Street address, building, etc."
          type="text"
          value={store?.address?.addressLine1}
          onChange={handleChange}
        />

        <InputBox
          name="address.addressLine2"
          label="Address Line 2 (optional)"
          placeholder="Apartment, suite, floor, etc."
          type="text"
          icon={<LiaAddressCard size={20} />}
          value={store?.address?.addressLine2}
          onChange={handleChange}
        />

        <InputBox
          label="City"
          labelClassName="text-xs"
          value={store?.address?.city}
          notOptional
          onChange={handleChange}
          name="address.city"
          icon={<GiModernCity size={20} />}
        />

        <InputBox
          name="address.state"
          label="State"
          notOptional
          placeholder="State"
          type="text"
          icon={<BsSignpost2 size={20} />}
          value={store?.address?.state}
          onChange={handleChange}
        />

        <InputBox
          name="address.postalCode"
          label="Postal Code"
          placeholder="6-digit postal code"
          type="text"
          notOptional
          icon={<GiPostOffice size={22} />}
          value={store?.address?.postalCode}
          onChange={handleChange}
          maxLength="6"
        />
      </div>

      <button
        type="button"
        onClick={handleUpdateDetails}
        className="flex flex-row gap-2  justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50  disabled:cursor-not-allowed"
      >
        <span className="text-white font-semibold">Update Details</span>
        <LuRefreshCcw className="text-white font-semibold" size={20} />
      </button>

    
    </div>
  );
}

export default StoreDetailsEdit;
