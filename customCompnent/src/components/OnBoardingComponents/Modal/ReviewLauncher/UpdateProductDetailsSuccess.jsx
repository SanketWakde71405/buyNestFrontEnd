import React from "react";

//Icons
import { IoClose } from "react-icons/io5";

function UpdateProductDetailsSuccess({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex w-[90%] max-w-sm flex-col items-center justify-center rounded-lg bg-white p-5 text-center shadow-xl dark:bg-slate-900">
        <IoClose
          onClick={onClose}
          size={20}
          className="text-gray-500 dark:text-gray-400 absolute top-3 right-4 "
        />
        <img
          src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786621108/product_success_light_xnncfy.png"
          className="w-50 object-cover"
          alt="success.png"
        />

        <div className="flex flex-col px-4 py-2 my-2 mx-3 gap-2">
          <span className="text-base text-zinc-800 dark:text-gray-200 font-semibold">
            Product Details Updated <br />
            Successfully!
          </span>

          <span className="text-gray-500 dark:text-gray-400 text-sm ">
            Your product information has been updated successfully. You can view
            the changes in your product list.
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex flex-row gap-2 w-full  justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50  disabled:cursor-not-allowed"
        >
          <span className="text-white font-semibold">Great!</span>
        </button>
      </div>
    </div>
  );
}

export default UpdateProductDetailsSuccess;
