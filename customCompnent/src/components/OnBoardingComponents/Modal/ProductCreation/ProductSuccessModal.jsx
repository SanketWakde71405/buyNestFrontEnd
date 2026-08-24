import React from 'react'

// Icons
import { IoCheckmark } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";


function ProductSuccessModal({productData, onSubmit}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[95%] max-w-lg flex flex-col text-center justify-center items-center shadow-xl">
        <div className="flex justify-center my-2 items-center w-16 h-16 rounded-full bg-green-200">
          <IoCheckmark size={35} className="text-green-600" />
        </div>

        <div className="flex flex-col gap-2 w-full my-2">
          <span className="text-center text-lg font-semibold text-zinc-800 dark:text-gray-200">
            Product Added successfully!
          </span>
          <span className="text-center text-sm font-medium text-gray-500 dark:text-gray-500">
            Congrats! 🎉 you have added first product to your store.
          </span>
          <span className="text-center text-sm italic font-medium text-gray-500 dark:text-gray-500">
            You can always edit the product details later.
          </span>
        </div>

        <div className="px-4 flex flex-row justify-start items-start py-2 mx-5 border border-gray-500 rounded-lg bg-transparent dark:border dark:border-slate-800 w-full">
          {/* First Image  */}
          <div className="w-32 h-32 rounded-lg">
            <img
              src={productData?.images[0]}
              alt="https://res.cloudinary.com/dx88pbasu/image/upload/v1785837004/sanket-electronics/electronics/motorola/6a71b5bce95553616a53aa8a/vykr1tzi2lxoprljs7k8.png"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-zinc-800 font-medium text-base">
              {productData?.title}
            </span>

            <div className="flex flex-row w-full gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                Electronics
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                &middot;
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                Laptops
              </span>
            </div>

            <div className="w-full flex flex-row gap-2">
              <span className="text-gray-500 dark:text-gray-400 line-through text-sm font-semibold">
                ₹ {productData?.price}
              </span>
              <span className="text-zinc-800 dark:text-gray-200 text-base font-semibold">
                ₹ {productData?.discountPrice}
              </span>
              <div
                className={`flex rounded-2xl px-4 py-1 ${productData?.isActive ? "bg-green-100" : "bg-red-100"}`}
              >
                <span
                  className={`${productData?.isActive ? "text-green-600" : "text-red-600"}text-sm font-medium`}
                >
                  {productData?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 mt-5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 w-full"
        >
          <span>Next</span>
          <IoIosArrowRoundForward size={18} />
        </button>
      </div>
    </div>
  );
}

export default ProductSuccessModal