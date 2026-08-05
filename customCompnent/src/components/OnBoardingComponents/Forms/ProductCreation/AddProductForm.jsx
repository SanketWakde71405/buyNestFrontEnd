import React, { useEffect, useState } from "react";

// Icons
import { IoPricetagOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { IoCubeOutline } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";

// Components
import InputBox from "../../../InputBox.jsx";
import Toggler from "../../../Toggler.jsx";
import FeatureInput from "../../../FeatureInput.jsx";

// Services
import ProductApi from "../../../../services/ProductApi.js";

// Constants
const initialProductData = {
  title: "",
  slug: "",
  description: "",
  category: [],
  features: [],
  price: 0.0,
  stock: 0,
  quantity: 0,
  images: [],
  brand: "",
  discountPrice: 0.0,
  isActive: true,
};

function AddProductForm({ brandId, categoryIds, onProductCreated }) {
  const [productData, setProductData] = useState(() => ({
    ...initialProductData,
    brand: brandId || "",
    category: categoryIds || [],
  }));
  const [error, setError] = useState("");

  // brandId/categoryIds come from the earlier onboarding steps and should
  // already be set by the time this step mounts — sync defensively in case
  // they resolve after the initial render.
  useEffect(() => {
    if (brandId && !productData.brand) {
      setProductData((prev) => ({ ...prev, brand: brandId }));
    }
  }, [brandId]);

  useEffect(() => {
    if (categoryIds?.length && productData.category.length === 0) {
      setProductData((prev) => ({ ...prev, category: categoryIds }));
    }
  }, [categoryIds]);

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setProductData((prev) => {
      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });

    if (error) {
      setError("");
    }
  };

  const handleAddFeature = (feature) => {
    setProductData((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));
  };

  const handleRemoveFeature = (index) => {
    setProductData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ProductApi.addProduct(productData);
      const product = response?.data || response;
      onProductCreated?.(product);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while adding the product.",
      );
    }
  };

  return (
    <div className="flex flex-col items-stretch my-3 flex-1 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-zinc-800 text-lg text-start font-semibold dark:text-gray-200">
          Add New Product
        </span>
        <span className="text-gray-500 text-sm text-start font-medium dark:text-gray-400">
          Fill in the details of your first product to get started. You can
          always edit or add more products later.
        </span>
      </div>

      {/* Form */}
      <form className="flex flex-col gap-2 my-2" onSubmit={handleSubmit}>
        <InputBox
          label="Product Name"
          labelClassName="text-sm"
          icon={<IoPricetagOutline size={20} />}
          placeholder="Enter product name"
          value={productData.title}
          onChange={handleChange}
          notOptional
          name="title"
          type="text"
        />
        <InputBox
          label="Product Slug"
          labelClassName="text-sm"
          icon={<IoIosLink size={20} />}
          placeholder="Enter product slug (unique identifier)"
          value={productData.slug}
          onChange={handleChange}
          notOptional
          name="slug"
          type="text"
        />

        <InputBox
          label="Description"
          name="description"
          labelClassName="text-sm"
          placeholder="Enter product description"
          multiline
          maxLength={1000}
          rows={6}
          icon={<LuNotepadText size={20} />}
          value={productData.description}
          onChange={handleChange}
          notOptional
          type="text"
        />

        <div className="flex flex-row gap-2">
          <InputBox
            label="Product Price"
            labelClassName="text-sm"
            icon={<FaIndianRupeeSign size={20} />}
            placeholder="0.0"
            value={productData.price}
            onChange={handleChange}
            notOptional
            name="price"
            type="number"
          />
          <InputBox
            label="Discount Price"
            labelClassName="text-sm"
            icon={<FaIndianRupeeSign size={20} />}
            placeholder="0.0"
            value={productData.discountPrice}
            onChange={handleChange}
            notOptional
            name="discountPrice"
            type="number"
          />
        </div>
        <div className="flex flex-row gap-2">
          <InputBox
            label="Stock"
            labelClassName="text-sm"
            icon={<IoCubeOutline size={20} />}
            placeholder="Enter stock quantity"
            value={productData.stock}
            onChange={handleChange}
            notOptional
            name="stock"
            type="number"
          />

          <Toggler
            label="Status"
            labelClassName="text-sm"
            name="isActive"
            checked={productData.isActive}
            onChange={handleChange}
          />
        </div>

        <FeatureInput
          label="Product Features"
          labelClassName="text-sm"
          placeholder="Type a feature and click add"
          features={productData.features}
          onAdd={handleAddFeature}
          onRemove={handleRemoveFeature}
        />
        <button
          type="submit"
          className="text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 flex gap-2 w-full justify-center items-center font-medium my-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Save &amp; Continue</span>
          <IoIosArrowRoundForward size={20} />
        </button>
      </form>

      {error && (
        <span className="text-red-500 text-sm text-start font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

export default AddProductForm;
