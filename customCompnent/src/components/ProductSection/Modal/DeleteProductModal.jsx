import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { IoMdClose } from "react-icons/io";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RiDeleteBin5Fill } from "react-icons/ri";

import ProductApi from "../../../services/ProductApi";

function DeleteProductModal({ onClose, product, onDeleted }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProduct = async () => {
    setIsDeleting(true);
    try {
      const response = await ProductApi.deleteProduct(product?._id);
      console.log("Deleted product", response);
      toast.success("Product deleted successfully!");
      onClose();
      if (onDeleted) {
        onDeleted(product);
      } else {
        navigate("/products");
      }
    } catch (error) {
      console.error("Unable to delete products", error);
      toast.error("Unable to delete product. Try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[90%] max-w-sm flex flex-col text-center justify-center items-center gap-2 shadow-xl">
        <div className="w-full flex justify-end">
          <IoMdClose
            onClick={isDeleting ? undefined : onClose}
            size={25}
            className={`text-zinc-800 dark:text-gray-200 ${
              isDeleting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
        </div>

        {/* Warning symbol */}
        <div className="flex justify-center items-center rounded-full p-2 w-25 h-25 bg-red-100">
          <IoWarningOutline size={40} className="text-red-600" />
        </div>

        {/* Warning Title */}
        <span className="text-zinc-800 dark:text-gray-200 font-bold text-xl">
          Delete Product?
        </span>

        {/* Warning Message */}
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            This action cannot be undone.The product
          </span>
          <span className="text-red-500 font-semibold text-sm">
            "{product?.title}"
          </span>
          <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            and all related data will be deleted permanently.
          </span>
        </div>

        {/* Warning question */}
        <div className="w-full flex flex-row gap-2 mt-5">
          <div className="w-10 h-10 p-2 mt-3 rounded-full flex justify-center items-center bg-yellow-100">
            <IoIosInformationCircleOutline
              className="text-orange-600"
              size={25}
            />
          </div>

          <div className="flex flex-col p-2 justify-start mt-2 items-start">
            <span className="text-zinc-800 dark:text-gray-200 font-medium text-xs">
              Are you sure?
            </span>
            <span className="text-zinc-800 dark:text-gray-200 font-normal text-xs">
              Do you wish to continue?
            </span>
          </div>
        </div>

        <div className="w-full flex flex-row justify-center items-center mt-2 gap-2">
          <div
            onClick={isDeleting ? undefined : onClose}
            className={`border w-[40%] h-10 px-4 py-2 border-zinc-400 rounded-lg dark:border-gray-200 text-zinc-800 dark:text-gray-200 ${
              isDeleting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span className="font-semibold">Cancel</span>
          </div>
          <button
            onClick={deleteProduct}
            disabled={isDeleting}
            className="bg-red-500 w-[60%] h-10 px-4 py-2 rounded-lg text-white flex flex-row justify-start items-start gap-2 disabled:opacity-60"
          >
            <RiDeleteBin5Fill className="pt-1" size={20} />
            <span>{isDeleting ? "Deleting…" : "Delete permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProductModal;
