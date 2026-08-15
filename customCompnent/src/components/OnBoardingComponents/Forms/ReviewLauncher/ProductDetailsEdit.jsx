import React from "react";

// Icons
import { IoPricetagOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { FaRupeeSign } from "react-icons/fa";
import { LuPackage } from "react-icons/lu";
import { LuRefreshCcw } from "react-icons/lu";

// Components
import InputBox from "../../../InputBox";

// Services
import ProductApi from "../../../../services/ProductApi";

function ProductDetailsEdit({ handleChangeForProduct, product, store, onUpdateSuccess }) {

  // Update Product main handler
  const handleUpdateProduct = async () => {
    const requestProduct = {
      productId: product[0]?._id,
      title: product[0]?.title,
      slug: product[0]?.slug,
      description: product[0]?.description,
      price: product[0]?.price,
      discountPrice: product[0]?.discountPrice,
      stock: product[0]?.stock,
    };

    try {
      const response = await ProductApi.updateProduct(requestProduct);
      console.log("Updated Product", response);
      onUpdateSuccess?.();
    } catch (error) {
        console.error("Failed to update product details", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Product Details Display */}
      <div className="flex flex-row gap-2 justify-between items-start border border-gray-200 rounded-lg dark:border-slate-700 px-4 py-2">
        <div className="flex flex-row gap-2">
          {/* Product Image */}
          <img
            className="w-16 h-16 rounded-lg object-cover"
            src={product[0]?.images?.[0]}
            alt="product_image.png"
          />
          {/* Product Details */}
          <div className="flex flex-col gap-1 px-2">
            <span className="text-zinc-800 dark:text-gray-200 font-semibold text-base">
              {product[0]?.title}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {product[0].category.join(", ")}
            </span>
            <div className="flex flex-row gap-2">
              <span className="text-gray-500 dark:text-gray-400 line-through text-sm font-medium">
                ₹{product[0].price}.00
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                ₹{product[0].discountPrice}.00
              </span>
            </div>
          </div>
        </div>

        <div
          className={`${product[0].isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-red-500"}flex rounded-full px-5 py-1  font-medium text-sm`}
        >
          <span>{product[0].isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>

      {/* Actual Edit Form */}
      <div className="grid grid-flow-row grid-cols-2 gap-2 w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
        <InputBox
          label="Product Name"
          name="title"
          labelClassName="text-xs"
          onChange={handleChangeForProduct}
          value={product[0].title}
          icon={<IoPricetagOutline size={20} />}
          placeholder="Enter product name"
          notOptional
        />

        <InputBox
          label="Product Slug"
          name="slug"
          labelClassName="text-xs"
          onChange={handleChangeForProduct}
          value={product[0].slug}
          icon={<IoIosLink size={20} />}
          placeholder="Enter product slug (unique identifier)"
          notOptional
        />

        <InputBox
          label="Price"
          name="price"
          labelClassName="text-xs"
          onChange={handleChangeForProduct}
          value={product[0].price}
          icon={<FaRupeeSign size={20} />}
          placeholder={0.0}
          notOptional
          type="number"
        />

        <InputBox
          label="Discount Price"
          name="discountPrice"
          labelClassName="text-xs"
          onChange={handleChangeForProduct}
          value={product[0].discountPrice}
          icon={<FaRupeeSign size={20} />}
          placeholder={0.0}
          notOptional
          type="number"
        />

        <InputBox
          label="Stock"
          name="stock"
          labelClassName="text-xs"
          onChange={handleChangeForProduct}
          value={product[0].stock}
          icon={<LuPackage size={20} />}
          placeholder={0}
          notOptional
          type="number"
        />

        <div className="flex justify-end items-end m-2">
          <button
            type="button"
            onClick={handleUpdateProduct}
            className="flex flex-row gap-2 w-full  justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50  disabled:cursor-not-allowed"
          >
            <span className="text-white font-semibold">Update Details</span>
            <LuRefreshCcw className="text-white font-semibold" size={20} />
          </button>
        </div>
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-sm italic">
        You can edit other product details in the settings later.
        <span className="text-red-500">*</span>
      </span>
    </div>
  );
}

export default ProductDetailsEdit;
