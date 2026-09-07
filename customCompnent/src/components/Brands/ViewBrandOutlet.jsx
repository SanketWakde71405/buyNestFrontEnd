import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { IoPricetagOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoBusinessOutline } from "react-icons/io5";
import { IoLinkOutline } from "react-icons/io5";
import { IoLocationOutline } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";

// Services
import BrandApi from "../../services/BrandApi.js";

// Components
import SectionCard from "../SectionCard.jsx";

// Utils
import { formatDate } from "../../utils/commonFunctions.js";

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-zinc-800 dark:text-gray-100 text-right ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ViewBrandOutlet() {
  // Hooks and params
  const navigate = useNavigate();
  const { brandId } = useParams();

  // Use states
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // useEffects
  useEffect(() => {
    let cancelled = false;

    const loadBrand = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await BrandApi.getBrandById(brandId);
        if (cancelled) return;
        if (!data) throw new Error("Brand not found.");
        setBrand(data);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load brand.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBrand();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading brand…
        </p>
      </div>
    );
  }

  if (loadError || !brand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-red-500">
          {loadError || "Brand not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/brands")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 dark:border-slate-800 dark:text-gray-300"
        >
          Back to Brands
        </button>
      </div>
    );
  }

  const categories = brand.categories || [];
  const supplier = brand.supplier || null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
          >
            <IoArrowBack size={16} /> Back to Brands
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/brands/edit/${brandId}`)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <IoCreateOutline size={16} /> Edit Brand
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        {/* Page heading */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoEyeOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              Brand Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View detailed information about this brand.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <SectionCard
              icon={IoPricetagOutline}
              title="Brand Logo"
              description="Logo shown to customers for this brand."
            >
              <div className="flex items-center justify-center rounded-xl border border-gray-100 py-8 dark:border-slate-800">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-24 w-24 object-contain"
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={IoDocumentTextOutline}
              title={brand.name}
              description={brand.slug}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {categories.map((cat, i) => (
                  <span
                    key={cat._id || cat || i}
                    className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-slate-800 dark:text-violet-300"
                  >
                    {cat.name || cat}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed text-zinc-600 dark:text-gray-300">
                {brand.description || "No description provided."}
              </p>
            </SectionCard>

            <SectionCard
              icon={IoBusinessOutline}
              title="Additional Information"
              description="Website, origin and establishment year."
            >
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <DetailRow
                  label="Website"
                  value={
                    brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <IoLinkOutline size={14} />
                        {brand.website}
                      </a>
                    ) : (
                      "Not set"
                    )
                  }
                />
                <DetailRow
                  label="Country of Origin"
                  value={brand.countryOfOrigin || "Not set"}
                />
                <DetailRow
                  label="Year Established"
                  value={brand.yearEstablished || "Not set"}
                />
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <SectionCard
              icon={IoBusinessOutline}
              title="Categories"
              description="Categories this brand is tagged under."
            >
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, i) => (
                    <span
                      key={cat._id || cat || i}
                      className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-slate-800 dark:text-indigo-300"
                    >
                      {cat.name || cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No categories assigned.
                </p>
              )}
            </SectionCard>

            <SectionCard
              icon={IoPersonOutline}
              title="Supplier"
              description="Who this brand is sourced from."
            >
              {supplier ? (
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  <DetailRow label="Name" value={supplier.supplierName} />
                  {supplier.contactPerson && (
                    <DetailRow
                      label="Contact Person"
                      value={supplier.contactPerson}
                    />
                  )}
                  {supplier.contactDetails?.email && (
                    <DetailRow
                      label="Email"
                      value={
                        <span className="inline-flex items-center gap-1">
                          <IoMailOutline size={14} />
                          {supplier.contactDetails.email}
                        </span>
                      }
                    />
                  )}
                  {supplier.contactDetails?.phone && (
                    <DetailRow
                      label="Phone"
                      value={
                        <span className="inline-flex items-center gap-1">
                          <IoCallOutline size={14} />
                          {supplier.contactDetails.phone}
                        </span>
                      }
                    />
                  )}
                  {supplier.contactDetails?.address && (
                    <DetailRow
                      label="Address"
                      value={
                        <span className="inline-flex items-center gap-1">
                          <IoLocationOutline size={14} />
                          {supplier.contactDetails.address}
                        </span>
                      }
                      valueClassName="max-w-[60%]"
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No supplier assigned.
                </p>
              )}
            </SectionCard>

            <SectionCard
              icon={IoTimeOutline}
              title="Timestamps"
              description="When this brand was added and last changed."
            >
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <DetailRow
                  label="Added On"
                  value={formatDate(brand.createdAt)}
                />
                <DetailRow
                  label="Last Updated"
                  value={formatDate(brand.updatedAt)}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
