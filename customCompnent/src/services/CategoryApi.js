import apiClient from "./ApiClient";

class CategoryApi {
  constructor() {
    this.basePath = "/api/v1/categories";
  }

  async createCategory(categoryData) {
    const response = await apiClient.post(
      `${this.basePath}/add-categories`,
      categoryData,
    );
    return response.data;
  }

  async getCategories() {
    const response = await apiClient.get(`${this.basePath}/list-categories`);
    return response.data;
  }

  async getParentCategories() {
    const response = await apiClient.get(`${this.basePath}/parent-categories`);
    return response.data;
  }

  async getCategoriesForStore() {
    const response = await apiClient.get(`${this.basePath}/store`);
    return response.data;
  }

  async getCategoryById(categoryId) {
    const response = await apiClient.get(`${this.basePath}/${categoryId}`);
    return response.data;
  }

  async getSubCategories(parentCategoryId) {
    const response = await apiClient.get(
      `${this.basePath}/sub-categories/${parentCategoryId}`,
    );
    return response.data;
  }

  async updateCategory(categoryId, categoryData) {
    const response = await apiClient.patch(
      `${this.basePath}/${categoryId}`,
      categoryData,
    );
    return response.data;
  }

  // parentCategory: null for reordering top-level categories, or a
  // category id for reordering its subcategories.
  // orderedCategoryIds: full array of sibling ids in the desired order —
  // must exactly match the current siblings under that parent.
  async reorderCategories(parentCategory, orderedCategoryIds) {
    const response = await apiClient.patch(`${this.basePath}/reorder`, {
      parentCategory,
      orderedCategoryIds,
    });
    return response.data;
  }

  async deleteCategory(categoryId) {
    const response = await apiClient.delete(`${this.basePath}/${categoryId}`);
    return response.data;
  }

  async getBrandsForCategory(categoryId) {
    const response = await apiClient.post(`${this.basePath}/brands`, {
      categoryId,
    });
    return response.data;
  }
}

export default new CategoryApi();
