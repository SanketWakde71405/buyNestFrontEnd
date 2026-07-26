import apiClient from "./ApiClient";

class CategoryApi {
  constructor() {
    this.basePath = "/api/v1/categories";
  }

  async getParentCategories() {
    const response = await apiClient.get(`${this.basePath}/parent-categories`);
    return response.data;
  }
}

export default new CategoryApi();
