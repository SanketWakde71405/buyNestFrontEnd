
export const validateLogoFile = (file, acceptedTypes, maxSizeMB) => {
  if (!file) return null;

  if (!acceptedTypes.includes(file.type)) {
    return "Please upload a JPG, PNG or WebP file.";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File is too large. Max size is ${maxSizeMB}MB.`;
  }
  return null;
};


export const buildSupplierPayload = (
  supplierMode,
  selectedSupplierId,
  newSupplier,
) => {
  switch (supplierMode) {
    case "none":
      return null;
    case "existing":
      return selectedSupplierId || undefined;
    case "new": {
      const supplierName = newSupplier.supplierName.trim();
      if (!supplierName) return undefined;
      const { email, phone, address } = newSupplier.contactDetails;
      return {
        supplierName,
        contactPerson: newSupplier.contactPerson.trim() || undefined,
        contactDetails: {
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
      };
    }
    case "unchanged":
    default:
      return undefined;
  }
};

export const validateBrandForm = (
  formData,
  supplierMode,
  selectedSupplierId,
  newSupplier,
) => {
  const errors = {};

  if (!formData.name.trim()) errors.name = "Brand name is required.";
  if (!formData.slug.trim()) errors.slug = "Slug is required.";

  if (supplierMode === "existing" && !selectedSupplierId) {
    errors.supplier = "Select a supplier from the list.";
  }
  if (supplierMode === "new" && !newSupplier.supplierName.trim()) {
    errors.supplier = "Supplier name is required.";
  }

  return errors;
};


export const diffCategoryIds = (originalCategoryIds, categoryDraft) => {
  const added = categoryDraft.filter((id) => !originalCategoryIds.includes(id));
  const removed = originalCategoryIds.filter(
    (id) => !categoryDraft.includes(id),
  );
  return { added, removed };
};

export const shouldShowCurrentLogo = (
  currentLogo,
  logoRemoved,
  logoPreview,
) => {
  return Boolean(currentLogo) && !logoRemoved && !logoPreview;
};
