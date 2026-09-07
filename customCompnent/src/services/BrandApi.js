import apiClient from "./ApiClient";

class BrandApi {
  constructor() {
    this.basePath = "/api/v1/brands";
  }

  async getBrandForCategories(categoryId) {
    const response = await apiClient.get(
      `${this.basePath}/category/${categoryId}`,
    );
    return response.data;
  }

  async createBrand({
    name,
    slug,
    description,
    categories,
    supplier,
    website,
    countryOfOrigin,
    yearEstablished,
  }) {
    const response = await apiClient.post(`${this.basePath}/add-brand`, {
      name,
      slug,
      description,
      categories,
      supplier,
      website,
      countryOfOrigin,
      yearEstablished,
    });
    return response.data;
  }
  async getBrandById(brandId) {
    const response = await apiClient.get(`${this.basePath}/${brandId}`);
    return response.data;
  }

  async updateBrandLogo(brandId, file) {
    const formData = new FormData();
    formData.append("brandId", brandId);
    formData.append("logo", file);

    const response = await apiClient.patch(
      `${this.basePath}/update-brand-logo`,
      formData,
    );
    return response.data;
  }

  async getAllBrands() {
    const response = await apiClient.get(`${this.basePath}/`);
    return response.data;
  }

  async updateBrandDetails({
    brandId,
    name,
    slug,
    description,
    supplier,
    website,
    countryOfOrigin,
    yearEstablished,
  }) {
    const response = await apiClient.put(
      `${this.basePath}/update-brand-details/${brandId}`,
      {
        name,
        slug,
        description,
        supplier,
        website,
        countryOfOrigin,
        yearEstablished,
      },
    );
    return response.data;
  }

  async addCategoriesToBrand({ brandId, categoryIds }) {
    const response = await apiClient.patch(`${this.basePath}/add-categories`, {
      brandId,
      categoryIds,
    });
    return response.data;
  }

  async deleteCategoriesFromBrand({ brandId, categoryIds }) {
    // axios' delete() takes the request body under a `data` key, not as a
    // second positional argument.
    const response = await apiClient.delete(
      `${this.basePath}/delete-categories`,
      {
        data: { brandId, categoryIds },
      },
    );
    return response.data;
  }

  async deleteBrand(brandId) {
    const response = await apiClient.delete(`${this.basePath}/${brandId}`);
    return response.data;
  }
}

export default new BrandApi();
