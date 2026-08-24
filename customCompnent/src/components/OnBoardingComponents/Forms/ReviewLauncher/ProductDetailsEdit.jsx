import React, { useState, useEffect } from "react";

// Icons
import { IoPricetagOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { FaRupeeSign } from "react-icons/fa";
import { LuPackage } from "react-icons/lu";
import { LuRefreshCcw } from "react-icons/lu";

// Components
import InputBox from "../../../InputBox";
import Toggler from "../../../Toggler";

// Services
import ProductApi from "../../../../services/ProductApi";

const MIN_ACTIVE_IMAGES = 3;

function ProductDetailsEdit({
  handleChangeForProduct,
  product,
  store,
  onUpdateSuccess,
}) {
  const [costPrice, setCostPrice] = useState(product[0]?.costPrice ?? "");
  const [isActive, setIsActive] = useState(product[0]?.isActive ?? true);
  const [error, setError] = useState("");

  const imageCount = product[0]?.images?.length || 0;
  const belowImageMinimum = imageCount < MIN_ACTIVE_IMAGES;

  useEffect(() => {
    setCostPrice(product[0]?.costPrice ?? "");
    setIsActive(product[0]?.isActive ?? true);
  }, [product]);

  const handleUpdateProduct = async () => {
    setError("");

    const requestProduct = {
      productId: product[0]?._id,
      title: product[0]?.title,
      slug: product[0]?.slug,
      description: product[0]?.description,
      price: product[0]?.price,
      discountPrice: product[0]?.discountPrice,
      stock: product[0]?.stock,
      isActive,
    };

    if (costPrice !== "" && costPrice != null) {
      requestProduct.costPrice = costPrice;
    }

    try {
      const response = await ProductApi.updateProduct(requestProduct);
      onUpdateSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to update product details");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Product Details Display */}
      <div className="flex flex-row gap-2 justify-between items-start border border-gray-200 rounded-lg dark:border-slate-700 px-4 py-2">
        <div className="flex flex-row gap-2">
          <img
            className="w-16 h-16 rounded-lg object-cover"
            src={product[0]?.images?.[0]}
            alt="product_image.png"
          />
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

        {/* Fixed: missing space between the conditional class and "flex"
            meant this badge never actually got flex layout applied. */}
        <div
          className={`${
            isActive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-red-500"
          } flex rounded-full px-5 py-1 font-medium text-sm`}
        >
          <span>{isActive ? "Active" : "Inactive"}</span>
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
          label="Cost Price"
          name="costPrice"
          labelClassName="text-xs"
          onChange={(e) => setCostPrice(e.target.value)}
          value={costPrice}
          icon={<FaRupeeSign size={20} />}
          placeholder={0.0}
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

        <div className="flex flex-col gap-1 col-span-2">
          <Toggler
            label="Active"
            labelClassName="text-xs"
            name="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={belowImageMinimum}
          />
          {belowImageMinimum && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Needs at least {MIN_ACTIVE_IMAGES} images before it can be set
              active — currently has {imageCount}.
            </span>
          )}
        </div>

        {error && (
          <span className="col-span-2 text-red-500 text-sm font-medium">
            {error}
          </span>
        )}

        <div className="flex justify-end items-end m-2 col-span-2">
          <button
            type="button"
            onClick={handleUpdateProduct}
            className="flex flex-row gap-2 w-full justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
